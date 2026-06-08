"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreHorizontal, Shield, ShieldOff, Trash2, Eye } from 'lucide-react'

interface UserActionsProps {
  userId: string
  isAdmin: boolean
  currentUserId: string
}

export function UserActions({ userId, isAdmin, currentUserId }: UserActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAdminDialog, setShowAdminDialog] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const isSelf = userId === currentUserId

  async function toggleAdmin() {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !isAdmin })
        .eq('id', userId)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error('Error toggling admin:', error)
      alert('Erro ao alterar permissão de administrador')
    } finally {
      setIsLoading(false)
      setShowAdminDialog(false)
    }
  }

  async function deleteUser() {
    setIsLoading(true)
    try {
      // Delete ranking first
      await supabase.from('rankings').delete().eq('user_id', userId)
      
      // Delete bets
      await supabase.from('bets').delete().eq('user_id', userId)
      
      // Delete profile
      const { error } = await supabase.from('profiles').delete().eq('id', userId)
      
      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Erro ao excluir usuário')
    } finally {
      setIsLoading(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isLoading}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/admin/usuarios/${userId}`)}>
            <Eye className="mr-2 h-4 w-4" />
            Ver Detalhes
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {!isSelf && (
            <>
              <DropdownMenuItem onClick={() => setShowAdminDialog(true)}>
                {isAdmin ? (
                  <>
                    <ShieldOff className="mr-2 h-4 w-4" />
                    Remover Admin
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Tornar Admin
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Usuário
              </DropdownMenuItem>
            </>
          )}
          {isSelf && (
            <DropdownMenuItem disabled className="text-muted-foreground">
              Você não pode alterar seu próprio usuário
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Toggle Admin Dialog */}
      <AlertDialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isAdmin ? 'Remover Administrador' : 'Tornar Administrador'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isAdmin 
                ? 'Este usuário perderá acesso ao painel administrativo.'
                : 'Este usuário terá acesso completo ao painel administrativo.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={toggleAdmin} disabled={isLoading}>
              {isLoading ? 'Processando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. Todas as apostas e dados do usuário serão excluídos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteUser} 
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
