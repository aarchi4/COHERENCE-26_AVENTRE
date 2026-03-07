"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { State, District, UserRole } from "@/lib/types"
import { initialStates } from "@/lib/data"
import { fetchStatesFromBackend, fileComplaintToBackend, API_DISPLAY } from "@/lib/backend"
import { useAuth, canAccessRole } from "@/lib/auth-context"
import { LoginForm } from "@/components/login-form"
import { CentralDashboard } from "@/components/central-dashboard"
import { StateDashboard } from "@/components/state-dashboard"
import { DistrictDashboard } from "@/components/district-dashboard"
import { UserDashboard } from "@/components/user-dashboard"
import { MapDashboard } from "@/components/map-dashboard"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Landmark, Building2, MapPin, Users, Globe2, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function FinanceApp() {
  const { user, userRole, logout, allowedRoles } = useAuth()
  const [states, setStates] = useState<State[]>(initialStates)
  const [selectedState, setSelectedState] = useState<State | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null)
  const defaultRole = useMemo(
    () => (userRole && allowedRoles.length ? allowedRoles[0] : "user"),
    [userRole, allowedRoles],
  )
  const [currentRole, setCurrentRole] = useState<UserRole>(defaultRole)
  const [loading, setLoading] = useState<boolean>(true)
  const { toast } = useToast()

  useEffect(() => {
    setCurrentRole((r) => (allowedRoles.includes(r) ? r : defaultRole))
  }, [defaultRole, allowedRoles])

  // Pre-select state/district for state/district users when data is available
  useEffect(() => {
    if (!user?.state || states.length === 0) return
    const stateMatch = states.find((s) => s.name === user.state)
    if (stateMatch && (userRole === "state" || userRole === "district")) {
      setSelectedState(stateMatch)
      if (user.district && userRole === "district") {
        const districtMatch = stateMatch.districts.find((d) => d.name === user.district)
        if (districtMatch) setSelectedDistrict(districtMatch)
      }
    }
  }, [user?.state, user?.district, userRole, states])

  const loadFromBackend = useCallback(async () => {
    setLoading(true)
    try {
      const backendStates = await fetchStatesFromBackend()
      if (backendStates.length) {
        setStates(backendStates)
        toast({
          title: "Connected to BudgetFlow API",
          description: `Data loaded from ${API_DISPLAY}`,
        })
      }
    } catch (error) {
      console.error("Failed to load backend data.", error)
      toast({
        title: "Backend not connected",
        description: `Start the backend on http://localhost:8000 and try again.`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    let mounted = true
    const run = async () => {
      setLoading(true)
      try {
        const backendStates = await fetchStatesFromBackend()
        if (mounted && backendStates.length) {
          setStates(backendStates)
          toast({
            title: "Connected to BudgetFlow API",
description: `Data loaded from ${API_DISPLAY}`,
        })
        }
      } catch (error) {
        console.error("Failed to load backend data, falling back to static sample data.", error)
        if (mounted) {
          toast({
            title: "Using sample data",
            description: "Backend not connected. Start backend on http://localhost:8000 and click Refresh.",
            variant: "destructive",
          })
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => { mounted = false }
  }, [toast])

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

  const handleUnflagDistrict = useCallback((districtId: string) => {
    setStates(prev => prev.map(state => ({
      ...state,
      districts: state.districts.map(district => {
        if (district.id === districtId) {
          return { ...district, flagged: false }
        }
        return district
      })
    })))
    setSelectedState(prev => {
      if (!prev) return prev
      return {
        ...prev,
        districts: prev.districts.map(district => {
          if (district.id === districtId) {
            return { ...district, flagged: false }
          }
          return district
        })
      }
    })
    setSelectedDistrict(prev => {
      if (!prev || prev.id !== districtId) return prev
      return { ...prev, flagged: false }
    })
    toast({
      title: "District unflagged",
      description: "The district has been cleared from the flagged list.",
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
          userEmail: user?.email,
          userName: user?.name,
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
    [states, toast, user],
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

  if (!user) {
    return <LoginForm />
  }

  const tabRoles: { role: UserRole; icon: typeof Users; label: string }[] = [
    { role: "user", icon: Users, label: "User" },
    { role: "central", icon: Landmark, label: "Central" },
    { role: "state", icon: Building2, label: "State" },
    { role: "district", icon: MapPin, label: "District" },
    { role: "map", icon: Globe2, label: "Map" },
  ]
  const visibleTabs = tabRoles.filter((t) => userRole && canAccessRole(userRole, t.role))

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

            <div className="flex items-center gap-3">
              {/* Role Switcher - Desktop */}
              <Tabs value={currentRole} onValueChange={(v) => handleRoleChange(v as UserRole)} className="hidden lg:block">
                <TabsList className="bg-muted">
                  {visibleTabs.map((t) => {
                    const Icon = t.icon
                    const activeClass =
                      t.role === "user"
                        ? "data-[state=active]:bg-chart-4 data-[state=active]:text-chart-4-foreground"
                        : t.role === "central"
                          ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                          : t.role === "state"
                            ? "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                            : t.role === "district"
                              ? "data-[state=active]:bg-chart-3 data-[state=active]:text-foreground"
                              : "data-[state=active]:bg-card data-[state=active]:text-primary"
                    return (
                      <TabsTrigger key={t.role} value={t.role} className={cn("gap-2", activeClass)}>
                        <Icon className="h-4 w-4" />
                        {t.label}
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
              </Tabs>

              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground border-l border-border pl-3">
                <span className="truncate max-w-[140px]">{user.name}</span>
                <Button type="button" variant="ghost" size="icon-sm" onClick={logout} title="Sign out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile: Role Switcher + User */}
          <div className="mt-3 lg:hidden flex flex-col gap-2">
            <Tabs value={currentRole} onValueChange={(v) => handleRoleChange(v as UserRole)}>
              <TabsList
                className="w-full bg-muted grid text-xs"
                style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, minmax(0, 1fr))` }}
              >
                {visibleTabs.map((t) => {
                  const Icon = t.icon
                  const activeClass =
                    t.role === "user"
                      ? "data-[state=active]:bg-chart-4 data-[state=active]:text-chart-4-foreground"
                      : t.role === "central"
                        ? "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        : t.role === "state"
                          ? "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
                          : t.role === "district"
                            ? "data-[state=active]:bg-chart-3 data-[state=active]:text-foreground"
                            : "data-[state=active]:bg-card data-[state=active]:text-primary"
                  return (
                    <TabsTrigger key={t.role} value={t.role} className={cn("gap-1", activeClass)}>
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="hidden sm:inline truncate">{t.label}</span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </Tabs>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="truncate">{user.name}</span>
              <Button type="button" variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-3.5 w-3.5 mr-1" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="mb-4 text-xs text-muted-foreground">
            Connecting to BudgetFlow API...
          </div>
        ) : (
          <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
            <span>API: {API_DISPLAY}</span>
            <Button type="button" variant="ghost" size="sm" onClick={loadFromBackend} className="h-7 text-xs">
              Refresh from API
            </Button>
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
            onUnflagDistrict={handleUnflagDistrict}
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
            onUnflagDistrict={handleUnflagDistrict}
          />
        )}

        {currentRole === "map" && (
          <MapDashboard
            states={states}
          />
        )}
      </main>

    </div>
  )
}
