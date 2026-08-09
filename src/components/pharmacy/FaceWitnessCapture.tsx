"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, AlertTriangle, UserCheck, Loader2 } from "lucide-react";

interface StaffOption {
  id: number;
  full_name: string;
  avatar?: string | null;
}

interface Props {
  candidates: StaffOption[];
  onVerified: (result: { witnessId: number; method: "face_match" | "manual"; confidence: number | null; photoDataUrl: string | null }) => void;
}

const MODEL_BASE = "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights";
const SCRIPT_SRC = "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js";

// face-api.js attaches itself to window; we only need a loose shape here.
type FaceApiModule = {
  nets: {
    tinyFaceDetector: { loadFromUri: (uri: string) => Promise<void> };
    faceLandmark68Net: { loadFromUri: (uri: string) => Promise<void> };
    faceRecognitionNet: { loadFromUri: (uri: string) => Promise<void> };
  };
  detectSingleFace: (input: HTMLImageElement | HTMLVideoElement, options: unknown) => {
    withFaceLandmarks: () => { withFaceDescriptor: () => Promise<{ descriptor: Float32Array } | undefined> };
  };
  TinyFaceDetectorOptions: new () => unknown;
  euclideanDistance: (a: Float32Array | number[], b: Float32Array | number[]) => number;
};

declare global {
  interface Window {
    faceapi?: FaceApiModule;
  }
}

let modelLoadPromise: Promise<void> | null = null;

function loadFaceApi(): Promise<void> {
  if (modelLoadPromise) return modelLoadPromise;
  modelLoadPromise = new Promise((resolve, reject) => {
    if (window.faceapi) { resolve(); return; }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = async () => {
      try {
        const faceapi = window.faceapi!;
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_BASE),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_BASE),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_BASE),
        ]);
        resolve();
      } catch (err) { reject(err); }
    };
    script.onerror = () => reject(new Error("Failed to load face recognition library"));
    document.head.appendChild(script);
  });
  return modelLoadPromise;
}

const MATCH_THRESHOLD = 0.55; // face-api.js Euclidean distance — lower = more similar

/**
 * Client-side, privacy-preserving facial verification for controlled-drug witnessing.
 * Runs entirely in-browser (no image ever leaves the device for matching); compares a
 * live webcam capture against the selected witness's stored profile photo using
 * face-api.js. Falls back to manual sign-off if no camera, no reference photo, or the
 * model fails to load — this is an assistive safeguard, not a hard gate.
 */
export default function FaceWitnessCapture({ candidates, onVerified }: Props) {
  const [witnessId, setWitnessId] = useState<number | "">("");
  const [stage, setStage] = useState<"idle" | "loading-model" | "camera" | "comparing" | "matched" | "no-match" | "error">("idle");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const witness = candidates.find(c => c.id === witnessId);

  useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()); }, []);

  async function startVerification() {
    if (!witness) return;
    setErrorMsg("");
    setStage("loading-model");
    try {
      await loadFaceApi();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      streamRef.current = stream;
      setStage("camera");
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch {
      setErrorMsg("Camera or face-recognition model unavailable — use manual sign-off instead.");
      setStage("error");
    }
  }

  async function capture() {
    if (!witness?.avatar || !videoRef.current) return;
    setStage("comparing");
    try {
      const faceapi = window.faceapi!;
      const video = videoRef.current;

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      const photoDataUrl = canvas.toDataURL("image/jpeg", 0.85);

      const liveImg = new Image();
      liveImg.src = photoDataUrl;
      await new Promise((r) => { liveImg.onload = r; });

      const refImg = new Image();
      refImg.crossOrigin = "anonymous";
      refImg.src = witness.avatar;
      await new Promise((r, rej) => { refImg.onload = r; refImg.onerror = rej; });

      const [liveResult, refResult] = await Promise.all([
        faceapi.detectSingleFace(liveImg, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor(),
        faceapi.detectSingleFace(refImg, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor(),
      ]);

      streamRef.current?.getTracks().forEach(t => t.stop());

      if (!liveResult || !refResult) {
        setErrorMsg("Could not detect a clear face — try better lighting, or use manual sign-off.");
        setStage("error");
        return;
      }

      const distance = faceapi.euclideanDistance(liveResult.descriptor, refResult.descriptor);
      const score = Math.max(0, 1 - distance);
      setConfidence(score);

      if (distance <= MATCH_THRESHOLD) {
        setStage("matched");
        onVerified({ witnessId: witness.id, method: "face_match", confidence: score, photoDataUrl });
      } else {
        setStage("no-match");
      }
    } catch {
      setErrorMsg("Face verification failed — use manual sign-off instead.");
      setStage("error");
    }
  }

  function manualConfirm() {
    if (!witness) return;
    streamRef.current?.getTracks().forEach(t => t.stop());
    onVerified({ witnessId: witness.id, method: "manual", confidence: null, photoDataUrl: null });
  }

  return (
    <div className="rounded-xl p-3.5 space-y-3" style={{ background: "rgba(13,148,136,0.05)", border: "1px solid rgba(13,148,136,0.2)" }}>
      <div className="flex items-center gap-2">
        <UserCheck size={14} style={{ color: "var(--c-teal2)" }} />
        <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Second-signature witness</span>
      </div>

      <select
        value={witnessId}
        onChange={(e) => { setWitnessId(e.target.value ? Number(e.target.value) : ""); setStage("idle"); setErrorMsg(""); }}
        className="w-full text-sm px-3 py-2 rounded-xl outline-none"
        style={{ background: "rgba(var(--fg-rgb),0.05)", border: "1px solid rgba(var(--fg-rgb),0.1)", color: "rgba(var(--fg-rgb),0.8)" }}
      >
        <option value="">Select witnessing staff member…</option>
        {candidates.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
      </select>

      {witness && stage === "idle" && (
        <div className="flex gap-2">
          {witness.avatar ? (
            <button type="button" onClick={startVerification}
              className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg"
              style={{ background: "rgba(13,148,136,0.15)", color: "var(--c-teal2)" }}>
              <Camera size={13} /> Verify with camera
            </button>
          ) : (
            <p className="flex-1 text-xs px-2 py-2" style={{ color: "rgba(var(--fg-rgb),0.4)" }}>
              No profile photo on file for facial verification.
            </p>
          )}
          <button type="button" onClick={manualConfirm}
            className="px-3 py-2 text-xs font-semibold rounded-lg"
            style={{ background: "rgba(var(--fg-rgb),0.06)", color: "rgba(var(--fg-rgb),0.6)" }}>
            Manual sign-off
          </button>
        </div>
      )}

      {stage === "loading-model" && (
        <div className="flex items-center gap-2 text-xs py-2" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>
          <Loader2 size={13} className="animate-spin" /> Loading face verification model…
        </div>
      )}

      {stage === "camera" && (
        <div className="space-y-2">
          <video ref={videoRef} autoPlay muted playsInline className="w-full rounded-lg" style={{ maxHeight: 180, objectFit: "cover", background: "#000" }} />
          <button type="button" onClick={capture}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg text-white"
            style={{ background: "#0d9488" }}>
            <Camera size={13} /> Capture &amp; verify
          </button>
        </div>
      )}

      {stage === "comparing" && (
        <div className="flex items-center gap-2 text-xs py-2" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>
          <Loader2 size={13} className="animate-spin" /> Comparing faces…
        </div>
      )}

      {stage === "matched" && (
        <div className="flex items-center gap-2 text-xs py-2 px-3 rounded-lg" style={{ background: "rgba(52,211,153,0.1)", color: "var(--c-green)" }}>
          <CheckCircle2 size={14} /> Verified — {confidence !== null ? `${Math.round(confidence * 100)}% match` : "match confirmed"}
        </div>
      )}

      {stage === "no-match" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs py-2 px-3 rounded-lg" style={{ background: "rgba(239,68,68,0.1)", color: "var(--c-red)" }}>
            <AlertTriangle size={14} /> Face did not match {witness?.full_name}&apos;s profile photo ({confidence !== null ? `${Math.round(confidence * 100)}%` : "low"} similarity).
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={startVerification} className="flex-1 py-2 text-xs font-semibold rounded-lg"
              style={{ background: "rgba(13,148,136,0.15)", color: "var(--c-teal2)" }}>Try again</button>
            <button type="button" onClick={manualConfirm} className="flex-1 py-2 text-xs font-semibold rounded-lg"
              style={{ background: "rgba(var(--fg-rgb),0.06)", color: "rgba(var(--fg-rgb),0.6)" }}>Override — manual sign-off</button>
          </div>
        </div>
      )}

      {stage === "error" && (
        <div className="space-y-2">
          <p className="text-xs px-1" style={{ color: "var(--c-amber)" }}>{errorMsg}</p>
          <button type="button" onClick={manualConfirm} className="w-full py-2 text-xs font-semibold rounded-lg"
            style={{ background: "rgba(var(--fg-rgb),0.06)", color: "rgba(var(--fg-rgb),0.6)" }}>Manual sign-off</button>
        </div>
      )}
    </div>
  );
}
