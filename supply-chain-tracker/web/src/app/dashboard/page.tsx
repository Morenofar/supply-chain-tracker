'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '@/contexts/Web3Context';
import { useContract } from '@/hooks/useContract';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, ArrowLeftRight, Plus, CheckCircle, Clock, XCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { getUserTokens, getUserTransfers, getTransfer } from '@/lib/web3';

export default function DashboardPage() {
  const router = useRouter();
  const { walletState } = useWeb3();
  const { address, isConnected, user, isAdmin } = walletState;
  
  const [tokensCount, setTokensCount] = useState(0);
  const [pendingTransfersCount, setPendingTransfersCount] = useState(0);
  const [completedTransfersCount, setCompletedTransfersCount] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Redirigir si no está conectado o no tiene usuario aprobado
  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    } else if (user && user.status !== 1 && !isAdmin) {
      router.push('/');
    }
  }, [isConnected, user, isAdmin, router]);

  // Función para cargar estadísticas (reutilizable)
  const loadStats = async () => {
    if (!address || !user) {
      setIsLoadingStats(false);
      return;
    }

    try {
      console.log('📊 Cargando estadísticas del dashboard...');
      
      // Cargar tokens
      const tokenIds = await getUserTokens(address);
      setTokensCount(tokenIds.length);
      console.log(`📦 Tokens encontrados: ${tokenIds.length}`);

      // Cargar transferencias
      const transferIds = await getUserTransfers(address);
      console.log(`🔄 Transferencias encontradas: ${transferIds.length}`);
      
      if (transferIds.length > 0) {
        // Cargar detalles de cada transferencia para contar por estado
        const transferDetailsPromises = transferIds.map(async (id) => {
          try {
            return await getTransfer(id);
          } catch (error) {
            console.error(`Error cargando transferencia ${id}:`, error);
            return null;
          }
        });

        const transfers = (await Promise.all(transferDetailsPromises)).filter(t => t !== null);
        
        // Contar transferencias pendientes (enviadas o recibidas por el usuario)
        const pending = transfers.filter(
          t => t && Number(t.status) === 0 && 
          (t.from.toLowerCase() === address.toLowerCase() || t.to.toLowerCase() === address.toLowerCase())
        ).length;
        setPendingTransfersCount(pending);
        console.log(`⏳ Transferencias pendientes (enviadas y recibidas): ${pending}`);

        // Contar transferencias completadas
        const completed = transfers.filter(t => t && Number(t.status) === 1).length;
        setCompletedTransfersCount(completed);
        console.log(`✅ Transferencias completadas: ${completed}`);
      } else {
        setPendingTransfersCount(0);
        setCompletedTransfersCount(0);
      }

      console.log('✅ Estadísticas cargadas');
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Función para refrescar manualmente
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadStats();
    setIsRefreshing(false);
  };

  // Cargar estadísticas dinámicamente con polling
  useEffect(() => {
    if (address && user) {
      loadStats();
      
      // Polling automático cada 10 segundos para actualizar estadísticas
      const interval = setInterval(() => {
        console.log('🔄 Actualizando estadísticas automáticamente...');
        loadStats();
      }, 10000); // 10 segundos

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, user]);

  if (!isConnected || (!user && !isAdmin)) {
    return null; // O un loading spinner
  }

  // Estadísticas dinámicas
  const stats = [
    {
      title: 'Mis Tokens',
      value: isLoadingStats ? '...' : tokensCount.toString(),
      description: 'Tokens activos en tu inventario',
      icon: Package,
      href: '/tokens',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Transferencias Pendientes',
      value: isLoadingStats ? '...' : pendingTransfersCount.toString(),
      description: 'Enviadas y recibidas en espera',
      icon: Clock,
      href: '/transfers',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Transferencias Completadas',
      value: isLoadingStats ? '...' : completedTransfersCount.toString(),
      description: 'Transferencias exitosas',
      icon: CheckCircle,
      href: '/transfers',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  const quickActions = user ? [
    {
      title: 'Crear Nuevo Token',
      description: 'Registra un nuevo producto o materia prima',
      icon: Plus,
      href: '/tokens/create',
      color: 'text-blue-500',
      show: ['Producer', 'Factory'].includes(user.role),
    },
    {
      title: 'Ver Mis Tokens',
      description: 'Explora tu inventario de tokens',
      icon: Package,
      href: '/tokens',
      color: 'text-purple-500',
      show: true,
    },
    {
      title: 'Transferir Token',
      description: 'Envía tokens a otros participantes',
      icon: ArrowLeftRight,
      href: '/tokens',
      color: 'text-green-500',
      show: true,
    },
  ] : [];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido, <span className="font-medium">{user?.role || 'Administrador'}</span>
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* User Status Banner (solo si no es admin) */}
      {user && (
        <Card className="border-l-4 border-l-green-500 bg-green-500/5">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              <CardTitle className="text-lg">Cuenta Verificada</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tu cuenta ha sido aprobada por el administrador. Ya puedes crear tokens y realizar transferencias según tu rol.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Admin Warning */}
      {isAdmin && !user && (
        <Card className="border-l-4 border-l-blue-500 bg-blue-500/5">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">Panel de Administrador</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Eres el administrador del sistema. Tienes acceso completo a todas las funcionalidades.
            </p>
            <Button asChild>
              <Link href="/admin/users">
                Gestionar Usuarios
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      {user && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <Link key={stat.title} href={stat.href}>
                <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.filter(action => action.show).map((action) => (
                <Link key={action.title} href={action.href}>
                  <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-muted`}>
                          <action.icon className={`h-5 w-5 ${action.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{action.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Role Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información de Tu Rol</CardTitle>
              <CardDescription>Permisos y capacidades según tu rol</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.role === 'Producer' && (
                  <div className="space-y-2">
                    <p className="font-medium">Productor</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Puedes crear tokens de materias primas (sin tokens padre)</li>
                      <li>Puedes transferir tokens a Fábricas</li>
                      <li>Puedes ver la trazabilidad de tus productos</li>
                    </ul>
                  </div>
                )}
                {user.role === 'Factory' && (
                  <div className="space-y-2">
                    <p className="font-medium">Fábrica</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Puedes recibir tokens de Productores</li>
                      <li>Puedes crear productos derivados usando tokens padre</li>
                      <li>Puedes transferir productos terminados a Minoristas</li>
                      <li>Puedes quemar tokens al manufacturar productos</li>
                    </ul>
                  </div>
                )}
                {user.role === 'Retailer' && (
                  <div className="space-y-2">
                    <p className="font-medium">Minorista</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Puedes recibir tokens de Fábricas</li>
                      <li>Puedes transferir tokens a Consumidores</li>
                      <li>Puedes ver toda la trazabilidad del producto</li>
                    </ul>
                  </div>
                )}
                {user.role === 'Consumer' && (
                  <div className="space-y-2">
                    <p className="font-medium">Consumidor</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Puedes recibir tokens de Minoristas</li>
                      <li>Puedes ver toda la trazabilidad del producto</li>
                      <li>Puedes verificar el origen y el recorrido completo del producto</li>
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

