'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '@/contexts/Web3Context';
import { useAdmin } from '@/hooks/useAdmin';
import { UserTable } from '@/components/UserTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Users } from 'lucide-react';

export default function AdminUsersPage() {
  const router = useRouter();
  const { walletState } = useWeb3();
  const { users, stats, isLoading, error, loadUsers, changeUserStatus } = useAdmin();
  const { isAdmin, isConnected } = walletState;
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Redirigir si no es admin
  useEffect(() => {
    if (isConnected && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, isConnected, router]);

  // Manejar cambio de estado
  const handleChangeStatus = async (address: string, newStatus: number) => {
    try {
      setMessage(null);
      await changeUserStatus(address, newStatus);
      setMessage({ type: 'success', text: 'Estado actualizado exitosamente' });
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  if (!isConnected || !isAdmin) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin')}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Panel
          </Button>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-2">
            Administra los permisos y estados de los usuarios del sistema
          </p>
        </div>

        <Button onClick={loadUsers} variant="outline" disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas Compactas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
        <Card className="border-gray-500/50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-500">{stats.canceled}</div>
            <p className="text-xs text-muted-foreground">Canceled</p>
          </CardContent>
        </Card>
      </div>

      {/* Mensajes */}
      {message && (
        <div
          className={`rounded-lg p-4 ${
            message.type === 'success'
              ? 'bg-green-500/10 text-green-500 border border-green-500/50'
              : 'bg-red-500/10 text-red-500 border border-red-500/50'
          }`}
        >
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg p-4 bg-red-500/10 text-red-500 border border-red-500/50">
          <p className="text-sm font-medium">Error: {error}</p>
        </div>
      )}

      {/* Guía de Estados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Guía de Estados</CardTitle>
          <CardDescription>Significado de cada estado de usuario</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mt-1" />
              <div>
                <p className="font-medium">Pending</p>
                <p className="text-xs text-muted-foreground">
                  Usuario registrado, esperando aprobación
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500 mt-1" />
              <div>
                <p className="font-medium">Approved</p>
                <p className="text-xs text-muted-foreground">
                  Usuario aprobado, puede operar
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500 mt-1" />
              <div>
                <p className="font-medium">Rejected</p>
                <p className="text-xs text-muted-foreground">
                  Solicitud rechazada, no puede operar
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-500 mt-1" />
              <div>
                <p className="font-medium">Canceled</p>
                <p className="text-xs text-muted-foreground">
                  Usuario cancelado, acceso revocado
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Usuarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Usuarios del Sistema
          </CardTitle>
          <CardDescription>
            {users.length > 0
              ? `Mostrando ${users.length} usuario${users.length > 1 ? 's' : ''}`
              : 'No hay usuarios registrados'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserTable
            users={users}
            onChangeStatus={handleChangeStatus}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}


