"use client"

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

// Hex fallbacks so Recharts SVG renders bars (CSS vars often don't resolve in SVG)
const BAR_COLORS = ["#b45309", "#0d9488", "#4f46e5", "#ea580c", "#65a30d"]
const BAR_COLOR_SECONDARY = "#0d9488"

export interface BarChartDatum {
  name: string
  value: number
  value2?: number
  fill?: string
}

interface BarChartProps {
  data: BarChartDatum[]
  title?: string
  valueLabel?: string
  value2Label?: string
  formatValue?: (n: number) => string
  /** Show two bars per category (e.g. allocated vs used) */
  stacked?: boolean
}

export function BarChart({
  data,
  title,
  valueLabel = "Value",
  value2Label,
  formatValue = (n) => n.toLocaleString("en-IN"),
  stacked = false,
}: BarChartProps) {
  return (
    <div className="w-full h-[320px]">
      {title && (
        <p className="text-sm font-medium text-foreground mb-2">{title}</p>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--color-border)" }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatValue}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius)",
            }}
            labelStyle={{ color: "var(--color-foreground)" }}
            formatter={(value: number, name: string) => [formatValue(value), name]}
            labelFormatter={(label) => label}
          />
          {value2Label != null && !stacked ? (
            <>
              <Bar dataKey="value" name={valueLabel} radius={[4, 4, 0, 0]} fill={BAR_COLORS[0]}>
                {data.map((_, i) => (
                  <Cell key={`v1-${i}`} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
              <Bar dataKey="value2" name={value2Label} radius={[4, 4, 0, 0]} fill={BAR_COLOR_SECONDARY}>
                {data.map((_, i) => (
                  <Cell key={`v2-${i}`} fill={BAR_COLORS[(i + 1) % BAR_COLORS.length]} />
                ))}
              </Bar>
            </>
          ) : (
            <Bar dataKey="value" name={valueLabel} radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill ?? BAR_COLORS[i % BAR_COLORS.length]} />
              ))}
            </Bar>
          )}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
