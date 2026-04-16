import {
  Users,
  ClipboardList,
  Pill,
  CheckCircle,
  LucideIcon
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  users: Users,
  clipboard: ClipboardList,
  pill: Pill,
  "check-circle": CheckCircle
};

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: string;
}

export default function StatCard({
  title,
  value,
  change,
  icon
}: StatCardProps) {
  const IconComponent = iconMap[icon] || Users;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{change}</p>
        </div>
        <div className="p-3 bg-purple-50 rounded-full">
          <IconComponent className="h-6 w-6 text-purple-600" />
        </div>
      </div>
    </div>
  );
}
