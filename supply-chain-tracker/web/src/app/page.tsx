'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '@/contexts/Web3Context';
import { useContract } from '@/hooks/useContract';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Package, Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Image from 'next/image';
import type { UserRole } from '@/types';

const ROLES: UserRole[] = ['Producer', 'Factory', 'Retailer', 'Consumer'];

export default function HomePage() {
  const router = useRouter();
  const { walletState, isLoading: walletLoading, connectWallet, deployContract, refreshUserData, contractAddress } = useWeb3();
  const { requestUserRole, isLoading: contractLoading } = useContract();
  
  const [selectedRole, setSelectedRole] = useState<UserRole>('Producer');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  const { address, isConnected, user, isAdmin } = walletState;

  // Redirigir si el usuario ya está aprobado
  useEffect(() => {
    if (isConnected && user && user.status === 1) {
      router.push('/dashboard');
    }
  }, [isConnected, user, router]);

  // No necesitamos auto-detectar porque el admin desplegará el contrato manualmente

  // Manejar conexión de wallet
  const handleConnectWallet = async () => {
    console.log('🔘 Click en conectar wallet');
    try {
      setMessage(null);
      console.log('📞 Llamando a connectWallet...');
      await connectWallet();
      console.log('✅ Wallet conectada');
      setMessage({ type: 'success', text: 'Wallet conectada exitosamente' });
    } catch (error: any) {
      console.error('❌ Error conectando wallet:', error);
      setMessage({ type: 'error', text: error.message || 'Error al conectar wallet' });
    }
  };

  // Manejar deploy del contrato
  const handleDeployContract = async () => {
    try {
      setMessage(null);
      setIsDeploying(true);
      await deployContract();
      setMessage({ 
        type: 'success', 
        text: '¡Contrato desplegado exitosamente! Eres el administrador del sistema.' 
      });
      await refreshUserData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsDeploying(false);
    }
  };

  // Manejar solicitud de rol
  const handleRequestRole = async () => {
    try {
      setMessage(null);
      await requestUserRole(selectedRole);
      setMessage({ 
        type: 'success', 
        text: 'Solicitud enviada exitosamente. Esperando aprobación del administrador.' 
      });
      await refreshUserData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  // Renderizar contenido según el estado
  const renderContent = () => {
    console.log('🎨 Renderizando página principal:', {
      isConnected,
      contractAddress,
      isAdmin,
      hasUser: !!user,
      userStatus: user?.status,
      address
    });

    // No conectado
    if (!isConnected) {
      return (
        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
              <Package className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold">
                Bienvenido a Supply Chain Tracker
              </CardTitle>
              <CardDescription className="text-base">
                Sistema de trazabilidad blockchain para seguimiento de productos
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 px-8">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Conecta tu wallet MetaMask para comenzar a usar el sistema
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">✨ Características:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Trazabilidad completa de productos</li>
                <li>Gestión por roles (Producer, Factory, Retailer, Consumer)</li>
                <li>Transferencias seguras y verificables</li>
                <li>Tecnología blockchain ERC-1155</li>
              </ul>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 px-8 pb-8">
            <Button 
              className="w-full h-12 text-base" 
              onClick={handleConnectWallet}
              disabled={walletLoading}
            >
              {walletLoading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Image 
                    src="/metamask.svg" 
                    alt="MetaMask" 
                    width={24} 
                    height={24} 
                    className="mr-3"
                  />
                  Conectar con MetaMask
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Asegúrate de estar conectado a la red <span className="font-mono bg-muted px-1 py-0.5 rounded">Anvil Local</span>
            </p>
          </CardFooter>
        </Card>
      );
    }

    // Conectado pero sin contrato desplegado
    if (!contractAddress) {
      return (
        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <Package className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">Desplegar Contrato</CardTitle>
              <CardDescription className="text-base">
                Primera conexión detectada - Inicializa el sistema
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 px-8">
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 text-sm space-y-2">
              <p className="font-medium text-blue-400">📝 Importante:</p>
              <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                <li>Serás el <strong className="text-blue-400">administrador</strong> del sistema</li>
                <li>Podrás aprobar y gestionar usuarios</li>
                <li>El contrato se desplegará en Anvil (blockchain local)</li>
                <li>Esta acción solo se hace una vez</li>
              </ul>
            </div>
          </CardContent>
          
          <CardFooter className="px-8 pb-8">
            <Button 
              className="w-full h-12 text-base" 
              onClick={handleDeployContract}
              disabled={isDeploying}
            >
              {isDeploying ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Desplegando Contrato...
                </>
              ) : (
                <>
                  <Package className="mr-3 h-5 w-5" />
                  Desplegar Contrato Inteligente
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      );
    }

    // Usuario es admin (el que desplegó el contrato)
    if (isAdmin) {
      return (
        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">¡Contrato Desplegado Exitosamente!</CardTitle>
              <CardDescription className="text-base">
                Eres el administrador del sistema
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4 px-8">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-sm space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium text-green-400">Sistema Inicializado</p>
                  <p className="text-xs text-muted-foreground font-mono break-all">
                    Contrato: {contractAddress}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-4 text-sm">
              <p className="font-medium mb-2">Como administrador puedes:</p>
              <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                <li>Aprobar o rechazar usuarios pendientes</li>
                <li>Gestionar el estado de usuarios</li>
                <li>Supervisar tokens y transferencias</li>
                <li>Acceder a todas las funcionalidades</li>
              </ul>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3 px-8 pb-8">
            <Button className="w-full h-12 text-base font-medium" onClick={() => router.push('/admin/users')}>
              Gestionar Usuarios Pendientes
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push('/admin')}>
              Ver Panel de Administración
            </Button>
          </CardFooter>
        </Card>
      );
    }

    // Usuario cancelado - puede volver a solicitar acceso
    if (user && user.status === 3) {
      return (
        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
              <Package className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">Solicitar Acceso Nuevamente</CardTitle>
              <CardDescription className="text-base">
                Tu cuenta fue cancelada - Puedes volver a solicitar acceso
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 px-8">
            <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-4 text-sm">
              <p className="font-medium text-orange-400 mb-2">⚠️ Cuenta Cancelada</p>
              <p className="text-muted-foreground">
                Tu solicitud anterior fue cancelada. Puedes solicitar acceso nuevamente 
                seleccionando un rol. El administrador deberá aprobar tu nueva solicitud.
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="role" className="text-base font-medium">Selecciona tu Nuevo Rol</Label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Rol anterior: <span className="font-medium">{user.role}</span> - Puedes cambiarlo si lo deseas
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="px-8 pb-8">
            <Button 
              className="w-full h-12 text-base" 
              onClick={handleRequestRole}
              disabled={contractLoading}
            >
              {contractLoading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Enviando Solicitud...
                </>
              ) : (
                'Solicitar Acceso Nuevamente'
              )}
            </Button>
          </CardFooter>
        </Card>
      );
    }

    // Usuario no registrado
    if (!user) {
      return (
        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
              <Package className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">Solicitar Acceso al Sistema</CardTitle>
              <CardDescription className="text-base">
                Selecciona tu rol en la cadena de suministro
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 px-8">
            <div className="space-y-3">
              <Label htmlFor="role" className="text-base font-medium">Selecciona tu Rol</Label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-3">
              <p className="font-medium">Descripción de roles:</p>
              <div className="space-y-2 text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Producer:</span> Crea materias primas originales
                </div>
                <div>
                  <span className="font-medium text-foreground">Factory:</span> Manufactura productos derivados
                </div>
                <div>
                  <span className="font-medium text-foreground">Retailer:</span> Distribuye productos al mercado
                </div>
                <div>
                  <span className="font-medium text-foreground">Consumer:</span> Consume productos finales
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="px-8 pb-8">
            <Button 
              className="w-full h-12 text-base" 
              onClick={handleRequestRole}
              disabled={contractLoading}
            >
              {contractLoading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Enviando Solicitud...
                </>
              ) : (
                'Solicitar Acceso'
              )}
            </Button>
          </CardFooter>
        </Card>
      );
    }

    // Usuario pendiente de aprobación
    if (user.status === 0) {
      return (
        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-lg">
              <Clock className="h-10 w-10 text-white animate-pulse" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">Solicitud Pendiente</CardTitle>
              <CardDescription className="text-base">
                Tu solicitud está siendo revisada por el administrador
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="px-8">
            <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-6 text-center space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Rol solicitado:</p>
              <p className="text-2xl font-bold text-yellow-500">{user.role}</p>
              <p className="text-sm text-muted-foreground mt-4">
                El administrador revisará tu solicitud pronto. Recibirás acceso al sistema una vez aprobado.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Usuario rechazado
    if (user.status === 2) {
      return (
        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
              <AlertCircle className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">Solicitud Rechazada</CardTitle>
              <CardDescription className="text-base">
                Tu solicitud de acceso no fue aprobada
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="px-8">
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Tu solicitud fue rechazada por el administrador. Por favor, contacta al administrador del sistema para más información.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Usuario cancelado
    if (user.status === 3) {
      return (
        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-500 to-gray-600 shadow-lg">
              <AlertCircle className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">Acceso Cancelado</CardTitle>
              <CardDescription className="text-base">
                Tu acceso al sistema ha sido revocado
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="px-8">
            <div className="rounded-lg bg-gray-500/10 border border-gray-500/20 p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Tu acceso fue cancelado. Ya no puedes operar en el sistema. Contacta al administrador si crees que esto es un error.
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center py-12">
      {message && (
        <div className={`mb-6 max-w-lg w-full mx-auto rounded-lg p-4 border ${
          message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-500' :
          message.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-500' :
          'bg-blue-500/10 border-blue-500/50 text-blue-500'
        }`}>
          <p className="text-sm font-medium text-center">{message.text}</p>
        </div>
      )}
      
      {renderContent()}
    </div>
  );
}
