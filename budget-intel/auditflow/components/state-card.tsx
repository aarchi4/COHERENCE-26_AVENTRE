"use client"

import { State } from "@/lib/types"
import { formatCurrency } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Building2, AlertTriangle } from "lucide-react"

interface StateCardProps {
  state: State
  onClick: () => void
}

export function StateCard({ state, onClick }: StateCardProps) {
  const usedPercentageRaw = (state.usedFunds / state.allocatedFunds) * 100
  const usedPercentage = Math.min(100, Math.max(0, usedPercentageRaw))
  const hasFlaggedDistricts = state.districts.some(d => d.flagged)

  return (
    <Card 
      className="cursor-pointer transition-all hover:border-primary/50 hover:bg-card/80 group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                {state.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {state.districts.length} Districts
              </p>
            </div>
          </div>
          {hasFlaggedDistricts && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Alert
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Allocated</span>
            <span className="font-medium text-foreground">{formatCurrency(state.allocatedFunds)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Utilized</span>
            <span className="font-medium text-primary">{formatCurrency(state.usedFunds)}</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Utilization</span>
            <span className="text-foreground">{usedPercentage.toFixed(1)}%{usedPercentageRaw > 100 ? " (overspend)" : ""}</span>
          </div>
          <Progress value={usedPercentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}
