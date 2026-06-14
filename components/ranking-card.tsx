import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Target, CheckCircle, Circle, User } from 'lucide-react'
import type { RankingWithProfile } from '@/lib/types'
import { cn } from '@/lib/utils'

interface RankingCardProps {
  ranking: RankingWithProfile
  position: number
  isCurrentUser?: boolean
}

export function RankingCard({ ranking, position, isCurrentUser = false }: RankingCardProps) {
  const getMedalColor = () => {
    switch (position) {
      case 1:
        return 'text-[oklch(0.78_0.15_85)]' // Gold
      case 2:
        return 'text-[oklch(0.75_0.02_260)]' // Silver
      case 3:
        return 'text-[oklch(0.65_0.12_55)]' // Bronze
      default:
        return 'text-muted-foreground'
    }
  }

  const getPositionBg = () => {
    switch (position) {
      case 1:
        return 'bg-[oklch(0.78_0.15_85/0.15)] border-[oklch(0.78_0.15_85/0.3)]'
      case 2:
        return 'bg-[oklch(0.75_0.02_260/0.15)] border-[oklch(0.75_0.02_260/0.3)]'
      case 3:
        return 'bg-[oklch(0.65_0.12_55/0.15)] border-[oklch(0.65_0.12_55/0.3)]'
      default:
        return 'bg-secondary/50 border-border/50'
    }
  }

  return (
    <Card className={cn(
      'overflow-hidden transition-all hover:shadow-md',
      isCurrentUser && 'ring-2 ring-primary/50',
      position <= 3 && 'border-2',
      getPositionBg()
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Position */}
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full shrink-0',
            position <= 3 ? 'bg-background/80' : 'bg-secondary'
          )}>
            {position <= 3 ? (
              <Trophy className={cn('h-6 w-6', getMedalColor())} />
            ) : (
              <span className="text-lg font-bold text-muted-foreground">{position}</span>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className={cn(
                  'font-semibold truncate',
                  isCurrentUser && 'text-primary'
                )}>
                  {ranking.profile?.name || 'Usuário'}
                  {isCurrentUser && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Você
                    </Badge>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Points */}
          <div className="text-right shrink-0">
            <p className={cn(
              'text-2xl font-bold',
              position === 1 && 'text-[oklch(0.78_0.15_85)]',
              position === 2 && 'text-[oklch(0.75_0.02_260)]',
              position === 3 && 'text-[oklch(0.65_0.12_55)]'
            )}>
              {ranking.total_points}
            </p>
            <p className="text-xs text-muted-foreground">pontos</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          <div className="rounded-lg bg-background/50 p-2">
            <div className="flex items-center justify-center gap-1">
              <Target className="h-3 w-3 text-primary" />
              <span className="text-sm font-semibold">{ranking.exact_scores}</span>
            </div>
            <p className="text-xs text-muted-foreground">Exatos</p>
          </div>
          <div className="rounded-lg bg-background/50 p-2">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle className="h-3 w-3 text-accent" />
              <span className="text-sm font-semibold">{ranking.correct_winners}</span>
            </div>
            <p className="text-xs text-muted-foreground">Vencedores</p>
          </div>
          <div className="rounded-lg bg-background/50 p-2">
            <div className="flex items-center justify-center gap-1">
              <Circle className="h-3 w-3 text-yellow-500" />
              <span className="text-sm font-semibold">{ranking.partial_scores}</span>
            </div>
            <p className="text-xs text-muted-foreground">Parciais</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
