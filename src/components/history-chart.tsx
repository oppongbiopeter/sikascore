import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ScorePoint } from "@/lib/credit/types";

function monthLabel(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short" });
}

export function HistoryChart({ history }: { history: ScorePoint[] }) {
  const data = useMemo(
    () => history.map((p) => ({ ...p, label: monthLabel(p.date) })),
    [history],
  );
  const scores = history.map((p) => p.score);
  const min = Math.max(300, Math.min(...scores) - 20);
  const max = Math.min(850, Math.max(...scores) + 20);

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--color-muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[min, max]}
            tick={{ fill: "var(--color-muted)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              color: "var(--color-fg)",
              fontSize: 12,
            }}
            formatter={(value) => [String(value), "Score"]}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="var(--color-lime)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: "var(--color-lime)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
