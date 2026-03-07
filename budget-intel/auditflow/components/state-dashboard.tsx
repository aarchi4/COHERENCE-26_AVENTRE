"use client"

import { useMemo, useState } from "react"
import { State, District } from "@/lib/types"
import { formatCurrency } from "@/lib/data"
import { DistrictCard } from "./district-card"
import { BarChart, DonutChart } from "@/components/charts"
import type { BarChartDatum, DonutDatum } from "@/components/charts"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, IndianRupee, TrendingUp, AlertTriangle, FolderKanban, Building2 } from "lucide-react"

interface StateDashboardProps {
  states: State[]
  selectedState: State | null
  onStateSelect: (state: State) => void
  onDistrictClick: (district: District) => void
  onAlertDistrict: (districtId: string, message: string) => void
  onUnflagDistrict: (districtId: string) => void
  onReallocateFunds: (districtId: string, amount: number) => void
}

export function StateDashboard({ 
  states,
  selectedState,
  onStateSelect,
  onDistrictClick, 
  onAlertDistrict,
  onUnflagDistrict,
  onReallocateFunds 
}: StateDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [alertDialogOpen, setAlertDialogOpen] = useState(false)
  const [reallocateDialogOpen, setReallocateDialogOpen] = useState(false)
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null)
  const [alertMessage, setAlertMessage] = useState("")
  const [reallocateAmount, setReallocateAmount] = useState("")

  const totalProjects = selectedState?.districts.reduce((sum, d) => sum + d.projects.length, 0) || 0
  const flaggedDistricts = selectedState?.districts.filter(d => d.flagged).length || 0
  const usedPercentageRaw = selectedState ? (selectedState.usedFunds / selectedState.allocatedFunds) * 100 : 0
  const usedPercentage = Math.min(100, Math.max(0, usedPercentageRaw))

  const districtBarData = useMemo<BarChartDatum[]>(
    () =>
      selectedState?.districts.map((d) => ({
        name: d.name.length > 8 ? d.name.slice(0, 8) + "…" : d.name,
        value: d.allocatedFunds,
        value2: d.usedFunds,
      })) ?? [],
    [selectedState],
  )
  const stateDonutData = useMemo<DonutDatum[]>(
    () =>
      selectedState
        ? [
            { name: "Allocated", value: selectedState.allocatedFunds, fill: "#b45309" },
            { name: "Utilized", value: selectedState.usedFunds, fill: "#0d9488" },
          ]
        : [],
    [selectedState],
  )

  const filteredDistricts = selectedState?.districts.filter(district =>
    district.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const handleAlert = () => {
    if (selectedDistrict && alertMessage) {
      onAlertDistrict(selectedDistrict.id, alertMessage)
      setAlertDialogOpen(false)
      setAlertMessage("")
      setSelectedDistrict(null)
    }
  }

  const handleReallocate = () => {
    if (selectedDistrict && reallocateAmount) {
      onReallocateFunds(selectedDistrict.id, parseFloat(reallocateAmount))
      setReallocateDialogOpen(false)
      setReallocateAmount("")
      setSelectedDistrict(null)
    }
  }

  const handleStateChange = (stateId: string) => {
    const state = states.find(s => s.id === stateId)
    if (state) {
      onStateSelect(state)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with State Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
            <Building2 className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">State Dashboard</h1>
            <p className="text-sm text-muted-foreground">Select a state to view districts</p>
          </div>
        </div>
        {flaggedDistricts > 0 && selectedState && (
          <Badge variant="destructive" className="gap-1 w-fit">
            <AlertTriangle className="h-3.5 w-3.5" />
            {flaggedDistricts} Flagged Districts
          </Badge>
        )}
      </div>

      {/* State Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Select State
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={selectedState?.id || ""} 
            onValueChange={handleStateChange}
          >
            <SelectTrigger className="w-full sm:w-[300px]">
              <SelectValue placeholder="Choose a state to manage..." />
            </SelectTrigger>
            <SelectContent>
              {states.map(state => (
                <SelectItem key={state.id} value={state.id}>
                  <div className="flex items-center gap-2">
                    <span>{state.name}</span>
                    <span className="text-muted-foreground text-xs">
                      ({formatCurrency(state.allocatedFunds)})
                    </span>
                    {state.districts.some(d => d.flagged) && (
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedState ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <IndianRupee className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Allocated</p>
                    <p className="text-lg font-bold text-foreground">{formatCurrency(selectedState.allocatedFunds)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Utilized</p>
                    <p className="text-lg font-bold text-foreground">{formatCurrency(selectedState.usedFunds)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                    <MapPin className="h-5 w-5 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Districts</p>
                    <p className="text-lg font-bold text-foreground">{selectedState.districts.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                    <FolderKanban className="h-5 w-5 text-chart-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Projects</p>
                    <p className="text-lg font-bold text-foreground">{totalProjects}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">District-wise Allocation vs Utilized</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={districtBarData}
                  valueLabel="Allocated"
                  value2Label="Utilized"
                  formatValue={(n) => formatCurrency(n)}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Allocated vs Utilized - {selectedState.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <DonutChart data={stateDonutData} formatValue={(n) => formatCurrency(n)} />
              </CardContent>
            </Card>
          </div>

          {/* Utilization Bar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Fund Utilization - {selectedState.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-medium text-foreground">
                    {usedPercentage.toFixed(1)}%{usedPercentageRaw > 100 ? " (overspend)" : ""}
                  </span>
                </div>
                <Progress value={usedPercentage} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Search Districts */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search districts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Districts Grid */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-foreground">
              Districts in {selectedState.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDistricts.map(district => (
                <DistrictCard
                  key={district.id}
                  district={district}
                  onClick={() => onDistrictClick(district)}
                  onAlert={() => {
                    setSelectedDistrict(district)
                    setAlertDialogOpen(true)
                  }}
                  onUnflag={() => onUnflagDistrict(district.id)}
                  onReallocate={() => {
                    setSelectedDistrict(district)
                    setReallocateDialogOpen(true)
                  }}
                />
              ))}
            </div>
            {filteredDistricts.length === 0 && searchQuery && (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No districts found matching &quot;{searchQuery}&quot;</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No State Selected</h3>
              <p className="text-muted-foreground">Please select a state from the dropdown above to view and manage its districts.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert Dialog */}
      <Dialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Send Corruption Alert
            </DialogTitle>
            <DialogDescription>
              Flag {selectedDistrict?.name} for investigation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="alert-message">Alert Description</Label>
              <Textarea
                id="alert-message"
                placeholder="Describe the suspected corruption or misuse of funds..."
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAlertDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleAlert}>
              Flag District
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reallocate Dialog */}
      <Dialog open={reallocateDialogOpen} onOpenChange={setReallocateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reallocate Funds</DialogTitle>
            <DialogDescription>
              Adjust fund allocation for {selectedDistrict?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Allocation</Label>
              <p className="text-lg font-semibold text-primary">
                {selectedDistrict && formatCurrency(selectedDistrict.allocatedFunds)}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reallocate-amount">New Allocation Amount (in Lakhs)</Label>
              <Input
                id="reallocate-amount"
                type="number"
                placeholder="Enter new amount"
                value={reallocateAmount}
                onChange={(e) => setReallocateAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReallocateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReallocate}>
              Update Allocation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
