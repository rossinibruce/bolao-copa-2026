import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Users, Calendar, Target, CheckCircle, Circle, ArrowRight, Flag } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()
  
  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    redirect('/dashboard')
  }

  // Get public stats
  const { count: totalMatches } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })

  const { count: totalParticipants } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Logo */}
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/20 mb-8 animate-pulse-gold">
              <Trophy className="h-12 w-12 text-primary" />
            </div>

            {/* Title */}
            <Badge variant="outline" className="mb-4 text-sm px-4 py-1">
              Copa do Mundo FIFA 2026
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-balance">
              <span className="text-primary">Bolão</span> Copa 2026
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl text-pretty">
              Participe do maior bolão da Copa do Mundo! Faça suas apostas, 
              acumule pontos e dispute com amigos pelo topo do ranking.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/auth/sign-up">
                  Criar Conta
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link href="/auth/login">
                  Já tenho conta
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-8 mt-12">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{totalMatches || 72}</p>
                <p className="text-muted-foreground">Jogos</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{totalParticipants || 0}</p>
                <p className="text-muted-foreground">Participantes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Como Funciona</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Aposte em todos os jogos da Copa do Mundo e ganhe pontos baseado na sua precisão
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Escolha os Jogos</h3>
              <p className="text-muted-foreground">
                Navegue pelos 72 jogos da Copa e faça suas apostas antes do início de cada partida.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 mx-auto mb-4">
                <Target className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Faça seu Palpite</h3>
              <p className="text-muted-foreground">
                Informe o placar que você acredita para cada jogo. Quanto mais preciso, mais pontos!
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10 mx-auto mb-4">
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Suba no Ranking</h3>
              <p className="text-muted-foreground">
                Acompanhe sua posição no ranking geral e dispute com amigos pelo primeiro lugar.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Scoring Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Sistema de Pontuação</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pontuação clara e justa - cada palpite conta!
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 mx-auto mb-4">
                <span className="text-3xl font-bold text-primary">4</span>
              </div>
              <h3 className="font-semibold mb-1">Placar Exato</h3>
              <p className="text-sm text-muted-foreground">
                Acertou o resultado completo
              </p>
            </CardContent>
          </Card>

          <Card className="border-accent/30 bg-accent/5">
            <CardContent className="p-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 mx-auto mb-4">
                <span className="text-3xl font-bold text-accent">2</span>
              </div>
              <h3 className="font-semibold mb-1">Acertou Vencedor</h3>
              <p className="text-sm text-muted-foreground">
                Ou acertou o empate
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="p-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/20 mx-auto mb-4">
                <span className="text-3xl font-bold text-yellow-500">1</span>
              </div>
              <h3 className="font-semibold mb-1">Acerto Parcial</h3>
              <p className="text-sm text-muted-foreground">
                Gols de apenas um time
              </p>
            </CardContent>
          </Card>

          <Card className="border-muted/30 bg-muted/5">
            <CardContent className="p-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/20 mx-auto mb-4">
                <span className="text-3xl font-bold text-muted-foreground">0</span>
              </div>
              <h3 className="font-semibold mb-1">Nenhum Acerto</h3>
              <p className="text-sm text-muted-foreground">
                Não acertou nada
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Host Countries */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Países Sede</h2>
          <p className="text-muted-foreground">
            A primeira Copa com 48 seleções, em 3 países da América do Norte
          </p>
        </div>

        <div className="flex justify-center gap-8 flex-wrap">
          <div className="text-center">
            <span className="text-6xl" role="img" aria-label="Estados Unidos">🇺🇸</span>
            <p className="mt-2 font-medium">Estados Unidos</p>
          </div>
          <div className="text-center">
            <span className="text-6xl" role="img" aria-label="México">🇲🇽</span>
            <p className="mt-2 font-medium">México</p>
          </div>
          <div className="text-center">
            <span className="text-6xl" role="img" aria-label="Canadá">🇨🇦</span>
            <p className="mt-2 font-medium">Canadá</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Pronto para participar?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Crie sua conta agora e comece a fazer suas apostas para a Copa do Mundo 2026!
            </p>
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/auth/sign-up">
                Criar Conta Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Copa do Mundo FIFA 2026 - EUA, México e Canadá</p>
          <p className="mt-1">Sistema de Apostas Amistosas - Sem fins lucrativos</p>
        </div>
      </footer>
    </div>
  )
}
