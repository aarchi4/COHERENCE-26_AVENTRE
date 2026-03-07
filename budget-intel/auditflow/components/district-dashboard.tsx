"use client"

import { useMemo, useState, useRef } from "react"
import { State, District, Complaint } from "@/lib/types"
import { formatCurrency } from "@/lib/data"
import { ProjectCard } from "./project-card"
import { BarChart, DonutChart } from "@/components/charts"
import type { BarChartDatum, DonutDatum } from "@/components/charts"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { 
  Search, 
  IndianRupee, 
  TrendingUp, 
  FolderKanban, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin,
  ArrowDown,
  ArrowRight,
  FileWarning,
  Upload,
  X,
  Landmark,
  Building2,
  RefreshCw,
  Image as ImageIcon,
  FlagOff,
} from "lucide-react"

interface DistrictDashboardProps {
  states: State[]
  selectedState: State | null
  selectedDistrict: District | null
  onStateSelect: (state: State) => void
  onDistrictSelect: (district: District) => void
  onFileComplaint: (districtId: string, projectId: string, description: string, images: string[]) => void
  onUnflagDistrict?: (districtId: string) => void
}

export function DistrictDashboard({ 
  states,
  selectedState, 
  selectedDistrict, 
  onStateSelect,
  onDistrictSelect,
  onFileComplaint,
  onUnflagDistrict,
}: DistrictDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [complaintDialogOpen, setComplaintDialogOpen] = useState(false)
  const [complaintDescription, setComplaintDescription] = useState("")
  const [complaintImages, setComplaintImages] = useState<string[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const usedPercentageRaw = selectedDistrict ? (selectedDistrict.usedFunds / selectedDistrict.allocatedFunds) * 100 : 0
  const usedPercentage = Math.min(100, Math.max(0, usedPercentageRaw))
  const completedProjects = selectedDistrict?.projects.filter(p => p.status === 'completed').length || 0
  const inProgressProjects = selectedDistrict?.projects.filter(p => p.status === 'in-progress').length || 0
  const flaggedProjects = selectedDistrict?.projects.filter(p => p.status === 'flagged').length || 0

  const projectStatusDonutData = useMemo<DonutDatum[]>(
    () =>
      selectedDistrict
        ? [
            { name: "Completed", value: completedProjects, fill: "#16a34a" },
            { name: "In Progress", value: inProgressProjects, fill: "#b45309" },
            { name: "Flagged", value: flaggedProjects, fill: "#dc2626" },
            {
              name: "Planning",
              value: selectedDistrict.projects.filter((p) => p.status === "planning").length,
              fill: "#ea580c",
            },
          ].filter((d) => d.value > 0)
        : [],
    [selectedDistrict, completedProjects, inProgressProjects, flaggedProjects],
  )
  const districtAllocationDonutData = useMemo<DonutDatum[]>(
    () =>
      selectedDistrict
        ? [
            { name: "Allocated", value: selectedDistrict.allocatedFunds, fill: "#b45309" },
            { name: "Utilized", value: selectedDistrict.usedFunds, fill: "#0d9488" },
          ]
        : [],
    [selectedDistrict],
  )
  const projectBarData = useMemo<BarChartDatum[]>(
    () =>
      selectedDistrict?.projects.map((p) => ({
        name: p.name.length > 12 ? p.name.slice(0, 12) + "…" : p.name,
        value: p.allocatedFunds,
        value2: p.usedFunds,
      })) ?? [],
    [selectedDistrict],
  )

  const filteredProjects = selectedDistrict?.projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  // Get all districts from all states for the district selector
  const allDistricts = states.flatMap(state => 
    state.districts.map(district => ({
      ...district,
      stateName: state.name,
      stateId: state.id
    }))
  )

  const filteredDistricts = allDistricts.filter(district =>
    district.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    district.stateName.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
    if (selectedDistrict && selectedProjectId && complaintDescription) {
      onFileComplaint(selectedDistrict.id, selectedProjectId, complaintDescription, complaintImages)
      setComplaintDialogOpen(false)
      setComplaintDescription("")
      setComplaintImages([])
      setSelectedProjectId("")
    }
  }

  const handleDistrictChange = (districtId: string) => {
    const districtInfo = allDistricts.find(d => d.id === districtId)
    if (districtInfo) {
      const state = states.find(s => s.id === districtInfo.stateId)
      if (state) {
        onStateSelect(state)
        const district = state.districts.find(d => d.id === districtId)
        if (district) {
          onDistrictSelect(district)
        }
      }
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
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-3/10">
            <MapPin className="h-6 w-6 text-chart-3" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">District Dashboard</h1>
            <p className="text-sm text-muted-foreground">View projects and fund tracking</p>
          </div>
        </div>
        {selectedDistrict?.flagged && (
          <Badge variant="destructive" className="gap-1 w-fit">
            <AlertTriangle className="h-3.5 w-3.5" />
            District Flagged
          </Badge>
        )}
      </div>

      {/* Search and District Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Search Districts</CardTitle>
          <CardDescription>Find districts by name or state</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search districts or states..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* District Selector */}
          <Select 
            value={selectedDistrict?.id || ""} 
            onValueChange={handleDistrictChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a district..." />
            </SelectTrigger>
            <SelectContent>
              {filteredDistricts.map(district => (
                <SelectItem key={district.id} value={district.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{district.name}</span>
                    <span className="text-muted-foreground text-xs">({district.stateName})</span>
                    {district.flagged && (
                      <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedDistrict && selectedState ? (
        <>
          {/* District Info Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">{selectedDistrict.name}</h2>
              <p className="text-sm text-muted-foreground">{selectedState.name}</p>
            </div>
            <div className="flex gap-2">
              {selectedDistrict.flagged && onUnflagDistrict && (
                <Button
                  variant="outline"
                  className="gap-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
                  onClick={() => onUnflagDistrict(selectedDistrict.id)}
                >
                  <FlagOff className="h-4 w-4" />
                  Unflag District
                </Button>
              )}
              <Dialog open={complaintDialogOpen} onOpenChange={setComplaintDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <FileWarning className="h-4 w-4" />
                    Flag
                  </Button>
                </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileWarning className="h-5 w-5 text-destructive" />
                    Flag Project
                  </DialogTitle>
                  <DialogDescription>
                    Select a project and provide a reason for flagging it in {selectedDistrict.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Select Project</Label>
                    <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose the project to flag..." />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedDistrict.projects.map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complaint-desc">Reason for Flagging</Label>
                    <Textarea
                      id="complaint-desc"
                      placeholder="Describe why this project should be flagged..."
                      value={complaintDescription}
                      onChange={(e) => setComplaintDescription(e.target.value)}
                      rows={4}
                    />
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
                    Submit Flag
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

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
                    <p className="text-lg font-bold text-foreground">{formatCurrency(selectedDistrict.allocatedFunds)}</p>
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
                    <p className="text-lg font-bold text-foreground">{formatCurrency(selectedDistrict.usedFunds)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                    <FolderKanban className="h-5 w-5 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Projects</p>
                    <p className="text-lg font-bold text-foreground">{selectedDistrict.projects.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Completed</p>
                    <p className="text-lg font-bold text-foreground">{completedProjects}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Project Status</CardTitle>
              </CardHeader>
              <CardContent>
                <DonutChart
                  data={projectStatusDonutData}
                  formatValue={(n) => n.toString()}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Allocated vs Utilized - {selectedDistrict.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <DonutChart
                  data={districtAllocationDonutData}
                  formatValue={(n) => formatCurrency(n)}
                />
              </CardContent>
            </Card>
          </div>
          {projectBarData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Project-wise Allocation vs Utilized</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={projectBarData}
                  valueLabel="Allocated"
                  value2Label="Utilized"
                  formatValue={(n) => formatCurrency(n)}
                />
              </CardContent>
            </Card>
          )}

          {/* Money Trail */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-primary" />
                Money Trail
              </CardTitle>
              <CardDescription>Track the source of funds allocated to this district</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDistrict.moneyTrail && selectedDistrict.moneyTrail.length > 0 ? (
                <div className="space-y-3">
                  {selectedDistrict.moneyTrail.map((trail, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center gap-4 p-3 rounded-lg border-l-4 ${getTrailColor(trail.type)}`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border">
                        {getTrailIcon(trail.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{trail.source}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{selectedDistrict.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(trail.date).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{formatCurrency(trail.amount)}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {trail.type === 'central-to-state' && 'Central Allocation'}
                          {trail.type === 'state-to-district' && 'State Transfer'}
                          {trail.type === 'reallocation' && 'Reallocated'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Separator className="my-4" />
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                    <span className="font-medium text-foreground">Total Received</span>
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(selectedDistrict.moneyTrail.reduce((sum, t) => sum + t.amount, 0))}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <IndianRupee className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No money trail data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Utilization & Project Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Fund Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Budget Used</span>
                    <span className="font-medium text-foreground">
                      {usedPercentage.toFixed(1)}%{usedPercentageRaw > 100 ? " (overspend)" : ""}
                    </span>
                  </div>
                  <Progress 
                    value={usedPercentage} 
                    className={`h-3 ${selectedDistrict.flagged ? '[&>div]:bg-destructive' : ''}`} 
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Project Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-success" />
                    <span className="text-sm text-muted-foreground">Completed: {completedProjects}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <span className="text-sm text-muted-foreground">In Progress: {inProgressProjects}</span>
                  </div>
                  {flaggedProjects > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-destructive" />
                      <span className="text-sm text-muted-foreground">Flagged: {flaggedProjects}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projects Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Projects Grid */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-foreground">All Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
            {filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No projects found</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No District Selected</h3>
              <p className="text-muted-foreground">Search and select a district from above to view projects and fund details.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
