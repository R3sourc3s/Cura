"use client";

import { useEffect, useState, useCallback } from "react";
import { Table2, ChevronLeft, ChevronRight, CheckCircle, Clock, XCircle } from "lucide-react";

interface Medication {
  id: number; drug_name: string; dosage: string; route: string;
  frequency: string; scheduled_times: string[];
  recent_mar: MAREntry[];
}
interface MAREntry {
  id: number; medication: number; administered_at: string;
  status: "given" | "refused" | "omitted" | "pending";
  administered_by_name?: string; notes: string;
}
interface Resident { id: number; full_name: string; }

const STATUS_CFG = {
  given:   { icon: CheckCircle, color:"#34d399", bg:"rgba(52,211,153,0.15)",  label:"Given" },
  pending: { icon: Clock,       color:"#fb923c", bg:"rgba(251,146,60,0.15)",  label:"Pending" },
  refused: { icon: XCircle,     color:"#f87171", bg:"rgba(239,68,68,0.15)",   label:"Refused" },
  omitted: { icon: XCircle,     color:"#a78bfa", bg:"rgba(124,58,237,0.15)",  label:"Omitted" },
};

function isoDate(d: Date) { return d.toISOString().slice(0,10); }
const inputStyle = { background:"var(--input-bg)", border:"1px solid var(--border-strong)", color:"var(--text-primary)" };

export default function MARPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedResident, setSelectedResident] = useState<number | "">("");
  const [date, setDate] = useState(isoDate(new Date()));
  const [medications, setMedications] = useState<Medication[]>([]);
  const [marEntries, setMarEntries] = useState<MAREntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/v1/residents/?page_size=200&is_active=true", { credentials:"include" })
      .then(r => r.ok ? r.json() : { results:[] })
      .then(d => setResidents(d.results ?? d));
  }, []);

  const load = useCallback(() => {
    if (!selectedResident) { setMedications([]); setMarEntries([]); return; }
    setLoading(true);
    Promise.all([
      fetch(`/api/v1/medications/?resident=${selectedResident}&is_active=true&page_size=50`, { credentials:"include" }).then(r => r.ok ? r.json() : { results:[] }),
      fetch(`/api/v1/medications/mar/?resident=${selectedResident}&date=${date}&page_size=200`, { credentials:"include" }).then(r => r.ok ? r.json() : { results:[] }),
    ]).then(([m, mar]) => {
      setMedications(m.results ?? m);
      setMarEntries(mar.results ?? mar);
    }).catch(console.error).finally(() => setLoading(false));
  }, [selectedResident, date]);

  useEffect(() => { load(); }, [load]);

  function prevDay() { const d = new Date(date); d.setDate(d.getDate()-1); setDate(isoDate(d)); }
  function nextDay() { const d = new Date(date); d.setDate(d.getDate()+1); setDate(isoDate(d)); }

  function getEntryForSlot(medId: number, time: string): MAREntry | undefined {
    return marEntries.find(e => {
      if (e.medication !== medId) return false;
      const entryTime = new Date(e.administered_at).toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" });
      return entryTime === time.slice(0,5);
    });
  }

  const allTimes = Array.from(new Set(medications.flatMap(m => m.scheduled_times ?? []))).sort();

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:"rgba(96,165,250,0.12)", border:"1px solid rgba(96,165,250,0.2)" }}>
            <Table2 size={16} style={{ color:"#60a5fa" }} />
          </div>
          <div><h1 className="text-lg font-bold text-white">MAR Chart</h1><p className="text-xs" style={{ color:"var(--text-muted)" }}>Medication administration record</p></div>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedResident} onChange={e => setSelectedResident(e.target.value ? Number(e.target.value) : "")} className="text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
            <option value="">Select resident…</option>
            {residents.map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}
          </select>
          <div className="flex items-center gap-1">
            <button onClick={prevDay} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:"var(--input-bg)", border:"1px solid var(--bg-card-hover)" }}><ChevronLeft size={14} style={{ color:"var(--text-secondary)" }} /></button>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="text-sm px-3 py-1.5 rounded-lg outline-none" style={inputStyle} />
            <button onClick={nextDay} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:"var(--input-bg)", border:"1px solid var(--bg-card-hover)" }}><ChevronRight size={14} style={{ color:"var(--text-secondary)" }} /></button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-3 flex-wrap">
        {Object.entries(STATUS_CFG).map(([k, v]) => {
          const { icon: Icon } = v;
          return (
            <div key={k} className="flex items-center gap-1.5 text-xs" style={{ color:"var(--text-secondary)" }}>
              <Icon size={11} style={{ color:v.color }} />{v.label}
            </div>
          );
        })}
        <div className="flex items-center gap-1.5 text-xs" style={{ color:"var(--text-secondary)" }}>
          <div className="w-3 h-3 rounded" style={{ background:"var(--border)", border:"1px solid var(--border-strong)" }} /> Not due
        </div>
      </div>

      {!selectedResident ? (
        <div className="text-center py-20 rounded-2xl" style={{ background:"var(--bg-card)", border:"1px solid var(--border)" }}>
          <Table2 size={28} className="mx-auto mb-2" style={{ color:"var(--text-muted)" }} />
          <p className="text-sm" style={{ color:"var(--text-muted)" }}>Select a resident to view their MAR chart</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" /></div>
      ) : medications.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ background:"var(--bg-card)", border:"1px solid var(--border)" }}>
          <p className="text-sm" style={{ color:"var(--text-muted)" }}>No active medications for this resident.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-x-auto" style={{ border:"1px solid var(--border)" }}>
          <table className="w-full min-w-[600px]">
            <thead>
              <tr style={{ background:"var(--bg-card)", borderBottom:"1px solid var(--border)" }}>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color:"var(--text-muted)", minWidth:"200px" }}>Medication</th>
                {allTimes.length > 0 ? allTimes.map(t => (
                  <th key={t} className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-center" style={{ color:"var(--text-muted)" }}>{t.slice(0,5)}</th>
                )) : <th className="px-4 py-3 text-xs" style={{ color:"var(--text-muted)" }}>Times</th>}
              </tr>
            </thead>
            <tbody>
              {medications.map(med => (
                <tr key={med.id} style={{ borderBottom:"1px solid var(--bg-card)" }}>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-white">{med.drug_name}</div>
                    <div className="text-xs mt-0.5" style={{ color:"var(--text-muted)" }}>{med.dosage} · {med.route}</div>
                  </td>
                  {allTimes.length > 0 ? allTimes.map(t => {
                    const isScheduled = med.scheduled_times?.includes(t);
                    if (!isScheduled) {
                      return (
                        <td key={t} className="px-3 py-3 text-center">
                          <div className="w-8 h-8 rounded-lg mx-auto" style={{ background:"var(--bg-card)" }} />
                        </td>
                      );
                    }
                    const entry = getEntryForSlot(med.id, t);
                    const cfg = entry ? STATUS_CFG[entry.status] : null;
                    return (
                      <td key={t} className="px-3 py-3 text-center">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto" title={entry ? `${cfg?.label} by ${entry.administered_by_name ?? "—"}` : "Pending"}
                          style={{ background: cfg ? cfg.bg : "rgba(251,146,60,0.12)", border: `1px solid ${cfg ? cfg.color + "40" : "rgba(251,146,60,0.3)"}` }}>
                          {cfg ? <cfg.icon size={13} style={{ color:cfg.color }} /> : <Clock size={13} style={{ color:"#fb923c" }} />}
                        </div>
                      </td>
                    );
                  }) : (
                    <td className="px-4 py-3 text-xs" style={{ color:"var(--text-muted)" }}>
                      {med.scheduled_times?.join(", ") || med.frequency}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary counts */}
      {medications.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {Object.entries(STATUS_CFG).map(([k, v]) => {
            const count = marEntries.filter(e => e.status === k).length;
            if (count === 0) return null;
            return (
              <div key={k} className="text-xs px-3 py-1.5 rounded-xl" style={{ background:v.bg, color:v.color }}>
                <strong>{count}</strong> {v.label.toLowerCase()}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
