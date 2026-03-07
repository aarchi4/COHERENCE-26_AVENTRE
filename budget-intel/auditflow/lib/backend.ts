import type { State, District, Project as UiProject } from "./types"

/**
 * BudgetFlow backend URL.
 * In dev, use proxy (same origin) to avoid CORS: set NEXT_PUBLIC_USE_PROXY=true in .env.local
 * Or set NEXT_PUBLIC_API_URL to override (e.g. http://localhost:8000).
 */
export const API_BASE =
  typeof process !== "undefined" && process.env?.NEXT_PUBLIC_USE_PROXY === "true"
    ? (typeof window !== "undefined" ? "" : "http://localhost:8000") // browser: same-origin; SSR: direct
    : (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) || "http://localhost:8000"

/** Base path for API calls: use proxy path when using proxy so Next rewrites to backend */
const API_PATH =
  typeof process !== "undefined" && process.env?.NEXT_PUBLIC_USE_PROXY === "true"
    ? "/api-proxy"
    : API_BASE

/** Label for UI (avoid showing empty string when using proxy) */
export const API_DISPLAY =
  API_PATH === "/api-proxy" ? "proxied to http://localhost:8000" : API_BASE

/** User returned by /api/login (no password). role is government | state | district | user */
export interface AuthUser {
  email: string
  name: string
  role: "government" | "state" | "district" | "user"
  state?: string
  district?: string
}

export async function loginWithBackend(email: string, password: string): Promise<AuthUser> {
  const url = API_PATH === "/api-proxy" ? `${API_PATH}/login` : `${API_BASE}/api/login`
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), password }),
  })
  const data = await res.json()
  if (!res.ok || (data as { error?: string }).error) {
    throw new Error((data as { error?: string }).error ?? "Login failed")
  }
  return data as AuthUser
}

type BackendProject = {
  project_id: string
  name: string
  department: string
  scheme: string
  state: string
  district: string
  contractor: string
  centre_released: number
  state_allocated: number
  district_allocated: number
  contractor_paid: number
  completion_pct: number
  status: string
  diff_percent: number
  color: "green" | "yellow" | "red" | "grey"
  reported_to: string[]
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
}

export async function fetchStatesFromBackend(): Promise<State[]> {
  const url = API_PATH === "/api-proxy" ? `${API_PATH}/projects` : `${API_BASE}/api/projects`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error("Failed to fetch projects from backend")
  }
  const data = (await res.json()) as BackendProject[]

  const stateMap = new Map<string, State>()

  const districtCoords: Record<string, { lat: number; lng: number }> = {
    "maharashtra-palghar": { lat: 19.6967, lng: 72.7654 },
    "maharashtra-pune": { lat: 18.5204, lng: 73.8567 },
    "maharashtra-nashik": { lat: 19.9975, lng: 73.7898 },
    "gujarat-surat": { lat: 21.1702, lng: 72.8311 },
    "gujarat-vadodara": { lat: 22.3072, lng: 73.1812 },
  }

  for (const p of data) {
    const stateId = slugify(p.state)
    let state = stateMap.get(stateId)
    if (!state) {
      state = {
        id: stateId,
        name: p.state,
        allocatedFunds: 0,
        usedFunds: 0,
        districts: [],
      }
      stateMap.set(stateId, state)
    }

    state.allocatedFunds += p.district_allocated
    state.usedFunds += p.contractor_paid

    const districtId = `${stateId}-${slugify(p.district)}`
    let district: District | undefined = state.districts.find((d) => d.id === districtId)
    if (!district) {
      district = {
        id: districtId,
        name: p.district,
        stateId,
        allocatedFunds: 0,
        usedFunds: 0,
        flagged: false,
        moneyTrail: [],
        projects: [],
      }
      state.districts.push(district)
    }

    district.allocatedFunds += p.district_allocated
    district.usedFunds += p.contractor_paid

    const projStatus: UiProject["status"] =
      p.color === "red" ? "flagged" : p.completion_pct >= 95 ? "completed" : "in-progress"

    const coordKey = `${slugify(p.state)}-${slugify(p.district)}`
    const coords = districtCoords[coordKey]

    const uiProject: UiProject = {
      id: p.project_id,
      name: p.name,
      districtId,
      allocatedFunds: p.district_allocated,
      usedFunds: p.contractor_paid,
      status: projStatus,
      progress: p.completion_pct,
      description: `${p.scheme} • ${p.contractor}`,
      lat: coords?.lat,
      lng: coords?.lng,
    }

    district.projects.push(uiProject)

    if (p.color === "red") {
      district.flagged = true
    }
  }

  // Build a simple money trail per district based on aggregated amounts
  for (const state of stateMap.values()) {
    for (const district of state.districts) {
      const totalDistrictAllocated = district.allocatedFunds
      const half = totalDistrictAllocated / 2
      district.moneyTrail = [
        {
          source: "Central Government",
          amount: half,
          date: "2024-01-01",
          type: "central-to-state",
        },
        {
          source: `${state.name} State`,
          amount: totalDistrictAllocated,
          date: "2024-01-15",
          type: "state-to-district",
        },
      ]
    }
  }

  return Array.from(stateMap.values())
}

interface FileComplaintParams {
  states: State[]
  districtId: string
  projectId: string
  description: string
  images: string[]
  userEmail?: string
  userName?: string
}

export async function fileComplaintToBackend({
  states,
  districtId,
  projectId,
  description,
  images,
  userEmail = "citizen@example.com",
  userName = "Citizen User",
}: FileComplaintParams): Promise<void> {
  // Find state, district, project for metadata
  let foundState: State | undefined
  let foundDistrict: District | undefined
  let foundProject: UiProject | undefined

  for (const s of states) {
    for (const d of s.districts) {
      if (d.id === districtId) {
        foundState = s
        foundDistrict = d
        const proj = d.projects.find((p) => p.id === projectId)
        if (proj) {
          foundProject = proj
        }
        break
      }
    }
    if (foundDistrict) break
  }

  if (!foundState || !foundDistrict || !foundProject) {
    throw new Error("Could not match complaint to state/district/project")
  }

  // Backend complaint expects minimal fields; attach images info in description
  const fullDescription =
    images.length > 0
      ? `${description}\n\nAttached evidence images: ${images.length}`
      : description

  const body = {
    project_id: foundProject.id,
    project_name: foundProject.name,
    district: foundDistrict.name,
    state: foundState.name,
    description: fullDescription,
    user_email: userEmail,
    user_name: userName,
  }

  const url = API_PATH === "/api-proxy" ? `${API_PATH}/complaints` : `${API_BASE}/api/complaints`
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error("Failed to submit complaint to backend")
  }

  await res.json()
}

