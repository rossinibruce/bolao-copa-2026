"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import type { Team, Stadium } from '@/lib/types'

const STAGES = [
  { value: 'group_stage', label: 'Fase de Grupos' },
  { value: 'round_of_32', label: 'Dezesseis-avos de final' },
  { value: 'round_of_16', label: 'Oitavas de Final' },
  { value: 'quarter_finals', label: 'Quartas de Final' },
  { value: 'semi_finals', label: 'Semifinais' },
  { value: 'third_place', label: 'Disputa 3º Lugar' },
  { value: 'final', label: 'Final' },
]

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

interface AddMatchFormProps {
  teams: Team[]
  stadiums: Stadium[]
}

export function AddMatchForm({ teams, stadiums }: AddMatchFormProps) {
  const [homeTeamId, setHomeTeamId] = useState('')
  const [awayTeamId, setAwayTeamId] = useState('')
  const [stadiumId, setStadiumId] = useState('')
  const [matchDate, setMatchDate] = useState('')
  const [matchTime, setMatchTime] = useState('')
  const [stage, setStage] = useState('group_stage')
  const [groupName, setGroupName] = useState('')
  const [matchNumber, setMatchNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!homeTeamId || !awayTeamId || !stadiumId || !matchDate || !matchTime) {
      alert('Preencha os campos obrigatórios')
      return
    }

    if (homeTeamId === awayTeamId) {
      alert('As seleções devem ser diferentes')
      return
    }

    setIsLoading(true)
    try {
      const dateTime = new Date(`${matchDate}T${matchTime}`)
      
      const { error } = await supabase
        .from('matches')
        .insert({
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          stadium_id: stadiumId,
          match_date: dateTime.toISOString(),
          stage,
          group_name: stage === 'group_stage' ? groupName : null,
          match_number: matchNumber ? parseInt(matchNumber) : null,
          status: 'scheduled',
        })

      if (error) throw error

      // Reset form
      setHomeTeamId('')
      setAwayTeamId('')
      setStadiumId('')
      setMatchDate('')
      setMatchTime('')
      setStage('group_stage')
      setGroupName('')
      setMatchNumber('')
      router.refresh()
    } catch (error: unknown) {
      console.error('Error adding match:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao adicionar jogo'
      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="homeTeam">Seleção Casa *</Label>
          <Select value={homeTeamId} onValueChange={setHomeTeamId} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name} ({team.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="awayTeam">Seleção Visitante *</Label>
          <Select value={awayTeamId} onValueChange={setAwayTeamId} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name} ({team.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stadium">Estádio *</Label>
          <Select value={stadiumId} onValueChange={setStadiumId} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {stadiums.map((stadium) => (
                <SelectItem key={stadium.id} value={stadium.id}>
                  {stadium.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stage">Fase *</Label>
          <Select value={stage} onValueChange={setStage} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAGES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="matchDate">Data *</Label>
          <Input
            id="matchDate"
            type="date"
            value={matchDate}
            onChange={(e) => setMatchDate(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="matchTime">Horário *</Label>
          <Input
            id="matchTime"
            type="time"
            value={matchTime}
            onChange={(e) => setMatchTime(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {stage === 'group_stage' && (
          <div className="space-y-2">
            <Label htmlFor="groupName">Grupo</Label>
            <Select value={groupName} onValueChange={setGroupName} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Grupo" />
              </SelectTrigger>
              <SelectContent>
                {GROUPS.map((g) => (
                  <SelectItem key={g} value={g}>
                    Grupo {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="matchNumber">Número do Jogo</Label>
          <Input
            id="matchNumber"
            type="number"
            value={matchNumber}
            onChange={(e) => setMatchNumber(e.target.value)}
            placeholder="Ex: 1"
            disabled={isLoading}
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        <Plus className="mr-2 h-4 w-4" />
        {isLoading ? 'Adicionando...' : 'Adicionar Jogo'}
      </Button>
    </form>
  )
}
