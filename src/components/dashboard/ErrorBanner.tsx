import { AlertCircle } from "lucide-react";

export default function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 rounded-2xl text-sm bg-red-50 border border-red-200 text-red-700">
      <AlertCircle size={16} className="flex-shrink-0 text-red-500" />
      {message}
    </div>
  );
}
