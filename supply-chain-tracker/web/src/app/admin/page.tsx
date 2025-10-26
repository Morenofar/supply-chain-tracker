'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '@/contexts/Web3Context';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, CheckCircle, Clock, XCircle, Ban, ArrowRight } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { walletState } = useWeb3();
  const { stats, isLoading } = useAdmin();
  const { isAdmin, isConnected } = walletState;

  // Redirigir si no es admin
  useEffect(() => {
    if (isConnected && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, isConnected, router]);

  if (!isConnected || !isAdmin) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona usuarios y supervisa el sistema
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Usuarios */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.total}</div>
            <p className="text-xs text-muted-foreground">Registrados en el sistema</p>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="border-yellow-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {isLoading ? '...' : stats.pending}
            </div>
            <p className="text-xs text-muted-foreground">Esperando aprobación</p>
          </CardContent>
        </Card>

        {/* Approved */}
        <Card className="border-green-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {isLoading ? '...' : stats.approved}
            </div>
            <p className="text-xs text-muted-foreground">Operando en el sistema</p>
          </CardContent>
        </Card>

        {/* Rejected/Canceled */}
        <Card className="border-red-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {isLoading ? '...' : stats.rejected + stats.canceled}
            </div>
            <p className="text-xs text-muted-foreground">Rechazados o cancelados</p>
          </CardContent>
        </Card>
      </div>

      {/* Acciones Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/users')}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Gestionar Usuarios</span>
              <ArrowRight className="h-5 w-5" />
            </CardTitle>
            <CardDescription>
              Aprobar, rechazar o modificar el estado de los usuarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.pending > 0 && (
              <div className="flex items-center space-x-2 text-yellow-500">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {stats.pending} solicitud{stats.pending > 1 ? 'es' : ''} pendiente{stats.pending > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="opacity-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Estadísticas del Sistema</span>
              <ArrowRight className="h-5 w-5" />
            </CardTitle>
            <CardDescription>
              Ver métricas de tokens y transferencias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Próximamente</p>
          </CardContent>
        </Card>
      </div>

      {/* Información del Admin */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Administrador</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Dirección:</span>
            <span className="font-mono">{walletState.address}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Rol:</span>
            <span className="font-medium">Administrador del Sistema</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Permisos:</span>
            <span className="font-medium">Control Total</span>
          </div>
        </CardContent>
      </Card>

      {/* Botón para ir a gestión de usuarios si hay pending */}
      {stats.pending > 0 && (
        <div className="flex justify-center">
          <Button size="lg" onClick={() => router.push('/admin/users')}>
            <Clock className="mr-2 h-5 w-5" />
            Revisar {stats.pending} Solicitud{stats.pending > 1 ? 'es' : ''} Pendiente{stats.pending > 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  );
}


