'use client'

import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { User, Trophy, Target, CheckCircle, Circle, Save, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { Profile, Ranking } from '@/lib/types'

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [ranking, setRanking] = useState<Ranking | null>(null)
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileData) {
          setProfile(profileData)
          setName(profileData.name || '')
        }

        const { data: rankingData } = await supabase
          .from('rankings')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (rankingData) {
          setRanking(rankingData)
        }
      }
      
      setIsLoading(false)
    }

    loadData()
  }, [supabase])

  const handleSave = async () => {
    if (!profile) return
    
    setIsSaving(true)
    
    const { error } = await supabase
      .from('profiles')
      .update({ name })
      .eq('id', profile.id)

    if (!error) {
      setProfile({ ...profile, name })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    
    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas informações e veja suas estatísticas
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>
              Atualize seus dados do perfil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/30">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold">{profile?.name || 'Usuário'}</p>
                <Badge variant={profile?.is_admin ? 'default' : 'secondary'}>
                  {profile?.is_admin ? 'Administrador' : 'Participante'}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="bg-secondary/50"
              />
            </div>

            <Button 
              onClick={handleSave} 
              disabled={isSaving || name === profile?.name}
              className="w-full"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Salvo!
                </>
              ) : isSaving ? (
                'Salvando...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Suas Estatísticas
            </CardTitle>
            <CardDescription>
              Resumo do seu desempenho no bolão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-primary/10 p-4 text-center">
                <p className="text-3xl font-bold text-primary">{ranking?.total_points || 0}</p>
                <p className="text-sm text-muted-foreground">Total de Pontos</p>
              </div>

              <div className="rounded-lg bg-accent/10 p-4 text-center">
                <p className="text-3xl font-bold text-accent">{ranking?.total_bets || 0}</p>
                <p className="text-sm text-muted-foreground">Total de Apostas</p>
              </div>

              <div className="rounded-lg bg-yellow-500/10 p-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Target className="h-5 w-5 text-yellow-500" />
                  <p className="text-2xl font-bold text-yellow-500">{ranking?.exact_scores || 0}</p>
                </div>
                <p className="text-sm text-muted-foreground">Placares Exatos</p>
              </div>

              <div className="rounded-lg bg-green-500/10 p-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <p className="text-2xl font-bold text-green-500">{ranking?.correct_winners || 0}</p>
                </div>
                <p className="text-sm text-muted-foreground">Vencedores Certos</p>
              </div>

              <div className="rounded-lg bg-blue-500/10 p-4 text-center col-span-2">
                <div className="flex items-center justify-center gap-2">
                  <Circle className="h-5 w-5 text-blue-500" />
                  <p className="text-2xl font-bold text-blue-500">{ranking?.partial_scores || 0}</p>
                </div>
                <p className="text-sm text-muted-foreground">Acertos Parciais</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scoring Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Regras de Pontuação</CardTitle>
          <CardDescription>
            Entenda como os pontos são calculados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-lg font-bold text-primary">
                4
              </div>
              <div>
                <p className="font-medium">Placar Exato</p>
                <p className="text-sm text-muted-foreground">Acertou o placar completo</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-lg font-bold text-accent">
                2
              </div>
              <div>
                <p className="font-medium">Acertou Vencedor</p>
                <p className="text-sm text-muted-foreground">Ou acertou o empate</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20 text-lg font-bold text-yellow-500">
                1
              </div>
              <div>
                <p className="font-medium">Acerto Parcial</p>
                <p className="text-sm text-muted-foreground">Gols de apenas um time</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-muted/30 bg-muted/5 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/20 text-lg font-bold text-muted-foreground">
                0
              </div>
              <div>
                <p className="font-medium">Nenhum Acerto</p>
                <p className="text-sm text-muted-foreground">Não acertou nada</p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm text-muted-foreground text-center">
            As regras são mutuamente exclusivas - você recebe apenas a pontuação mais alta que se aplicar.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
