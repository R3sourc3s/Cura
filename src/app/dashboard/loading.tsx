export default function DashboardLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-40 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.07)" }} />
          <div className="h-4 w-56 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
        </div>
        <div className="h-9 w-28 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl p-5 h-32 animate-pulse" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-2xl h-64 animate-pulse" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }} />
        ))}
      </div>
    </div>
  );
}
