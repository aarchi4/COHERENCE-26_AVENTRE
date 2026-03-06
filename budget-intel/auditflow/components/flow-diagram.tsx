"use client"

import { ArrowDown, Building2, MapPin, Landmark } from "lucide-react"

export function FlowDiagram() {
  return (
    <div className="flex flex-col items-center gap-2 py-6">
      <div className="flex items-center gap-8 md:gap-16">
        {/* Central Government */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-primary/20 border-2 border-primary">
            <Landmark className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          </div>
          <span className="text-xs md:text-sm font-medium text-foreground">Central</span>
        </div>

        <ArrowDown className="h-6 w-6 text-primary rotate-[-90deg] md:rotate-0" />

        {/* State */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-accent/20 border-2 border-accent">
            <Building2 className="h-8 w-8 md:h-10 md:w-10 text-accent" />
          </div>
          <span className="text-xs md:text-sm font-medium text-foreground">State</span>
        </div>

        <ArrowDown className="h-6 w-6 text-accent rotate-[-90deg] md:rotate-0" />

        {/* District */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-chart-3/20 border-2 border-chart-3">
            <MapPin className="h-8 w-8 md:h-10 md:w-10 text-chart-3" />
          </div>
          <span className="text-xs md:text-sm font-medium text-foreground">District</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-muted-foreground text-sm">
        <div className="h-px w-8 bg-primary/50" />
        <span>Fund Flow Hierarchy</span>
        <div className="h-px w-8 bg-primary/50" />
      </div>
    </div>
  )
}
