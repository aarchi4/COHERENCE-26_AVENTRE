"use client"

import { useMemo, useState, useRef } from "react"
import { State } from "@/lib/types"
import { formatCurrency } from "@/lib/data"
import { FlowDiagram } from "./flow-diagram"
import { StateCard } from "./state-card"
import { BarChart, DonutChart } from "@/components/charts"
import type { BarChartDatum, DonutDatum } from "@/components/charts"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, TrendingUp, Landmark, IndianRupee, Building2, Upload, FileSpreadsheet, X, CheckCircle2 } from "lucide-react"

interface CentralDashboardProps {
  states: State[]
  onStateClick: (state: State) => void
  onAllocateFunds: (stateId: string, amount: number) => void
}

interface UploadedAllotment {
  id: string
  fileName: string
  type: 'yearly' | 'new'
  uploadDate: Date
  ministry: string
}

export function CentralDashboard({ states, onStateClick, onAllocateFunds }: CentralDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [allocateDialogOpen, setAllocateDialogOpen] = useState(false)
  const [selectedStateForAllocation, setSelectedStateForAllocation] = useState<State | null>(null)
  const [allocationAmount, setAllocationAmount] = useState("")
  
  // Upload allotment state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadType, setUploadType] = useState<'yearly' | 'new'>('yearly')
  const [selectedMinistry, setSelectedMinistry] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedAllotments, setUploadedAllotments] = useState<UploadedAllotment[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const ministries = [
    "Ministry of Finance",
    "Ministry of Home Affairs",
    "Ministry of Defence",
    "Ministry of Education",
    "Ministry of Health & Family Welfare",
    "Ministry of Rural Development",
    "Ministry of Agriculture",
    "Ministry of Railways",
    "Ministry of Road Transport & Highways",
    "Ministry of Urban Development"
  ]

  const totalAllocated = states.reduce((sum, s) => sum + s.allocatedFunds, 0)
  const totalUsed = states.reduce((sum, s) => sum + s.usedFunds, 0)
  const totalDistricts = states.reduce((sum, s) => sum + s.districts.length, 0)

  const stateBarData = useMemo<BarChartDatum[]>(
    () =>
      states.map((s) => ({
        name: s.name.length > 10 ? s.name.slice(0, 10) + "…" : s.name,
        value: s.allocatedFunds,
        value2: s.usedFunds,
      })),
    [states],
  )
  const allocationDonutData = useMemo<DonutDatum[]>(
    () => [
      { name: "Allocated", value: totalAllocated, fill: "#b45309" },
      { name: "Utilized", value: totalUsed, fill: "#0d9488" },
    ],
    [totalAllocated, totalUsed],
  )

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const handleSubmitAllotment = () => {
    if (uploadedFile && selectedMinistry) {
      const newAllotment: UploadedAllotment = {
        id: Date.now().toString(),
        fileName: uploadedFile.name,
        type: uploadType,
        uploadDate: new Date(),
        ministry: selectedMinistry
      }
      setUploadedAllotments([newAllotment, ...uploadedAllotments])
      setUploadDialogOpen(false)
      setUploadedFile(null)
      setSelectedMinistry("")
      setUploadType('yearly')
    }
  }

  const filteredStates = states.filter(state =>
    state.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAllocate = () => {
    if (selectedStateForAllocation && allocationAmount) {
      onAllocateFunds(selectedStateForAllocation.id, parseFloat(allocationAmount))
      setAllocateDialogOpen(false)
      setAllocationAmount("")
      setSelectedStateForAllocation(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <IndianRupee className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Allocated</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(totalAllocated)}</p>
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
                <p className="text-xs text-muted-foreground">Total Utilized</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(totalUsed)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                <Building2 className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">States</p>
                <p className="text-lg font-bold text-foreground">{states.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                <Landmark className="h-5 w-5 text-chart-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Districts</p>
                <p className="text-lg font-bold text-foreground">{totalDistricts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">State-wise Allocation vs Utilized</CardTitle>
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
            <CardTitle className="text-lg">Allocated vs Utilized (Total)</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={allocationDonutData}
              formatValue={(n) => formatCurrency(n)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Flow Diagram */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Fund Distribution Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <FlowDiagram />
        </CardContent>
      </Card>

      {/* Upload Allotment Section */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Ministry Allotments</CardTitle>
            <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Allotment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {uploadedAllotments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No allotments uploaded yet</p>
              <p className="text-sm">Upload yearly or new ministry allotments to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {uploadedAllotments.map(allotment => (
                <div 
                  key={allotment.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileSpreadsheet className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{allotment.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {allotment.ministry} - {allotment.type === 'yearly' ? 'Yearly Allotment' : 'New Allotment'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {allotment.uploadDate.toLocaleDateString()}
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search states..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* States Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-foreground">All States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStates.map(state => (
            <div key={state.id} className="relative">
              <StateCard 
                state={state} 
                onClick={() => onStateClick(state)} 
              />
              <Button
                size="icon"
                variant="outline"
                className="absolute top-3 right-3 h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedStateForAllocation(state)
                  setAllocateDialogOpen(true)
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Allocate Funds Dialog */}
      <Dialog open={allocateDialogOpen} onOpenChange={setAllocateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Allocate Funds</DialogTitle>
            <DialogDescription>
              Add funds to {selectedStateForAllocation?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Allocation</Label>
              <p className="text-lg font-semibold text-primary">
                {selectedStateForAllocation && formatCurrency(selectedStateForAllocation.allocatedFunds)}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Additional Amount (in Crores)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={allocationAmount}
                onChange={(e) => setAllocationAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAllocateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAllocate}>
              Allocate Funds
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Allotment Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Allotment
            </DialogTitle>
            <DialogDescription>
              Upload yearly allotment or new allotment documents for ministries
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Allotment Type</Label>
              <Select value={uploadType} onValueChange={(value: 'yearly' | 'new') => setUploadType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yearly">Yearly Allotment</SelectItem>
                  <SelectItem value="new">New Allotment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ministry</Label>
              <Select value={selectedMinistry} onValueChange={setSelectedMinistry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ministry..." />
                </SelectTrigger>
                <SelectContent>
                  {ministries.map(ministry => (
                    <SelectItem key={ministry} value={ministry}>
                      {ministry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Upload Document</Label>
              <div 
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileSpreadsheet className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium text-foreground">{uploadedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        setUploadedFile(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload document</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, XLS, XLSX, CSV</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.xls,.xlsx,.csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setUploadDialogOpen(false)
              setUploadedFile(null)
              setSelectedMinistry("")
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitAllotment}
              disabled={!uploadedFile || !selectedMinistry}
            >
              Upload Allotment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
