"use client"

import { useEffect, useRef } from "react"
import type { Project } from "@/lib/types"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

type MapProject = Project & {
  stateName: string
  districtName: string
}

const statusColors: Record<Project["status"], string> = {
  completed: "#22c55e",
  "in-progress": "#22d3ee",
  flagged: "#ef4444",
  planning: "#f59e0b",
}

interface MapViewProps {
  projects: MapProject[]
}

export function MapView({ projects }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [22, 78],
      zoom: 5,
      zoomControl: false,
    })

    L.control
      .zoom({
        position: "bottomright",
      })
      .addTo(map)

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; CARTO",
      maxZoom: 19,
    }).addTo(map)

    markersLayerRef.current = L.layerGroup().addTo(map)
    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
      markersLayerRef.current = null
    }
  }, [])

  // Update markers whenever projects change
  useEffect(() => {
    const map = mapInstanceRef.current
    const layer = markersLayerRef.current
    if (!map || !layer) return

    layer.clearLayers()

    const withCoords = projects.filter((p) => typeof p.lat === "number" && typeof p.lng === "number")

    if (withCoords.length === 0) {
      return
    }

    const bounds: L.LatLngExpression[] = []

    withCoords.forEach((project) => {
      const color = statusColors[project.status] ?? "#22d3ee"
      const lat = project.lat as number
      const lng = project.lng as number

      const marker = L.circleMarker([lat, lng], {
        radius: 10,
        fillColor: color,
        color,
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.4,
      }).addTo(layer)

      bounds.push([lat, lng])

      const popupHtml = `
          <div style="min-width: 220px; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
            <h3 style="margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #e5e7eb;">${project.name}</h3>
            <p style="margin: 0 0 4px; font-size: 12px; color: #9ca3af;">${project.stateName} • ${
          project.districtName
        }</p>
            <p style="margin: 0 0 4px; font-size: 12px; color: #9ca3af;">Allocated: ₹${(
              project.allocatedFunds / 10000000
            ).toFixed(2)} Cr</p>
            <p style="margin: 0 0 8px; font-size: 12px; color: #9ca3af;">Used: ₹${(
              project.usedFunds / 10000000
            ).toFixed(2)} Cr</p>
            <p style="margin: 0; font-size: 12px; color: #e5e7eb;">Status: ${project.status.replace("-", " ")}</p>
          </div>
        `

      marker.bindPopup(popupHtml)
    })

    if (bounds.length > 0) {
      const llBounds = L.latLngBounds(bounds)
      map.fitBounds(llBounds, { padding: [40, 40] })
    }
  }, [projects])

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Map View</h2>
          <p className="text-xs text-muted-foreground">
            Geographic overview of all monitored projects
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#22c55e]" /> Completed
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#22d3ee]" /> In Progress
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#ef4444]" /> Flagged
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#f59e0b]" /> Planning
          </span>
        </div>
      </div>
      <div className="w-full h-[480px] rounded-xl border border-border overflow-hidden relative z-0">
        <div ref={mapRef} className="w-full h-full" />
      </div>
    </section>
  )
}

