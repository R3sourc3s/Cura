"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";

interface WoundRecord {
  id: number;
  wound_type: string;
  grade: string;
  body_side: string;
  location_x: number;
  location_y: number;
  is_active: boolean;
}

export interface BodySceneProps {
  side: string;
  wounds: WoundRecord[];
  selectedWoundId: number | null;
  canPlace: boolean;
  gender?: "male" | "female";
  onBodyClick: (x: number, y: number) => void;
  onWoundClick: (w: WoundRecord) => void;
}

const BODY_IMAGES: Record<string, string> = {
  "front":      "/models/body-front.png",
  "back":       "/models/body-back.png",
  "left":       "/models/body-left.png",
  "right":      "/models/body-right.png",
  "head-front": "/models/head-front.png",
  "head-back":  "/models/head-back.png",
  "head-left":  "/models/head-left.png",
  "head-right": "/models/head-right.png",
  "head-top":   "/models/head-top.png",
};

function gradeColor(grade: string): string {
  if (grade === "1") return "#34d399";
  if (grade === "2") return "#fbbf24";
  if (grade === "3") return "#fb923c";
  if (grade === "4" || grade === "unstageable") return "#f87171";
  return "#a78bfa";
}

interface ImgBounds { left: number; top: number; width: number; height: number; }
interface BodyMask  { data: Uint8Array; w: number; h: number; }

// The body images are outline drawings: dark outline on white background,
// white interior. After CSS invert(1) for display, the outline appears white
// and the enclosed interior appears dark (same as background visually).
//
// Strategy: flood-fill from the image edges through white (non-outline) pixels
// to identify exterior background. Anything NOT reached = enclosed body interior
// or outline = clickable.
//
// The bottom row is sealed before flood-fill to prevent leakage through open
// silhouettes (e.g. head/neck images where the outline trails off the bottom).
function buildMask(src: string, isHead: boolean): Promise<BodyMask | null> {
  return new Promise(resolve => {
    const img = new Image();
    // No crossOrigin: same-origin files don't need it and adding it breaks
    // loading when the dev server doesn't send CORS headers.
    img.onload = () => {
      try {
        // Use a large enough canvas so thin outline lines survive downscaling.
        const H = Math.min(img.naturalHeight, 512);
        const W = Math.round(img.naturalWidth / img.naturalHeight * H);
        if (!W || !H) return resolve(null);

        const canvas = document.createElement("canvas");
        canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, W, H);
        const raw = ctx.getImageData(0, 0, W, H).data;

        // outline[i] = 1 for dark pixels (outline), 0 for light (interior/exterior)
        const outline = new Uint8Array(W * H);
        for (let i = 0; i < W * H; i++) {
          outline[i] = raw[i * 4] < 200 ? 1 : 0;
        }

        // Dilate outline by 1 px to close any gaps left by antialiasing/downscaling.
        const closed = new Uint8Array(W * H);
        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            const i = y * W + x;
            closed[i] = (
              outline[i] ||
              (x > 0     && outline[i - 1]) ||
              (x < W - 1 && outline[i + 1]) ||
              (y > 0     && outline[i - W]) ||
              (y < H - 1 && outline[i + W])
            ) ? 1 : 0;
          }
        }

        // Seal the bottom N% so open silhouettes (neck/shoulders trailing off)
        // don't let the exterior flood into the body interior.
        // Head views need a larger seal (~30%) because neck/shoulders span more rows.
        const sealFraction = isHead ? 0.30 : 0.05;
        const sealStart = Math.floor(H * (1 - sealFraction));
        for (let y = sealStart; y < H; y++)
          for (let x = 0; x < W; x++) closed[y * W + x] = 1;

        // Flood-fill exterior from the top row + left/right columns.
        const exterior = new Uint8Array(W * H);
        const stack: number[] = [];

        const visit = (i: number) => {
          if (i < 0 || i >= W * H) return;
          if (closed[i] === 1 || exterior[i] === 1) return;
          exterior[i] = 1;
          stack.push(i);
        };

        for (let x = 0; x < W; x++) visit(x);               // top row
        for (let y = 0; y < H; y++) visit(y * W);            // left column
        for (let y = 0; y < H; y++) visit(y * W + W - 1);    // right column

        while (stack.length) {
          const i = stack.pop()!;
          const x = i % W, y = Math.floor(i / W);
          if (x > 0)   visit(i - 1);
          if (x < W-1) visit(i + 1);
          if (y > 0)   visit(i - W);
          if (y < H-1) visit(i + W);
        }

        // Body = closed-outline pixels + interior pixels not reached by exterior flood.
        const data = new Uint8Array(W * H);
        for (let i = 0; i < W * H; i++) {
          data[i] = (closed[i] === 1 || exterior[i] === 0) ? 1 : 0;
        }

        resolve({ data, w: W, h: H });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function isOnBody(mask: BodyMask, xPct: number, yPct: number): boolean {
  const px = Math.max(0, Math.min(mask.w - 1, Math.floor(xPct / 100 * mask.w)));
  const py = Math.max(0, Math.min(mask.h - 1, Math.floor(yPct / 100 * mask.h)));
  return mask.data[py * mask.w + px] === 1;
}

export default function BodyScene({
  side, wounds, selectedWoundId, canPlace, onBodyClick, onWoundClick,
}: BodySceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef       = useRef<HTMLImageElement>(null);
  const maskRef      = useRef<BodyMask | null>(null);
  const [bounds, setBounds] = useState<ImgBounds | null>(null);

  const measure = useCallback(() => {
    if (!imgRef.current || !containerRef.current) return;
    const cr = containerRef.current.getBoundingClientRect();
    const ir = imgRef.current.getBoundingClientRect();
    if (ir.width === 0 || ir.height === 0) return;
    setBounds({ left: ir.left - cr.left, top: ir.top - cr.top, width: ir.width, height: ir.height });
  }, []);

  useEffect(() => {
    maskRef.current = null;
    setBounds(null);
    const src = BODY_IMAGES[side];
    if (src) buildMask(src, side.startsWith("head-")).then(m => { maskRef.current = m; });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [side, measure]);

  const handleLoad = useCallback(() => { measure(); }, [measure]);

  const imageCoords = useCallback((clientX: number, clientY: number): [number, number] | null => {
    if (!bounds || !containerRef.current) return null;
    const cr = containerRef.current.getBoundingClientRect();
    const x = ((clientX - cr.left) - bounds.left) / bounds.width  * 100;
    const y = ((clientY - cr.top)  - bounds.top)  / bounds.height * 100;
    if (x < 0 || x > 100 || y < 0 || y > 100) return null;
    return [x, y];
  }, [bounds]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!canPlace) return;
    const coords = imageCoords(e.clientX, e.clientY);
    if (!coords) return;
    const [x, y] = coords;
    if (maskRef.current && !isOnBody(maskRef.current, x, y)) return;
    onBodyClick(+x.toFixed(1), +y.toFixed(1));
  }, [canPlace, imageCoords, onBodyClick]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !canPlace) return;
    const coords = imageCoords(e.clientX, e.clientY);
    const onBody = coords !== null && (!maskRef.current || isOnBody(maskRef.current, coords[0], coords[1]));
    containerRef.current.style.cursor = onBody ? "crosshair" : "default";
  }, [canPlace, imageCoords]);

  const handleMouseLeave = useCallback(() => {
    if (containerRef.current) containerRef.current.style.cursor = "default";
  }, []);

  const visible = wounds.filter(w => w.body_side === side);
  const imgSrc  = BODY_IMAGES[side];

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: "relative", width: "100%", height: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#0a101e", overflow: "hidden",
      }}
    >
      {imgSrc && (
        <img
          ref={imgRef}
          key={side}
          src={imgSrc}
          alt={`${side} view`}
          onLoad={handleLoad}
          draggable={false}
          style={{
            height: "100%", width: "auto", maxWidth: "100%", display: "block",
            filter: "invert(1)", mixBlendMode: "screen",
            userSelect: "none", pointerEvents: "none",
          }}
        />
      )}

      {bounds && visible.map(w => {
        const isSelected = w.id === selectedWoundId;
        const color = gradeColor(w.grade);
        const px = bounds.left + (w.location_x / 100) * bounds.width;
        const py = bounds.top  + (w.location_y / 100) * bounds.height;
        const size = isSelected ? 20 : 13;
        return (
          <div
            key={w.id}
            onClick={e => { e.stopPropagation(); onWoundClick(w); }}
            title={`${w.wound_type} · Grade ${w.grade}`}
            style={{
              position: "absolute", left: px, top: py,
              width: size, height: size,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%", background: color,
              border: `2px solid ${isSelected ? "#fff" : "rgba(255,255,255,0.55)"}`,
              opacity: w.is_active ? 1 : 0.4,
              boxShadow: isSelected
                ? `0 0 0 5px ${color}38, 0 0 14px ${color}90`
                : "0 1px 5px rgba(0,0,0,0.55)",
              cursor: "pointer", zIndex: 10, transition: "all 0.15s",
            }}
          />
        );
      })}

      {canPlace && (
        <div style={{
          position: "absolute", bottom: 10, left: "50%",
          transform: "translateX(-50%)", fontSize: 11,
          color: "rgba(255,255,255,0.3)", pointerEvents: "none", whiteSpace: "nowrap",
        }}>
          Click body to place wound
        </div>
      )}
    </div>
  );
}
