import { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
  color?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  color = "#6b7280"
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: `${color}18` }}
      >
        <Icon size={24} style={{ color }} />
      </div>
      <div className="text-gray-900 font-semibold mb-1">{title}</div>
      {description && (
        <div className="text-gray-500 text-sm max-w-xs">{description}</div>
      )}
    </div>
  );
}
