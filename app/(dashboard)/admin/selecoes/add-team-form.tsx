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

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

export function AddTeamForm() {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [groupName, setGroupName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!name || !code || !groupName) {
      alert('Preencha todos os campos')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('teams')
        .insert({
          name,
          code: code.toUpperCase(),
          group_name: groupName,
        })

      if (error) throw error

      setName('')
      setCode('')
      setGroupName('')
      router.refresh()
    } catch (error: unknown) {
      console.error('Error adding team:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao adicionar seleção'
      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="name">Nome da Seleção</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Brasil"
          disabled={isLoading}
        />
      </div>

      <div className="w-32">
        <Label htmlFor="code">Código</Label>
        <Input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="BRA"
          maxLength={3}
          disabled={isLoading}
        />
      </div>

      <div className="w-32">
        <Label htmlFor="group">Grupo</Label>
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

      <Button type="submit" disabled={isLoading}>
        <Plus className="mr-2 h-4 w-4" />
        {isLoading ? 'Adicionando...' : 'Adicionar'}
      </Button>
    </form>
  )
}
