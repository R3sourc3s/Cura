"use client";

import { useEffect, useState } from "react";
import { medications } from "@/lib/api";
import type { Medication, MAREntry } from "@/types";
import { Pill, AlertTriangle, Plus } from "lucide-react";

export default function MedicationsPage() {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [mar, setMar] = useState<MAREntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [medsData, marData] = await Promise.all([
          medications.list(),
          medications.marList()
        ]);
        setMeds(medsData.results);
        setMar(marData.results);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load medications"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading medications...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Pill className="h-8 w-8 text-blue-600" />
          Medications
        </h1>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Medication
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medications List */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Medication Inventory</h2>
          <div className="space-y-3">
            {meds.map((med) => (
              <div
                key={med.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <div className="font-medium">{med.name}</div>
                  <div className="text-sm text-gray-500">
                    {med.dosage} - {med.frequency}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {med.stock_level <= med.reorder_point && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm ${med.stock_level <= med.reorder_point ? "text-red-600" : "text-gray-600"}`}
                  >
                    {med.stock_level} units
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MAR */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Medication Administration Record
          </h2>
          <div className="space-y-3">
            {mar.slice(0, 10).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <div className="font-medium">
                    Medication {entry.medication}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(entry.scheduled_time).toLocaleTimeString()}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    entry.status === "administered"
                      ? "bg-green-100 text-green-800"
                      : entry.status === "missed"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {entry.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
