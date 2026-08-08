import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#050914" }}>
      <div className="text-center max-w-md">
        <div className="text-8xl font-black mb-2" style={{
          background: "linear-gradient(135deg, #7c3aed, #14b8a6)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          404
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white"
          style={{ background: "linear-gradient(135deg, #7c3aed, #14b8a6)" }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
