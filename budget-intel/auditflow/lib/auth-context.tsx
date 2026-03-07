"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { AuthUser } from "./backend"
import type { UserRole } from "./types"

const STORAGE_KEY = "govfinance-user"

function loadStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

/** Map backend role to UI UserRole */
export function backendRoleToUserRole(role: AuthUser["role"]): UserRole {
  if (role === "government") return "central"
  return role
}

/**
 * Each role can only access their own dashboard(s). No cross-access.
 * - Central: Central dashboard only
 * - State: State dashboard only
 * - District: District dashboard only
 * - User (citizen): User dashboard + Map
 */
export const ROLE_ACCESS: Record<UserRole, UserRole[]> = {
  central: ["central"],
  state: ["state"],
  district: ["district"],
  user: ["user", "map"],
  map: ["user", "map"],
}

export function canAccessRole(userRole: UserRole, tabRole: UserRole): boolean {
  return ROLE_ACCESS[userRole]?.includes(tabRole) ?? false
}

type AuthContextValue = {
  user: AuthUser | null
  userRole: UserRole | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  allowedRoles: UserRole[]
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setUser(loadStoredUser())
    setHydrated(true)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { loginWithBackend } = await import("./backend")
    const u = await loginWithBackend(email, password)
    setUser(u)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const userRole = useMemo<UserRole | null>(
    () => (user ? backendRoleToUserRole(user.role) : null),
    [user],
  )

  const allowedRoles = useMemo<UserRole[]>(
    () => (userRole ? ROLE_ACCESS[userRole] ?? ["user", "map"] : []),
    [userRole],
  )

  const value = useMemo<AuthContextValue>(
    () => ({ user, userRole, login, logout, allowedRoles }),
    [user, userRole, login, logout, allowedRoles],
  )

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
