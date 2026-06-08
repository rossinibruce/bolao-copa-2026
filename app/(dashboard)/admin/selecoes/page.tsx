import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flag, Globe, Users } from 'lucide-react'
import { TeamActions } from './team-actions'
import { AddTeamForm } from './add-team-form'
import { TeamFlag } from '@/components/team-flag'

export default async function AdminTeamsPage() {
  const supabase = await createClient()

  // Get current user and check if admin
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/dashboard')
  }

  // Get all teams grouped by group
  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .order('group_name', { ascending: true })
    .order('name', { ascending: true })

  // Group teams by group_name
  const groupedTeams = teams?.reduce((acc, team) => {
    const group = team.group_name || 'Sem Grupo'
    if (!acc[group]) acc[group] = []
    acc[group].push(team)
    return acc
  }, {} as Record<string, typeof teams>) || {}

  const groups = Object.keys(groupedTeams).sort()

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Flag className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Seleções</p>
              <p className="text-2xl font-bold">{teams?.length || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <Globe className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Grupos</p>
              <p className="text-2xl font-bold">{groups.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Times por Grupo</p>
              <p className="text-2xl font-bold">4</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Team Form */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Seleção</CardTitle>
          <CardDescription>
            Cadastre uma nova seleção no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddTeamForm />
        </CardContent>
      </Card>

      {/* Teams by Group */}
      <Card>
        <CardHeader>
          <CardTitle>Seleções por Grupo</CardTitle>
          <CardDescription>
            Todas as {teams?.length || 0} seleções organizadas por grupo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((groupName) => (
              <div key={groupName} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline" className="text-lg font-bold px-3 py-1">
                    Grupo {groupName}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {groupedTeams[groupName]?.length} times
                  </span>
                </div>
                <div className="space-y-2">
                  {groupedTeams[groupName]?.map((team) => (
                    <div 
                      key={team.id} 
                      className="flex items-center justify-between rounded-lg bg-muted/50 p-3 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <TeamFlag code={team.code} size="md" />
                        <div>
                          <p className="font-medium">{team.name}</p>
                          <p className="text-xs text-muted-foreground">{team.code}</p>
                        </div>
                      </div>
                      <TeamActions team={team} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
