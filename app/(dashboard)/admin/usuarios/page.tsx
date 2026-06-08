import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Shield, Trophy, Calendar } from 'lucide-react'
import { UserActions } from './user-actions'
import type { Profile, Ranking } from '@/lib/types'

type ProfileWithRanking = Profile & {
  ranking?: Ranking
}

export default async function AdminUsersPage() {
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

  // Get all users with rankings
  const { data: users } = await supabase
    .from('profiles')
    .select(`
      *,
      ranking:rankings(*)
    `)
    .order('created_at', { ascending: false })

  // Get bet counts per user
  const { data: betCounts } = await supabase
    .from('bets')
    .select('user_id')

  const userBetCounts = betCounts?.reduce((acc, bet) => {
    acc[bet.user_id] = (acc[bet.user_id] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  // Stats
  const totalUsers = users?.length || 0
  const adminUsers = users?.filter(u => u.is_admin).length || 0
  const usersWithBets = Object.keys(userBetCounts).length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Usuários</p>
              <p className="text-2xl font-bold">{totalUsers}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Administradores</p>
              <p className="text-2xl font-bold">{adminUsers}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <Trophy className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Usuários Ativos</p>
              <p className="text-2xl font-bold">{usersWithBets}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Usuários</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os usuários do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Usuário</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Cadastro</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Apostas</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Pontos</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Posição</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((userData) => {
                  const userProfile = userData as ProfileWithRanking
                  const ranking = Array.isArray(userProfile.ranking) 
                    ? userProfile.ranking[0] 
                    : userProfile.ranking
                  const betCount = userBetCounts[userProfile.id] || 0
                  
                  return (
                    <tr key={userProfile.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                            {userProfile.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{userProfile.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {userProfile.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(userProfile.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-medium">{betCount}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-primary">{ranking?.total_points || 0}</span>
                      </td>
                      <td className="p-3 text-center">
                        {ranking?.position ? (
                          <Badge variant={ranking.position <= 3 ? "default" : "secondary"}>
                            #{ranking.position}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {userProfile.is_admin ? (
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline">Usuário</Badge>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <UserActions 
                          userId={userProfile.id} 
                          isAdmin={userProfile.is_admin} 
                          currentUserId={user?.id || ''}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {(!users || users.length === 0) && (
              <p className="text-center text-muted-foreground py-8">
                Nenhum usuário cadastrado ainda.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
