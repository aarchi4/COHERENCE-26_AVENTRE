export interface State {
  id: string
  name: string
  allocatedFunds: number
  usedFunds: number
  districts: District[]
}

export interface District {
  id: string
  name: string
  stateId: string
  allocatedFunds: number
  usedFunds: number
  projects: Project[]
  flagged: boolean
  moneyTrail: MoneyTrail[]
}

export interface Project {
  id: string
  name: string
  districtId: string
  allocatedFunds: number
  usedFunds: number
  status: 'planning' | 'in-progress' | 'completed' | 'flagged'
  progress: number
  description: string
  lat?: number
  lng?: number
}

export type UserRole = 'central' | 'state' | 'district' | 'user' | 'map'

export interface Complaint {
  id: string
  projectId: string
  description: string
  images: string[]
  createdAt: Date
  status: 'pending' | 'investigating' | 'resolved'
}

export interface MoneyTrail {
  source: string
  amount: number
  date: string
  type: 'central-to-state' | 'state-to-district' | 'reallocation'
}
