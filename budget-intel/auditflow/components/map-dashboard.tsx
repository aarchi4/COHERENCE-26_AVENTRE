"use client"

import { useMemo, useEffect, useState } from "react"
import type { State } from "@/lib/types"
import { fetchStatesFromBackend, API_BASE } from "@/lib/backend"
import { MapView } from "./map-view"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

interface MapDashboardProps {
  states: State[]
}

export function MapDashboard({ states: _initialStates }: MapDashboardProps) {
  const [apiStates, setApiStates] = useState<State[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    fetchStatesFromBackend()
      .then((data) => {
        if (mounted) {
          setApiStates(data)
          setError(null)
        }
      })
      .catch((err) => {
        if (mounted) {
          setApiStates([])
          setError(`Could not load projects. Make sure the backend is running on ${API_BASE}`)
        }
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const projects = useMemo(
    () =>
      apiStates.flatMap((state) =>
        state.districts.flatMap((district) =>
          district.projects.map((project) => ({
            ...project,
            stateName: state.name,
            districtName: district.name,
          })),
        ),
      ),
    [apiStates],
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading projects from API...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Connection error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="relative z-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Map View</CardTitle>
          <CardDescription>Geographic overview of all monitored projects (from API)</CardDescription>
        </CardHeader>
        <CardContent>
          <MapView projects={projects} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Projects by Location</CardTitle>
          <CardDescription>Projects from backend plotted on the map</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-border bg-card/80 px-4 py-3 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          p.status === "completed"
                            ? "#22c55e"
                            : p.status === "flagged"
                              ? "#ef4444"
                              : p.status === "planning"
                                ? "#f59e0b"
                                : "#22d3ee",
                      }}
                    />
                    <span className="text-sm font-semibold text-foreground truncate">{p.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {p.progress}%
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="truncate">
                    {p.stateName} • {p.districtName}
                  </span>
                  <Badge
                    variant="outline"
                    className="border-none text-[10px] font-semibold px-2 py-0.5 capitalize"
                  >
                    {p.status.replace("-", " ")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

