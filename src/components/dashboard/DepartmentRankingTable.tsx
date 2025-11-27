'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Trophy } from 'lucide-react'
import { DepartmentRanking } from '@/lib/types'

interface DepartmentRankingTableProps {
  departments: DepartmentRanking[]
}

export function DepartmentRankingTable({ departments }: DepartmentRankingTableProps) {
  if (departments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Ranking de Departamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum departamento com dados disponíveis
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Ranking de Departamentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead className="text-right">%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((dept, index) => (
              <TableRow key={dept.department_id}>
                <TableCell className="font-medium">
                  {index === 0 && (
                    <span className="text-yellow-500">🥇</span>
                  )}
                  {index === 1 && (
                    <span className="text-gray-400">🥈</span>
                  )}
                  {index === 2 && (
                    <span className="text-orange-600">🥉</span>
                  )}
                  {index > 2 && <span className="text-muted-foreground">{index + 1}</span>}
                </TableCell>
                <TableCell className="font-medium">
                  {dept.department_name}
                </TableCell>
                <TableCell>
                  <Progress value={dept.progress} className="w-full" />
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {dept.progress}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
