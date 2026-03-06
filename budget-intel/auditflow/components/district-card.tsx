"use client"

import { District } from "@/lib/types"
import { formatCurrency } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, AlertTriangle, RefreshCcw, Bell } from "lucide-react"

interface DistrictCardProps {
  district: District
  onClick: () => void
  onAlert: () => void
  onReallocate: () => void
}

export function DistrictCard({ district, onClick, onAlert, onReallocate }: DistrictCardProps) {
  const usedPercentage = (district.usedFunds / district.allocatedFunds) * 100

  return (
    <Card 
      className={`transition-all hover:border-primary/50 hover:bg-card/80 group ${
        district.flagged ? 'border-destructive/50 bg-destructive/5' : ''
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer flex-1"
            onClick={onClick}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              district.flagged ? 'bg-destructive/10' : 'bg-chart-3/10'
            }`}>
              <MapPin className={`h-5 w-5 ${district.flagged ? 'text-destructive' : 'text-chart-3'}`} />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                {district.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {district.projects.length} Projects
              </p>
            </div>
          </div>
          {district.flagged && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Flagged
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2" onClick={onClick}>
          <div className="flex justify-between text-sm cursor-pointer">
            <span className="text-muted-foreground">Allocated</span>
            <span className="font-medium text-foreground">{formatCurrency(district.allocatedFunds)}</span>
          </div>
          <div className="flex justify-between text-sm cursor-pointer">
            <span className="text-muted-foreground">Utilized</span>
            <span className="font-medium text-primary">{formatCurrency(district.usedFunds)}</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Utilization</span>
            <span className="text-foreground">{usedPercentage.toFixed(1)}%</span>
          </div>
          <Progress 
            value={usedPercentage} 
            className={`h-2 ${district.flagged ? '[&>div]:bg-destructive' : ''}`} 
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-1.5 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              onAlert()
            }}
          >
            <Bell className="h-3.5 w-3.5" />
            Alert
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-1.5 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              onReallocate()
            }}
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Reallocate
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
