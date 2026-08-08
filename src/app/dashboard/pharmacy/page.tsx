"use client";

import { useEffect, useState, useCallback } from "react";
import { Package, Plus, X, Search, ChevronDown, AlertTriangle, FlaskConical, Building2 } from "lucide-react";
import { useToast } from "@/components/Toast";
import EmptyState from "@/components/ui/EmptyState";

interface MedicationStock {
  id: number;
  care_home: number;
  medication_name: string;
  supplier: number | null;
  supplier_name?: string;
  quantity_on_hand: string;
  unit: string;
  reorder_threshold: string;
  last_restocked: string | null;
  updated_at: string;
  is_low_stock: boolean;
}

interface ControlledDrug {
  id: number;
  care_home: number;
  medication_name: string;
  resident: number | null;
  resident_name?: string;
  entry_type: "received" | "administered" | "destroyed" | "returned";
  quantity: string;
  balance_after: string;
  witnessed_by: number | null;
  witnessed_by_name?: string;
  recorded_by: number | null;
  recorded_by_name?: string;
  recorded_at: string;
  notes: string;
  created_at: string;
}

interface Supplier {
  id: number;
  care_home: number;
  name: string;
  contact_name: string;
  phone: string;
  email: string;
  address: string;
  is_active: boolean;
  created_at: string;
}

interface Resident { id: number; full_name: string; }

type Tab = "stock" | "controlled" | "suppliers";

const ENTRY_TYPE_CFG = {
  received:     { label: "Received",     color: "var(--c-green)", bg: "rgba(52,211,153,0.12)" },
  administered: { label: "Administered", color: "var(--c-teal2)", bg: "rgba(45, 212, 191,0.12)" },
  destroyed:    { label: "Destroyed",    color: "var(--c-red)", bg: "rgba(239,68,68,0.12)"  },
  returned:     { label: "Returned",     color: "var(--c-amber)", bg: "rgba(251,191,36,0.12)" },
} as const;

const inputStyle = {
  background: "rgba(var(--fg-rgb),0.05)",
  border: "1px solid rgba(var(--fg-rgb),0.1)",
  color: "rgba(var(--fg-rgb),0.8)",
} as const;

export default function PharmacyPage() {
  const [tab, setTab] = useState<Tab>("stock");

  // Stock
  const [stock, setStock] = useState<MedicationStock[]>([]);
  const [stockLoading, setStockLoading] = useState(true);
  const [stockSearch, setStockSearch] = useState("");
  const [showStockModal, setShowStockModal] = useState(false);
  const [savingStock, setSavingStock] = useState(false);
  const { toast } = useToast();
  const [stockForm, setStockForm] = useState({
    medication_name: "", supplier: "", quantity_on_hand: "0",
    unit: "tablets", reorder_threshold: "10",
  });

  // Controlled Drugs
  const [cdEntries, setCdEntries] = useState<ControlledDrug[]>([]);
  const [cdLoading, setCdLoading] = useState(true);
  const [cdFilterType, setCdFilterType] = useState("");
  const [showCdModal, setShowCdModal] = useState(false);
  const [savingCd, setSavingCd] = useState(false);
  const [cdForm, setCdForm] = useState({
    medication_name: "", resident: "", entry_type: "administered",
    quantity: "", balance_after: "", witnessed_by: "",
    recorded_at: new Date().toISOString().slice(0, 16), notes: "",
  });

  // Suppliers
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(true);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [savingSupplier, setSavingSupplier] = useState(false);
  const [supplierForm, setSupplierForm] = useState({
    name: "", contact_name: "", phone: "", email: "", address: "",
  });

  // Shared
  const [residents, setResidents] = useState<Resident[]>([]);

  const loadStock = useCallback(() => {
    setStockLoading(true);
    const qs = new URLSearchParams({ ordering: "medication_name" });
    if (stockSearch.trim()) qs.set("search", stockSearch.trim());
    fetch(`/api/v1/pharmacy/stock/?${qs}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setStock(d.results ?? d))
      .catch(console.error)
      .finally(() => setStockLoading(false));
  }, [stockSearch]);

  const loadCd = useCallback(() => {
    setCdLoading(true);
    const qs = new URLSearchParams({ ordering: "-recorded_at" });
    if (cdFilterType) qs.set("entry_type", cdFilterType);
    fetch(`/api/v1/pharmacy/controlled-drugs/?${qs}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setCdEntries(d.results ?? d))
      .catch(console.error)
      .finally(() => setCdLoading(false));
  }, [cdFilterType]);

  const loadSuppliers = useCallback(() => {
    setSuppliersLoading(true);
    const qs = new URLSearchParams({ ordering: "name" });
    if (supplierSearch.trim()) qs.set("search", supplierSearch.trim());
    fetch(`/api/v1/pharmacy/suppliers/?${qs}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setSuppliers(d.results ?? d))
      .catch(console.error)
      .finally(() => setSuppliersLoading(false));
  }, [supplierSearch]);

  useEffect(() => { loadStock(); }, [loadStock]);
  useEffect(() => { loadCd(); }, [loadCd]);
  useEffect(() => { loadSuppliers(); }, [loadSuppliers]);

  useEffect(() => {
    fetch("/api/v1/residents/?is_active=true&page_size=100", { credentials: "include" })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(d => setResidents(d.results ?? []));
  }, []);

  async function handleSaveStock() {
    if (!stockForm.medication_name) return;
    setSavingStock(true);
    try {
      const body: Record<string, unknown> = {
        medication_name: stockForm.medication_name,
        quantity_on_hand: stockForm.quantity_on_hand,
        unit: stockForm.unit,
        reorder_threshold: stockForm.reorder_threshold,
      };
      if (stockForm.supplier) body.supplier = Number(stockForm.supplier);
      const res = await fetch("/api/v1/pharmacy/stock/", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const n = await res.json();
        setStock(p => [n, ...p]);
        setShowStockModal(false);
        setStockForm({ medication_name: "", supplier: "", quantity_on_hand: "0", unit: "tablets", reorder_threshold: "10" });
        toast("Stock item added.", "success");
      } else { toast("Could not add stock item.", "error"); }
    } catch { toast("Network error — please try again.", "error"); }
    finally { setSavingStock(false); }
  }

  async function handleSaveCd() {
    if (!cdForm.medication_name || !cdForm.quantity || !cdForm.balance_after) return;
    setSavingCd(true);
    try {
      const body: Record<string, unknown> = {
        medication_name: cdForm.medication_name,
        entry_type: cdForm.entry_type,
        quantity: cdForm.quantity,
        balance_after: cdForm.balance_after,
        recorded_at: cdForm.recorded_at,
        notes: cdForm.notes,
      };
      if (cdForm.resident) body.resident = Number(cdForm.resident);
      if (cdForm.witnessed_by) body.witnessed_by = Number(cdForm.witnessed_by);
      const res = await fetch("/api/v1/pharmacy/controlled-drugs/", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const n = await res.json();
        setCdEntries(p => [n, ...p]);
        setShowCdModal(false);
        setCdForm({ medication_name: "", resident: "", entry_type: "administered", quantity: "", balance_after: "", witnessed_by: "", recorded_at: new Date().toISOString().slice(0, 16), notes: "" });
        toast("Controlled drug entry recorded.", "success");
      } else { toast("Could not record CD entry.", "error"); }
    } catch { toast("Network error — please try again.", "error"); }
    finally { setSavingCd(false); }
  }

  async function handleSaveSupplier() {
    if (!supplierForm.name) return;
    setSavingSupplier(true);
    try {
      const res = await fetch("/api/v1/pharmacy/suppliers/", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplierForm),
      });
      if (res.ok) {
        const n = await res.json();
        setSuppliers(p => [...p, n].sort((a, b) => a.name.localeCompare(b.name)));
        setShowSupplierModal(false);
        setSupplierForm({ name: "", contact_name: "", phone: "", email: "", address: "" });
        toast("Supplier added.", "success");
      } else { toast("Could not add supplier.", "error"); }
    } catch { toast("Network error — please try again.", "error"); }
    finally { setSavingSupplier(false); }
  }

  // Stats
  const totalStock = stock.length;
  const lowStockCount = stock.filter(s => s.is_low_stock).length;
  const cdCount = cdEntries.length;
  const activeSuppliers = suppliers.filter(s => s.is_active).length;

  const TABS: { key: Tab; label: string; icon: typeof Package }[] = [
    { key: "stock",      label: "Stock",            icon: Package      },
    { key: "controlled", label: "Controlled Drugs",  icon: FlaskConical },
    { key: "suppliers",  label: "Suppliers",         icon: Building2    },
  ];

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(13, 148, 136,0.12)", border: "1px solid rgba(13, 148, 136,0.2)" }}>
            <Package size={16} style={{ color: "var(--c-teal)" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Pharmacy</h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Stock, controlled drugs &amp; suppliers</p>
          </div>
        </div>
        {tab === "stock" && (
          <button onClick={() => setShowStockModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white"
            style={{ background: "#0d9488" }}>
            <Plus size={14} /> Add Stock
          </button>
        )}
        {tab === "controlled" && (
          <button onClick={() => setShowCdModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white"
            style={{ background: "#0d9488" }}>
            <Plus size={14} /> Add Entry
          </button>
        )}
        {tab === "suppliers" && (
          <button onClick={() => setShowSupplierModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white"
            style={{ background: "#0d9488" }}>
            <Plus size={14} /> Add Supplier
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Stock Items",       value: totalStock,      color: "var(--c-teal)" },
          { label: "Low Stock",               value: lowStockCount,   color: "var(--c-red)" },
          { label: "CD Register Entries",     value: cdCount,         color: "var(--c-teal2)" },
          { label: "Active Suppliers",        value: activeSuppliers, color: "var(--c-green)" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4 text-center"
            style={{ background: "var(--bg-card)", border: "1px solid var(--bg-card-hover)" }}>
            <div className="text-2xl font-bold" style={{ color }}>{value}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1" style={{ background: "var(--bg-card)" }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className="flex items-center gap-2 flex-1 justify-center py-2 text-sm font-medium rounded-lg transition-colors"
            style={tab === key
              ? { background: "#0d9488", color: "#fff" }
              : { color: "var(--text-muted)" }}>
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Stock Tab */}
      {tab === "stock" && (
        <>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input type="text" placeholder="Search medications…" value={stockSearch} onChange={e => setStockSearch(e.target.value)}
              className="w-full text-sm pl-9 pr-4 py-2 rounded-xl outline-none"
              style={{ background: "var(--input-bg)", border: "1px solid var(--bg-card-hover)", color: "var(--text-secondary)" }} />
          </div>

          {stockLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            </div>
          ) : stock.length === 0 ? (
            <EmptyState icon={Package} title="No medication stock" description="Add a stock item to get started."
              action={{ label: "Add Stock", onClick: () => setShowStockModal(true) }} />
          ) : (
            <div className="space-y-2">
              {stock.map(item => (
                <div key={item.id} className="rounded-2xl p-4"
                  style={{ background: "rgba(var(--fg-rgb),0.03)", border: "1px solid rgba(var(--fg-rgb),0.07)" }}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white">{item.medication_name}</span>
                        {item.is_low_stock && (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: "rgba(239,68,68,0.12)", color: "var(--c-red)" }}>
                            <AlertTriangle size={10} /> Low Stock
                          </span>
                        )}
                      </div>
                      {item.supplier_name && (
                        <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                          Supplier: {item.supplier_name}
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-semibold" style={{ color: item.is_low_stock ? "var(--c-red)" : "var(--text-primary)" }}>
                        {item.quantity_on_hand} {item.unit}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Reorder at {item.reorder_threshold}
                      </div>
                      {item.last_restocked && (
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                          Restocked {new Date(item.last_restocked).toLocaleDateString("en-GB")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Controlled Drugs Tab */}
      {tab === "controlled" && (
        <>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select value={cdFilterType} onChange={e => setCdFilterType(e.target.value)}
                className="text-sm pl-3 pr-8 py-2 rounded-xl outline-none appearance-none"
                style={{ background: "var(--input-bg)", border: "1px solid var(--bg-card-hover)", color: "var(--text-secondary)" }}>
                <option value="">All Types</option>
                <option value="received">Received</option>
                <option value="administered">Administered</option>
                <option value="destroyed">Destroyed</option>
                <option value="returned">Returned</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--text-muted)" }} />
            </div>
          </div>

          {cdLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            </div>
          ) : cdEntries.length === 0 ? (
            <EmptyState icon={FlaskConical} title="No controlled drug entries" description="Record an entry to get started."
              action={{ label: "Add Entry", onClick: () => setShowCdModal(true) }} />
          ) : (
            <div className="space-y-2">
              {cdEntries.map(entry => {
                const cfg = ENTRY_TYPE_CFG[entry.entry_type] ?? ENTRY_TYPE_CFG.administered;
                return (
                  <div key={entry.id} className="rounded-2xl p-4"
                    style={{ background: "rgba(var(--fg-rgb),0.03)", border: "1px solid rgba(var(--fg-rgb),0.07)" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-semibold text-white">{entry.medication_name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            Qty: <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{entry.quantity}</span>
                          </span>
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            Balance: <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{entry.balance_after}</span>
                          </span>
                          {entry.resident_name && (
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                              Resident: <span style={{ color: "var(--text-secondary)" }}>{entry.resident_name}</span>
                            </span>
                          )}
                        </div>
                        {entry.notes && (
                          <p className="text-xs mt-1" style={{ color: "rgba(var(--fg-rgb),0.4)" }}>{entry.notes}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          {entry.recorded_by_name && (
                            <span className="text-xs" style={{ color: "rgba(var(--fg-rgb),0.3)" }}>
                              Recorded by: {entry.recorded_by_name}
                            </span>
                          )}
                          {entry.witnessed_by_name && (
                            <span className="text-xs" style={{ color: "rgba(var(--fg-rgb),0.3)" }}>
                              Witnessed by: {entry.witnessed_by_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs" style={{ color: "rgba(var(--fg-rgb),0.4)" }}>
                          {new Date(entry.recorded_at).toLocaleDateString("en-GB")}
                        </div>
                        <div className="text-xs" style={{ color: "rgba(var(--fg-rgb),0.25)" }}>
                          {new Date(entry.recorded_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Suppliers Tab */}
      {tab === "suppliers" && (
        <>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input type="text" placeholder="Search suppliers…" value={supplierSearch} onChange={e => setSupplierSearch(e.target.value)}
              className="w-full text-sm pl-9 pr-4 py-2 rounded-xl outline-none"
              style={{ background: "var(--input-bg)", border: "1px solid var(--bg-card-hover)", color: "var(--text-secondary)" }} />
          </div>

          {suppliersLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            </div>
          ) : suppliers.length === 0 ? (
            <EmptyState icon={Building2} title="No suppliers" description="Add a supplier to get started."
              action={{ label: "Add Supplier", onClick: () => setShowSupplierModal(true) }} />
          ) : (
            <div className="space-y-2">
              {suppliers.map(sup => (
                <div key={sup.id} className="rounded-2xl p-4"
                  style={{ background: "rgba(var(--fg-rgb),0.03)", border: "1px solid rgba(var(--fg-rgb),0.07)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white">{sup.name}</span>
                        {!sup.is_active && (
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(107,114,128,0.15)", color: "#6b7280" }}>Inactive</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        {sup.contact_name && (
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{sup.contact_name}</span>
                        )}
                        {sup.phone && (
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{sup.phone}</span>
                        )}
                        {sup.email && (
                          <a href={`mailto:${sup.email}`} className="text-xs hover:underline"
                            style={{ color: "var(--c-teal2)" }}>{sup.email}</a>
                        )}
                      </div>
                      {sup.address && (
                        <div className="text-xs mt-0.5" style={{ color: "rgba(var(--fg-rgb),0.3)" }}>{sup.address}</div>
                      )}
                    </div>
                    <div className="text-xs flex-shrink-0" style={{ color: "rgba(var(--fg-rgb),0.25)" }}>
                      {new Date(sup.created_at).toLocaleDateString("en-GB")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Stock Modal */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md"
            style={{ background: "var(--bg-elevated)", border: "1px solid rgba(13, 148, 136,0.25)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Add Stock Item</h3>
              <button onClick={() => setShowStockModal(false)} style={{ color: "rgba(var(--fg-rgb),0.4)" }}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              {[
                {
                  label: "Medication Name *",
                  el: <input value={stockForm.medication_name} onChange={e => setStockForm(f => ({ ...f, medication_name: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="e.g. Paracetamol 500mg" />,
                },
                {
                  label: "Supplier",
                  el: (
                    <select value={stockForm.supplier} onChange={e => setStockForm(f => ({ ...f, supplier: e.target.value }))}
                      className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                      <option value="">None</option>
                      {suppliers.filter(s => s.is_active).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  ),
                },
                {
                  label: "Quantity on Hand *",
                  el: <input type="number" min="0" step="0.01" value={stockForm.quantity_on_hand}
                    onChange={e => setStockForm(f => ({ ...f, quantity_on_hand: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} />,
                },
                {
                  label: "Unit",
                  el: <input value={stockForm.unit} onChange={e => setStockForm(f => ({ ...f, unit: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="tablets, ml, sachets…" />,
                },
                {
                  label: "Reorder Threshold",
                  el: <input type="number" min="0" step="0.01" value={stockForm.reorder_threshold}
                    onChange={e => setStockForm(f => ({ ...f, reorder_threshold: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} />,
                },
              ].map(({ label, el }) => (
                <div key={label}>
                  <label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>{label}</label>
                  {el}
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowStockModal(false)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
                style={{ background: "rgba(var(--fg-rgb),0.06)", color: "rgba(var(--fg-rgb),0.7)", border: "1px solid rgba(var(--fg-rgb),0.08)" }}>
                Cancel
              </button>
              <button onClick={handleSaveStock} disabled={savingStock || !stockForm.medication_name}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
                style={{ background: "#0d9488" }}>
                {savingStock ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add CD Entry Modal */}
      {showCdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md overflow-y-auto max-h-screen"
            style={{ background: "var(--bg-elevated)", border: "1px solid rgba(13, 148, 136,0.25)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Add CD Register Entry</h3>
              <button onClick={() => setShowCdModal(false)} style={{ color: "rgba(var(--fg-rgb),0.4)" }}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              {[
                {
                  label: "Medication Name *",
                  el: <input value={cdForm.medication_name} onChange={e => setCdForm(f => ({ ...f, medication_name: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="e.g. Morphine 10mg" />,
                },
                {
                  label: "Entry Type *",
                  el: (
                    <select value={cdForm.entry_type} onChange={e => setCdForm(f => ({ ...f, entry_type: e.target.value }))}
                      className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                      <option value="received">Received</option>
                      <option value="administered">Administered</option>
                      <option value="destroyed">Destroyed</option>
                      <option value="returned">Returned</option>
                    </select>
                  ),
                },
                {
                  label: "Resident",
                  el: (
                    <select value={cdForm.resident} onChange={e => setCdForm(f => ({ ...f, resident: e.target.value }))}
                      className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle}>
                      <option value="">N/A</option>
                      {residents.map(r => <option key={r.id} value={r.id}>{r.full_name}</option>)}
                    </select>
                  ),
                },
                {
                  label: "Quantity *",
                  el: <input type="number" min="0" step="0.01" value={cdForm.quantity}
                    onChange={e => setCdForm(f => ({ ...f, quantity: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="0.00" />,
                },
                {
                  label: "Balance After *",
                  el: <input type="number" min="0" step="0.01" value={cdForm.balance_after}
                    onChange={e => setCdForm(f => ({ ...f, balance_after: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="0.00" />,
                },
                {
                  label: "Witnessed By",
                  el: <input value={cdForm.witnessed_by} onChange={e => setCdForm(f => ({ ...f, witnessed_by: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="Staff name or ID" />,
                },
                {
                  label: "Date & Time *",
                  el: <input type="datetime-local" value={cdForm.recorded_at}
                    onChange={e => setCdForm(f => ({ ...f, recorded_at: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} />,
                },
                {
                  label: "Notes",
                  el: <textarea rows={3} value={cdForm.notes} onChange={e => setCdForm(f => ({ ...f, notes: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={inputStyle}
                    placeholder="Additional notes…" />,
                },
              ].map(({ label, el }) => (
                <div key={label}>
                  <label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>{label}</label>
                  {el}
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCdModal(false)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
                style={{ background: "rgba(var(--fg-rgb),0.06)", color: "rgba(var(--fg-rgb),0.7)", border: "1px solid rgba(var(--fg-rgb),0.08)" }}>
                Cancel
              </button>
              <button onClick={handleSaveCd}
                disabled={savingCd || !cdForm.medication_name || !cdForm.quantity || !cdForm.balance_after}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
                style={{ background: "#0d9488" }}>
                {savingCd ? "Saving…" : "Save Entry"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-2xl p-6 w-full max-w-md"
            style={{ background: "var(--bg-elevated)", border: "1px solid rgba(13, 148, 136,0.25)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Add Supplier</h3>
              <button onClick={() => setShowSupplierModal(false)} style={{ color: "rgba(var(--fg-rgb),0.4)" }}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              {[
                {
                  label: "Name *",
                  el: <input value={supplierForm.name} onChange={e => setSupplierForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="Supplier name" />,
                },
                {
                  label: "Contact Name",
                  el: <input value={supplierForm.contact_name} onChange={e => setSupplierForm(f => ({ ...f, contact_name: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="Primary contact" />,
                },
                {
                  label: "Phone",
                  el: <input type="tel" value={supplierForm.phone} onChange={e => setSupplierForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="+44 …" />,
                },
                {
                  label: "Email",
                  el: <input type="email" value={supplierForm.email} onChange={e => setSupplierForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none" style={inputStyle} placeholder="orders@supplier.com" />,
                },
                {
                  label: "Address",
                  el: <textarea rows={2} value={supplierForm.address} onChange={e => setSupplierForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full text-sm px-3 py-2 rounded-xl outline-none resize-none" style={inputStyle} placeholder="Street, City, Postcode" />,
                },
              ].map(({ label, el }) => (
                <div key={label}>
                  <label className="block text-xs mb-1" style={{ color: "rgba(var(--fg-rgb),0.5)" }}>{label}</label>
                  {el}
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowSupplierModal(false)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl"
                style={{ background: "rgba(var(--fg-rgb),0.06)", color: "rgba(var(--fg-rgb),0.7)", border: "1px solid rgba(var(--fg-rgb),0.08)" }}>
                Cancel
              </button>
              <button onClick={handleSaveSupplier} disabled={savingSupplier || !supplierForm.name}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
                style={{ background: "#0d9488" }}>
                {savingSupplier ? "Saving…" : "Save Supplier"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
