'use client';

import { useState } from 'react';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { shortenAddress, getUserStatusName } from '@/lib/utils';
import { CheckCircle, XCircle, Clock, Ban, Loader2, Users } from 'lucide-react';

interface UserTableProps {
  users: User[];
  onChangeStatus: (address: string, newStatus: number) => Promise<void>;
  isLoading?: boolean;
}

export function UserTable({ users, onChangeStatus, isLoading }: UserTableProps) {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [newStatus, setNewStatus] = useState<number>(1); // Default: Approved
  const [isUpdating, setIsUpdating] = useState(false);

  // Alternar selección de usuario
  const toggleUser = (address: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(address)) {
      newSelected.delete(address);
    } else {
      newSelected.add(address);
    }
    setSelectedUsers(newSelected);
  };

  // Seleccionar todos los usuarios pending
  const selectAllPending = () => {
    const pendingUsers = users.filter((u) => u.status === 0);
    setSelectedUsers(new Set(pendingUsers.map((u) => u.userAddress)));
  };

  // Limpiar selección
  const clearSelection = () => {
    setSelectedUsers(new Set());
  };

  // Aplicar cambio de estado
  const handleApplyChanges = async () => {
    if (selectedUsers.size === 0) return;

    setIsUpdating(true);
    try {
      // Aplicar cambio a cada usuario seleccionado
      for (const address of selectedUsers) {
        await onChangeStatus(address, newStatus);
      }
      clearSelection();
    } catch (error) {
      console.error('Error updating users:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Obtener icono según el estado
  const getStatusIcon = (status: number) => {
    switch (status) {
      case 0:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 1:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 2:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 3:
        return <Ban className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  // Obtener variante del badge según el estado
  const getStatusBadgeVariant = (status: number) => {
    switch (status) {
      case 0:
        return 'warning';
      case 1:
        return 'success';
      case 2:
        return 'destructive';
      case 3:
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Obtener color de fondo según el estado
  const getStatusBgColor = (status: number) => {
    switch (status) {
      case 0:
        return 'bg-yellow-500/5';
      case 1:
        return 'bg-green-500/5';
      case 2:
        return 'bg-red-500/5';
      case 3:
        return 'bg-gray-500/5';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">No hay usuarios registrados</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Los usuarios podrán solicitar acceso desde la página principal. 
              Cuando lo hagan, aparecerán aquí con estado "Pending" para que puedas aprobarlos.
            </p>
          </div>
          <div className="pt-4 text-xs text-muted-foreground">
            <p>💡 Instrucciones:</p>
            <ol className="list-decimal list-inside space-y-1 mt-2 text-left max-w-md mx-auto">
              <li>Los usuarios deben conectar MetaMask en la página principal</li>
              <li>Seleccionar su rol (Producer, Factory, Retailer, Consumer)</li>
              <li>Solicitar acceso al sistema</li>
              <li>Tú podrás aprobarlos desde aquí</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controles de acción masiva */}
      {selectedUsers.size > 0 && (
        <Card className="border-primary">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">
                  {selectedUsers.size} usuario(s) seleccionado(s)
                </span>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Limpiar
                </Button>
              </div>

              <div className="flex items-center space-x-4">
                <select
                  value={newStatus.toString()}
                  onChange={(e) => setNewStatus(Number(e.target.value))}
                  className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="1">Approved</option>
                  <option value="0">Pending</option>
                  <option value="2">Rejected</option>
                  <option value="3">Canceled</option>
                </select>

                <Button onClick={handleApplyChanges} disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Aplicando...
                    </>
                  ) : (
                    'Aplicar Cambios'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botón para seleccionar todos los pending */}
      {users.some((u) => u.status === 0) && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={selectAllPending}>
            Seleccionar Todos Pending
          </Button>
        </div>
      )}

      {/* Tabla de usuarios */}
      <div className="space-y-2">
        {users.map((user) => (
          <Card
            key={user.userAddress}
            className={`transition-all ${
              selectedUsers.has(user.userAddress)
                ? 'border-primary ring-2 ring-primary/20'
                : ''
            } ${getStatusBgColor(user.status)}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                {/* Checkbox y datos del usuario */}
                <div className="flex items-center space-x-4 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.userAddress)}
                    onChange={() => toggleUser(user.userAddress)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Dirección */}
                    <div>
                      <p className="text-xs text-muted-foreground">Dirección</p>
                      <p className="font-mono text-sm font-medium">
                        {shortenAddress(user.userAddress)}
                      </p>
                    </div>

                    {/* Rol */}
                    <div>
                      <p className="text-xs text-muted-foreground">Rol</p>
                      <p className="text-sm font-medium">{user.role}</p>
                    </div>

                    {/* Estado */}
                    <div>
                      <p className="text-xs text-muted-foreground">Estado</p>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(user.status)}
                        <Badge variant={getStatusBadgeVariant(user.status)}>
                          {getUserStatusName(user.status)}
                        </Badge>
                      </div>
                    </div>

                    {/* ID */}
                    <div>
                      <p className="text-xs text-muted-foreground">ID</p>
                      <p className="text-sm font-medium">#{user.id.toString()}</p>
                    </div>
                  </div>
                </div>

                {/* Acciones rápidas */}
                <div className="hidden md:flex items-center space-x-2">
                  {user.status === 0 && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onChangeStatus(user.userAddress, 1)}
                        className="text-green-600 hover:text-green-700 hover:border-green-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onChangeStatus(user.userAddress, 2)}
                        className="text-red-600 hover:text-red-700 hover:border-red-600"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Rechazar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

