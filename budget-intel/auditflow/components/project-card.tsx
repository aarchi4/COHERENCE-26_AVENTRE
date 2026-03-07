"use client"

import { Project } from "@/lib/types"
import { formatCurrency, getStatusColor } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { FolderKanban, AlertTriangle, CheckCircle2, Clock, PlayCircle } from "lucide-react"

interface ProjectCardProps {
  project: Project
}

function getStatusIcon(status: Project['status']) {
  switch (status) {
    case 'completed': return <CheckCircle2 className="h-3.5 w-3.5" />
    case 'in-progress': return <PlayCircle className="h-3.5 w-3.5" />
    case 'planning': return <Clock className="h-3.5 w-3.5" />
    case 'flagged': return <AlertTriangle className="h-3.5 w-3.5" />
    default: return null
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const usedPercentageRaw = (project.usedFunds / project.allocatedFunds) * 100
  const usedPercentage = Math.min(100, Math.max(0, usedPercentageRaw))

  return (
    <Card className={`transition-all hover:border-primary/50 ${
      project.status === 'flagged' ? 'border-destructive/50 bg-destructive/5' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              project.status === 'flagged' ? 'bg-destructive/10' : 
              project.status === 'completed' ? 'bg-success/10' : 'bg-primary/10'
            }`}>
              <FolderKanban className={`h-5 w-5 ${
                project.status === 'flagged' ? 'text-destructive' : 
                project.status === 'completed' ? 'text-success' : 'text-primary'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold text-foreground line-clamp-1">
                {project.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                {project.description}
              </p>
            </div>
          </div>
          <Badge className={`shrink-0 gap-1 ${getStatusColor(project.status)}`}>
            {getStatusIcon(project.status)}
            <span className="capitalize">{project.status.replace('-', ' ')}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Allocated</span>
            <p className="text-sm font-medium text-foreground">{formatCurrency(project.allocatedFunds)}</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Utilized</span>
            <p className="text-sm font-medium text-primary">{formatCurrency(project.usedFunds)}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-foreground font-medium">{project.progress}%</span>
          </div>
          <Progress 
            value={project.progress} 
            className={`h-2.5 ${
              project.status === 'flagged' ? '[&>div]:bg-destructive' :
              project.status === 'completed' ? '[&>div]:bg-success' : ''
            }`}
          />
        </div>
        <div className="flex justify-between text-xs pt-1">
          <span className="text-muted-foreground">Budget Usage</span>
          <span className={`font-medium ${usedPercentageRaw > 80 ? 'text-warning' : 'text-foreground'}`}>
            {usedPercentage.toFixed(1)}%{usedPercentageRaw > 100 ? " (overspend)" : ""}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
