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

const COUNTRIES = ['Estados Unidos', 'México', 'Canadá']

export function AddStadiumForm() {
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [capacity, setCapacity] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!name || !city || !country) {
      alert('Preencha os campos obrigatórios')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('stadiums')
        .insert({
          name,
          city,
          country,
          capacity: capacity ? parseInt(capacity) : null,
        })

      if (error) throw error

      setName('')
      setCity('')
      setCountry('')
      setCapacity('')
      router.refresh()
    } catch (error: unknown) {
      console.error('Error adding stadium:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao adicionar estádio'
      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="name">Nome do Estádio *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: MetLife Stadium"
          disabled={isLoading}
        />
      </div>

      <div className="w-40">
        <Label htmlFor="city">Cidade *</Label>
        <Input
          id="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Ex: Nova York"
          disabled={isLoading}
        />
      </div>

      <div className="w-40">
        <Label htmlFor="country">País *</Label>
        <Select value={country} onValueChange={setCountry} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="País" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-32">
        <Label htmlFor="capacity">Capacidade</Label>
        <Input
          id="capacity"
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          placeholder="70000"
          disabled={isLoading}
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        <Plus className="mr-2 h-4 w-4" />
        {isLoading ? 'Adicionando...' : 'Adicionar'}
      </Button>
    </form>
  )
}
