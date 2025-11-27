'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { fadeInUp } from '@/lib/ui/animations'
import {
  Target,
  ListTodo,
  CheckSquare,
  TrendingUp,
  AlertCircle,
  FolderKanban,
  LucideIcon,
} from 'lucide-react'

interface DashboardCardProps {
  title: string
  value: string | number
  description?: string
  icon?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  index?: number
}

const iconMap: Record<string, LucideIcon> = {
  FolderKanban,
  Target,
  ListTodo,
  CheckSquare,
  TrendingUp,
  AlertCircle,
}

export function DashboardCard({
  title,
  value,
  description,
  icon,
  trend,
  index = 0,
}: DashboardCardProps) {
  const Icon = icon ? iconMap[icon] : undefined
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    >
      <Card className="h-full transition-shadow hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div
            className={`text-xs font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? '+' : ''}
            {trend.value}%
          </div>
        )}
      </CardContent>
      </Card>
    </motion.div>
  )
}
