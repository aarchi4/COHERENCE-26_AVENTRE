"use client"

import { useState, useCallback, useEffect } from "react"
import { State, District, UserRole } from "@/lib/types"
import { initialStates } from "@/lib/data"
import { fetchStatesFromBackend, fileComplaintToBackend } from "@/lib/backend"
import { CentralDashboard } from "@/components/central-dashboard"
import { StateDashboard } from "@/components/state-dashboard"
import { DistrictDashboard } from "@/components/district-dashboard"
import { UserDashboard } from "@/components/user-dashboard"
import { MapDashboard } from "@/components/map-dashboard"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Landmark, Building2, MapPin, Users, Globe2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function FinanceApp() {
  const [states, setStates] = useState<State[]>(initialStates)
  const [selectedState, setSelectedState] = useState<State | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null)
  const [currentRole, setCurrentRole] = useState<UserRole>("user")
  const [loading, setLoading] = useState<boolean>(false)
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const backendStates = await fetchStatesFromBackend()
        if (mounted && backendStates.length) {
          setStates(backendStates)
        }
      } catch (error) {
        console.error("Failed to load backend data, falling back to static sample data.", error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const handleStateClick = useCallback((state: State) => {
    setSelectedState(state)
    setCurrentRole("state")
  }, [])

  const handleStateSelect = useCallback((state: State) => {
    setSelectedState(state)
  }, [])

  const handleDistrictClick = useCallback((district: District) => {
    setSelectedDistrict(district)
    setCurrentRole("district")
  }, [])

  const handleDistrictSelect = useCallback((district: District) => {
    setSelectedDistrict(district)
  }, [])

  const handleAllocateFunds = useCallback((stateId: string, amount: number) => {
    setStates(prev => prev.map(state => {
      if (state.id === stateId) {
        return { ...state, allocatedFunds: state.allocatedFunds + (amount * 100) }
      }
      return state
    }))
    toast({
      title: "Funds Allocated Successfully!",
      description: `Funds have been allocated to the state.`,
    })
  }, [toast])

  const handleAlertDistrict = useCallback((districtId: string, message: string) => {
    setStates(prev => prev.map(state => ({
      ...state,
      districts: state.districts.map(district => {
        if (district.id === districtId) {
          return { ...district, flagged: true }
        }
        return district
      })
    })))
    // Update selectedState if it contains the district
    setSelectedState(prev => {
      if (!prev) return prev
      return {
        ...prev,
        districts: prev.districts.map(district => {
          if (district.id === districtId) {
            return { ...district, flagged: true }
          }
          return district
        })
      }
    })
    toast({
      title: "Alert Sent!",
      description: `District flagged for review.`,
      variant: "destructive"
    })
  }, [toast])

  const handleReallocateFunds = useCallback((districtId: string, amount: number) => {
    setStates(prev => prev.map(state => ({
      ...state,
      districts: state.districts.map(district => {
        if (district.id === districtId) {
          return { ...district, allocatedFunds: amount * 100 }
        }
        return district
      })
    })))
    // Update selectedState
    setSelectedState(prev => {
      if (!prev) return prev
      return {
        ...prev,
        districts: prev.districts.map(district => {
          if (district.id === districtId) {
            return { ...district, allocatedFunds: amount * 100 }
          }
          return district
        })
      }
    })
    toast({
      title: "Funds Reallocated!",
      description: `Fund allocation has been updated.`,
    })
  }, [toast])

  const handleFileComplaint = useCallback(
    async (districtId: string, projectId: string, description: string, images: string[]) => {
      try {
        await fileComplaintToBackend({
          states,
          districtId,
          projectId,
          description,
          images,
        })

        // Flag the project locally for immediate visual feedback
        setStates(prev =>
          prev.map(state => ({
            ...state,
            districts: state.districts.map(district => {
              if (district.id === districtId) {
                return {
                  ...district,
                  projects: district.projects.map(project => {
                    if (project.id === projectId) {
                      return { ...project, status: "flagged" as const }
                    }
                    return project
                  }),
                }
              }
              return district
            }),
          })),
        )

        setSelectedDistrict(prev => {
          if (!prev || prev.id !== districtId) return prev
          return {
            ...prev,
            projects: prev.projects.map(project => {
              if (project.id === projectId) {
                return { ...project, status: "flagged" as const }
              }
              return project
            }),
          }
        })

        toast({
          title: "Complaint Filed Successfully!",
          description:
            "Your complaint has been submitted to the BudgetFlow backend. The project is now flagged for investigation.",
          variant: "destructive",
        })
      } catch (error) {
        console.error("Failed to file complaint with backend", error)
        toast({
          title: "Failed to submit complaint",
          description: "Please ensure the backend API is running on http://localhost:8000",
          variant: "destructive",
        })
      }
    },
    [states, toast],
  )

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role)
    if (role === "central") {
      setSelectedState(null)
      setSelectedDistrict(null)
    } else if (role === "state") {
      setSelectedDistrict(null)
    } else if (role === "user" || role === "map") {
      setSelectedState(null)
      setSelectedDistrict(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-[1000] border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Landmark className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">GovFinance</h1>
                <p className="text-xs text-muted-foreground">Fund Tracking System</p>
              </div>
            </div>

            {/* Role Switcher - Desktop */}
            <Tabs value={currentRole} onValueChange={(v) => handleRoleChange(v as UserRole)} className="hidden lg:block">
              <TabsList className="bg-muted">
                <TabsTrigger value="user" className="gap-2 data-[state=active]:bg-chart-4 data-[state=active]:text-chart-4-foreground">
                  <Users className="h-4 w-4" />
                  User
                </TabsTrigger>
                <TabsTrigger value="central" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Landmark className="h-4 w-4" />
                  Central
                </TabsTrigger>
                <TabsTrigger value="state" className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                  <Building2 className="h-4 w-4" />
                  State
                </TabsTrigger>
                <TabsTrigger value="district" className="gap-2 data-[state=active]:bg-chart-3 data-[state=active]:text-foreground">
                  <MapPin className="h-4 w-4" />
                  District
                </TabsTrigger>
                <TabsTrigger value="map" className="gap-2 data-[state=active]:bg-card data-[state=active]:text-primary">
                  <Globe2 className="h-4 w-4" />
                  Map
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Mobile Role Switcher */}
          <div className="mt-3 lg:hidden">
            <Tabs value={currentRole} onValueChange={(v) => handleRoleChange(v as UserRole)}>
              <TabsList className="w-full bg-muted grid grid-cols-5">
                <TabsTrigger value="user" className="gap-1 text-xs data-[state=active]:bg-chart-4 data-[state=active]:text-chart-4-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">User</span>
                </TabsTrigger>
                <TabsTrigger value="central" className="gap-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Landmark className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Central</span>
                </TabsTrigger>
                <TabsTrigger value="state" className="gap-1 text-xs data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">State</span>
                </TabsTrigger>
                <TabsTrigger value="district" className="gap-1 text-xs data-[state=active]:bg-chart-3 data-[state=active]:text-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">District</span>
                </TabsTrigger>
                <TabsTrigger value="map" className="gap-1 text-xs data-[state=active]:bg-card data-[state=active]:text-primary">
                  <Globe2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Map</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {loading && (
          <div className="mb-4 text-xs text-muted-foreground">
            Connecting to BudgetFlow API at http://localhost:8000...
          </div>
        )}
        {currentRole === "user" && (
          <UserDashboard
            states={states}
            onFileComplaint={handleFileComplaint}
          />
        )}

        {currentRole === "central" && (
          <CentralDashboard
            states={states}
            onStateClick={handleStateClick}
            onAllocateFunds={handleAllocateFunds}
          />
        )}

        {currentRole === "state" && (
          <StateDashboard
            states={states}
            selectedState={selectedState}
            onStateSelect={handleStateSelect}
            onDistrictClick={handleDistrictClick}
            onAlertDistrict={handleAlertDistrict}
            onReallocateFunds={handleReallocateFunds}
          />
        )}

        {currentRole === "district" && (
          <DistrictDashboard
            states={states}
            selectedState={selectedState}
            selectedDistrict={selectedDistrict}
            onStateSelect={handleStateSelect}
            onDistrictSelect={handleDistrictSelect}
            onFileComplaint={handleFileComplaint}
          />
        )}

        {currentRole === "map" && (
          <MapDashboard
            states={states}
          />
        )}
      </main>

      <Toaster />
    </div>
  )
}
