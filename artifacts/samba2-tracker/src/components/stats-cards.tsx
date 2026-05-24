import { Record } from "@workspace/api-client-react/src/generated/api.schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardsProps {
  records: Record[] | undefined;
  isLoading: boolean;
  mode: "samba2" | "adhear";
}

export function StatsCards({ records, isLoading, mode }: StatsCardsProps) {
  if (isLoading) {
    const count = mode === "samba2" ? 5 : 3;
    return (
      <div className={`grid grid-cols-1 md:grid-cols-${count} gap-4 mb-8`}>
        {[...Array(count)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  const total = records?.length || 0;
  const resolved = records?.filter((r) => r.resolved === "Yes").length || 0;
  const unresolved = records?.filter((r) => r.resolved === "No").length || 0;

  if (mode === "adhear") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="Total ADHEAR Records" value={total} color="blue" />
        <StatCard title="Resolved" value={resolved} color="green" />
        <StatCard title="Unresolved" value={unresolved} color="red" />
      </div>
    );
  }

  const bonebridge =
    records?.filter((r) => r.implant?.toLowerCase().includes("bonebridge")).length || 0;
  const soundbridge =
    records?.filter((r) => r.implant?.toLowerCase().includes("soundbridge")).length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
      <StatCard title="Total SAMBA 2 Records" value={total} />
      <StatCard title="Resolved" value={resolved} color="green" />
      <StatCard title="Unresolved" value={unresolved} color="red" />
      <StatCard title="Bonebridge" value={bonebridge} />
      <StatCard title="Soundbridge" value={soundbridge} />
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color?: "green" | "red" | "blue";
}) {
  const valueClass =
    color === "green"
      ? "text-2xl font-bold text-green-600"
      : color === "red"
      ? "text-2xl font-bold text-red-600"
      : color === "blue"
      ? "text-2xl font-bold text-blue-600"
      : "text-2xl font-bold";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={valueClass}>{value}</div>
      </CardContent>
    </Card>
  );
}
