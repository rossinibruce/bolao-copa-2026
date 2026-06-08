"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Shield, 
  Users, 
  Calendar, 
  Flag, 
  MapPin,
  LayoutDashboard
} from 'lucide-react'

const adminNavItems = [
  {
    title: 'Visão Geral',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Usuários',
    href: '/admin/usuarios',
    icon: Users,
  },
  {
    title: 'Seleções',
    href: '/admin/selecoes',
    icon: Flag,
  },
  {
    title: 'Estádios',
    href: '/admin/estadios',
    icon: MapPin,
  },
  {
    title: 'Jogos',
    href: '/admin/jogos',
    icon: Calendar,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/30">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground">
            Gerencie o sistema do Bolão Copa 2026
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex flex-wrap gap-2 border-b border-border pb-4">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname.startsWith(item.href))
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* Content */}
      {children}
    </div>
  )
}
