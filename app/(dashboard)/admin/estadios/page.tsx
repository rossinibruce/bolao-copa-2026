import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Building, Users } from 'lucide-react'
import { StadiumActions } from './stadium-actions'
import { AddStadiumForm } from './add-stadium-form'

export default async function AdminStadiumsPage() {
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

  // Get all stadiums
  const { data: stadiums } = await supabase
    .from('stadiums')
    .select('*')
    .order('country', { ascending: true })
    .order('city', { ascending: true })

  // Group stadiums by country
  const groupedStadiums = stadiums?.reduce((acc, stadium) => {
    const country = stadium.country || 'Sem País'
    if (!acc[country]) acc[country] = []
    acc[country].push(stadium)
    return acc
  }, {} as Record<string, typeof stadiums>) || {}

  const countries = Object.keys(groupedStadiums).sort()

  // Stats
  const totalCapacity = stadiums?.reduce((sum, s) => sum + (s.capacity || 0), 0) || 0

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Building className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Estádios</p>
              <p className="text-2xl font-bold">{stadiums?.length || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <MapPin className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Países Sede</p>
              <p className="text-2xl font-bold">{countries.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Capacidade Total</p>
              <p className="text-2xl font-bold">{totalCapacity.toLocaleString('pt-BR')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Stadium Form */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Estádio</CardTitle>
          <CardDescription>
            Cadastre um novo estádio no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddStadiumForm />
        </CardContent>
      </Card>

      {/* Stadiums by Country */}
      <Card>
        <CardHeader>
          <CardTitle>Estádios por País</CardTitle>
          <CardDescription>
            Todos os {stadiums?.length || 0} estádios organizados por país
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {countries.map((country) => (
              <div key={country}>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="text-base font-semibold px-3 py-1">
                    {country === 'Estados Unidos' ? '🇺🇸' : country === 'México' ? '🇲🇽' : '🇨🇦'} {country}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    ({groupedStadiums[country]?.length} estádios)
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {groupedStadiums[country]?.map((stadium) => (
                    <div 
                      key={stadium.id} 
                      className="rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{stadium.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {stadium.city}
                          </p>
                          {stadium.capacity && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                              <Users className="h-3 w-3" />
                              {stadium.capacity.toLocaleString('pt-BR')} lugares
                            </p>
                          )}
                        </div>
                        <StadiumActions stadium={stadium} />
                      </div>
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
