"use client"

import { useMemo, useState, useRef } from "react"
import { State, District } from "@/lib/types"
import { formatCurrency } from "@/lib/data"
import { BarChart, DonutChart } from "@/components/charts"
import type { BarChartDatum, DonutDatum } from "@/components/charts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { 
  Search, 
  IndianRupee, 
  MapPin,
  ArrowDown,
  ArrowRight,
  FileWarning,
  Upload,
  X,
  Landmark,
  Building2,
  Users,
  FolderKanban,
  AlertTriangle,
  TrendingUp,
  RefreshCw
} from "lucide-react"

interface UserDashboardProps {
  states: State[]
  onFileComplaint: (districtId: string, projectId: string, description: string, images: string[]) => void
}

export function UserDashboard({ states, onFileComplaint }: UserDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStateId, setSelectedStateId] = useState<string>("")
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("")
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [complaintDialogOpen, setComplaintDialogOpen] = useState(false)
  const [complaintDescription, setComplaintDescription] = useState("")
  const [complaintImages, setComplaintImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalAllocated = states.reduce((sum, s) => sum + s.allocatedFunds, 0)
  const totalUsed = states.reduce((sum, s) => sum + s.usedFunds, 0)
  const totalDistricts = states.reduce((sum, s) => sum + s.districts.length, 0)
  const totalProjects = states.reduce((sum, s) =>
    sum + s.districts.reduce((dSum, d) => dSum + d.projects.length, 0), 0
  )

  const stateBarData = useMemo<BarChartDatum[]>(
    () =>
      states.map((s) => ({
        name: s.name.length > 10 ? s.name.slice(0, 10) + "…" : s.name,
        value: s.allocatedFunds,
        value2: s.usedFunds,
      })),
    [states],
  )
  const overviewDonutData = useMemo<DonutDatum[]>(
    () => [
      { name: "Total Allocated", value: totalAllocated, fill: "#b45309" },
      { name: "Total Utilized", value: totalUsed, fill: "#0d9488" },
    ],
    [totalAllocated, totalUsed],
  )

  const filteredStates = states.filter(state =>
    state.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    state.districts.some(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const selectedState = states.find(s => s.id === selectedStateId)
  const selectedDistrict = selectedState?.districts.find(d => d.id === selectedDistrictId)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setComplaintImages(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setComplaintImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleFileComplaint = () => {
    if (selectedDistrictId && selectedProjectId && complaintDescription) {
      onFileComplaint(selectedDistrictId, selectedProjectId, complaintDescription, complaintImages)
      setComplaintDialogOpen(false)
      setComplaintDescription("")
      setComplaintImages([])
      setSelectedProjectId("")
    }
  }

  const getTrailIcon = (type: string) => {
    switch (type) {
      case 'central-to-state':
        return <Landmark className="h-4 w-4 text-primary" />
      case 'state-to-district':
        return <Building2 className="h-4 w-4 text-accent" />
      case 'reallocation':
        return <RefreshCw className="h-4 w-4 text-chart-4" />
      default:
        return <IndianRupee className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTrailColor = (type: string) => {
    switch (type) {
      case 'central-to-state':
        return 'border-l-primary bg-primary/5'
      case 'state-to-district':
        return 'border-l-accent bg-accent/5'
      case 'reallocation':
        return 'border-l-chart-4 bg-chart-4/5'
      default:
        return 'border-l-muted bg-muted/5'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-4/10">
            <Users className="h-6 w-6 text-chart-4" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Citizen Portal</h1>
            <p className="text-sm text-muted-foreground">Track government funds and report issues</p>
          </div>
        </div>
      </div>

      {/* Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">State-wise Allocation vs Utilized</CardTitle>
            <CardDescription>Compare allocated and utilized funds across states</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={stateBarData}
              valueLabel="Allocated"
              value2Label="Utilized"
              formatValue={(n) => formatCurrency(n)}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Allocated vs Utilized</CardTitle>
            <CardDescription>National fund overview</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={overviewDonutData}
              formatValue={(n) => formatCurrency(n)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Flow Diagram */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">How Funds Flow</CardTitle>
          <CardDescription>Government fund distribution hierarchy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-6">
            {/* Flow visualization */}
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 w-full max-w-2xl mx-auto">
              {/* Central Government */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 border-2 border-primary shadow-lg shadow-primary/20">
                  <Landmark className="h-10 w-10 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">Central Government</span>
                <span className="text-xs text-muted-foreground">{formatCurrency(totalAllocated)}</span>
              </div>

              <div className="flex flex-col items-center">
                <ArrowDown className="h-8 w-8 text-primary md:rotate-[-90deg]" />
                <span className="text-xs text-muted-foreground mt-1">Allocates to</span>
              </div>

              {/* States */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/20 border-2 border-accent shadow-lg shadow-accent/20">
                  <Building2 className="h-10 w-10 text-accent" />
                </div>
                <span className="text-sm font-semibold text-foreground">{states.length} States</span>
                <span className="text-xs text-muted-foreground">Distribute funds</span>
              </div>

              <div className="flex flex-col items-center">
                <ArrowDown className="h-8 w-8 text-accent md:rotate-[-90deg]" />
                <span className="text-xs text-muted-foreground mt-1">Transfers to</span>
              </div>

              {/* Districts */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-chart-3/20 border-2 border-chart-3 shadow-lg shadow-chart-3/20">
                  <MapPin className="h-10 w-10 text-chart-3" />
                </div>
                <span className="text-sm font-semibold text-foreground">{totalDistricts} Districts</span>
                <span className="text-xs text-muted-foreground">Execute projects</span>
              </div>
            </div>

            <Separator className="my-4 w-full max-w-md" />

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
              <div className="text-center p-3 rounded-lg bg-primary/5">
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalAllocated)}</p>
                <p className="text-xs text-muted-foreground">Total Allocated</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-accent/5">
                <p className="text-2xl font-bold text-accent">{formatCurrency(totalUsed)}</p>
                <p className="text-xs text-muted-foreground">Total Utilized</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-chart-3/5">
                <p className="text-2xl font-bold text-chart-3">{totalDistricts}</p>
                <p className="text-xs text-muted-foreground">Districts</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-chart-4/5">
                <p className="text-2xl font-bold text-chart-4">{totalProjects}</p>
                <p className="text-xs text-muted-foreground">Projects</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search states or districts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* States and Districts List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All States & Districts</CardTitle>
          <CardDescription>Click to expand and view districts and their allocations</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {filteredStates.map(state => {
              const stateUsedPercent = (state.usedFunds / state.allocatedFunds) * 100
              const flaggedCount = state.districts.filter(d => d.flagged).length

              return (
                <AccordionItem key={state.id} value={state.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4 w-full pr-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 shrink-0">
                        <Building2 className="h-5 w-5 text-accent" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{state.name}</span>
                          {flaggedCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {flaggedCount} flagged
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>{state.districts.length} districts</span>
                          <span>{formatCurrency(state.allocatedFunds)}</span>
                          <span>{stateUsedPercent.toFixed(0)}% utilized</span>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                      {state.districts.map(district => {
                        const districtUsedPercentRaw = (district.usedFunds / district.allocatedFunds) * 100
                        const districtUsedPercent = Math.min(100, Math.max(0, districtUsedPercentRaw))
                        return (
                          <div 
                            key={district.id}
                            className={`p-4 rounded-lg border ${district.flagged ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-card'}`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-chart-3" />
                                <span className="font-medium text-foreground">{district.name}</span>
                              </div>
                              {district.flagged && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Flagged
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Allocated:</span>
                                <span className="font-medium text-foreground">{formatCurrency(district.allocatedFunds)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Utilized:</span>
                                <span className="font-medium text-foreground">{formatCurrency(district.usedFunds)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Projects:</span>
                                <span className="font-medium text-foreground">{district.projects.length}</span>
                              </div>
                              <Progress value={districtUsedPercent} className="h-2 mt-2" />
                              {districtUsedPercentRaw > 100 && (
                                <span className="text-xs text-destructive mt-1">Overspend</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Complaint Panel */}
      <Card className="border-chart-4/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-chart-4" />
            File a Complaint
          </CardTitle>
          <CardDescription>Report corruption, misuse of funds, or project issues in your district</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* State Selection */}
          <div className="space-y-2">
            <Label>Select Your State</Label>
            <Select 
              value={selectedStateId} 
              onValueChange={(val) => {
                setSelectedStateId(val)
                setSelectedDistrictId("")
                setSelectedProjectId("")
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose your state..." />
              </SelectTrigger>
              <SelectContent>
                {states.map(state => (
                  <SelectItem key={state.id} value={state.id}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* District Selection */}
          {selectedStateId && (
            <div className="space-y-2">
              <Label>Select Your District</Label>
              <Select 
                value={selectedDistrictId} 
                onValueChange={(val) => {
                  setSelectedDistrictId(val)
                  setSelectedProjectId("")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose your district..." />
                </SelectTrigger>
                <SelectContent>
                  {selectedState?.districts.map(district => (
                    <SelectItem key={district.id} value={district.id}>
                      <div className="flex items-center gap-2">
                        <span>{district.name}</span>
                        {district.flagged && (
                          <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Show District Money Trail */}
          {selectedDistrict && (
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Money Trail - {selectedDistrict.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDistrict.moneyTrail && selectedDistrict.moneyTrail.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDistrict.moneyTrail.map((trail, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center gap-3 p-2 rounded-lg border-l-4 ${getTrailColor(trail.type)}`}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border shrink-0">
                          {getTrailIcon(trail.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 text-sm">
                            <span className="font-medium text-foreground truncate">{trail.source}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="text-xs text-muted-foreground truncate">{selectedDistrict.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(trail.date).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                        <span className="font-bold text-primary text-sm shrink-0">{formatCurrency(trail.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No money trail data available</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* File Complaint Button */}
          {selectedDistrictId && (
            <Dialog open={complaintDialogOpen} onOpenChange={setComplaintDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" className="w-full gap-2 bg-chart-4 hover:bg-chart-4/90">
                  <FileWarning className="h-4 w-4" />
                  File a Complaint for {selectedDistrict?.name}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileWarning className="h-5 w-5 text-destructive" />
                    File a Complaint
                  </DialogTitle>
                  <DialogDescription>
                    Report an issue in {selectedDistrict?.name}, {selectedState?.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Select Project</Label>
                    <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose the project..." />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedDistrict?.projects.map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            <div className="flex items-center gap-2">
                              <span>{project.name}</span>
                              {project.status === 'flagged' && (
                                <Badge variant="destructive" className="text-xs">Flagged</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complaint-desc">Complaint Description</Label>
                    <Textarea
                      id="complaint-desc"
                      placeholder="Describe the issue in detail (e.g., poor quality work, missing materials, fund misuse)..."
                      value={complaintDescription}
                      onChange={(e) => setComplaintDescription(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Upload Evidence (Photos)</Label>
                    <div 
                      className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload photos</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB each</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    {complaintImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {complaintImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={img} 
                              alt={`Evidence ${index + 1}`}
                              className="h-16 w-16 object-cover rounded-lg border border-border"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                removeImage(index)
                              }}
                              className="absolute -top-2 -right-2 h-5 w-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setComplaintDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleFileComplaint}
                    disabled={!selectedProjectId || !complaintDescription}
                  >
                    Submit Complaint
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
