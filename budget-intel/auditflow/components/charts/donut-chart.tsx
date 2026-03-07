"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

// Hex fallbacks so Recharts SVG renders (CSS vars may not resolve in SVG)
const DEFAULT_COLORS = ["#b45309", "#0d9488", "#4f46e5", "#ea580c", "#65a30d", "#dc2626"]

export interface DonutDatum {
  name: string
  value: number
  fill?: string
}

interface DonutChartProps {
  data: DonutDatum[]
  title?: string
  formatValue?: (n: number) => string
  colors?: string[]
}

export function DonutChart({
  data,
  title,
  formatValue = (n) => n.toLocaleString("en-IN"),
  colors = DEFAULT_COLORS,
}: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <div className="w-full h-[280px]">
      {title && (
        <p className="text-sm font-medium text-foreground mb-2">{title}</p>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="85%"
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell
                key={entry.name}
                fill={entry.fill ?? colors[i % colors.length]}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius)",
            }}
            formatter={(value: number) => [formatValue(value), ""]}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const pct = total ? ((payload[0].value as number) / total) * 100 : 0
              return (
                <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
                  <p className="font-medium text-foreground">{payload[0].payload.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatValue(payload[0].value as number)} ({pct.toFixed(1)}%)
                  </p>
                </div>
              )
            }}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            formatter={(value, entry) => (
              <span className="text-xs text-muted-foreground">
                {value}
              </span>
            )}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
