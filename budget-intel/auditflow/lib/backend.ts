import type { State, District, Project as UiProject } from "./types"

const API_BASE = "http://localhost:8000"

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
  const res = await fetch(`${API_BASE}/api/projects`)
  if (!res.ok) {
    throw new Error("Failed to fetch projects from backend")
  }
  const data = (await res.json()) as BackendProject[]

  const stateMap = new Map<string, State>()

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

    const uiProject: UiProject = {
      id: p.project_id,
      name: p.name,
      districtId,
      allocatedFunds: p.district_allocated,
      usedFunds: p.contractor_paid,
      status: projStatus,
      progress: p.completion_pct,
      description: `${p.scheme} • ${p.contractor}`,
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
}

export async function fileComplaintToBackend({
  states,
  districtId,
  projectId,
  description,
  images,
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
    user_email: "citizen@example.com",
    user_name: "Citizen User",
  }

  const res = await fetch(`${API_BASE}/api/complaints`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error("Failed to submit complaint to backend")
  }

  await res.json()
}

