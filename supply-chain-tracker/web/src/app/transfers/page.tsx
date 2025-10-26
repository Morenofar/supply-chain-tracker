'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '@/contexts/Web3Context';
import { useContract } from '@/hooks/useContract';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight, Loader2, AlertCircle, Check, X, Clock, Ban, ArrowRight, ArrowLeft } from 'lucide-react';
import { getUserTransfers, getTransfer, getToken } from '@/lib/web3';
import { shortenAddress } from '@/lib/utils';

interface TransferData {
  id: number;
  from: string;
  to: string;
  tokenId: number;
  tokenName: string; // NUEVO: nombre del token para mostrar
  amount: number;
  dateCreated: number;
  status: number; // 0: Pending, 1: Accepted, 2: Rejected, 3: Cancelled
  exists: boolean;
  isSender: boolean;
  isReceiver: boolean;
}

export default function TransfersPage() {
  const router = useRouter();
  const { walletState } = useWeb3();
  const { acceptTransfer, rejectTransfer, cancelTransfer, isLoading: contractLoading } = useContract();
  const { address, isConnected, user } = walletState;

  const [transfers, setTransfers] = useState<TransferData[]>([]);
  const [filteredTransfers, setFilteredTransfers] = useState<TransferData[]>([]);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received' | 'pending'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Verificar acceso
  useEffect(() => {
    if (!isConnected || !user || user.status !== 1) {
      router.push('/dashboard');
    }
  }, [isConnected, user, router]);

  // Cargar transferencias del usuario
  useEffect(() => {
    const loadTransfers = async () => {
      if (!address) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log('📋 Cargando transferencias del usuario:', address);
        const transferIds = await getUserTransfers(address);
        console.log('📦 IDs de transferencias encontradas:', transferIds);

        if (transferIds.length === 0) {
          setTransfers([]);
          setFilteredTransfers([]);
          setIsLoading(false);
          return;
        }

        // Cargar detalles de cada transferencia incluyendo nombre del token
        const transferDetailsPromises = transferIds.map(async (id) => {
          try {
            const transfer = await getTransfer(id);
            
            // Obtener nombre del token
            let tokenName = `Token #${transfer.tokenId}`;
            try {
              const tokenData = await getToken(Number(transfer.tokenId));
              tokenName = tokenData.name;
            } catch (error) {
              console.warn(`No se pudo cargar nombre del token ${transfer.tokenId}:`, error);
            }
            
            return {
              id: Number(transfer.id),
              from: transfer.from,
              to: transfer.to,
              tokenId: Number(transfer.tokenId),
              tokenName, // NUEVO: nombre del token
              amount: Number(transfer.amount),
              dateCreated: Number(transfer.dateCreated),
              status: Number(transfer.status),
              exists: transfer.exists,
              isSender: transfer.from.toLowerCase() === address.toLowerCase(),
              isReceiver: transfer.to.toLowerCase() === address.toLowerCase(),
            };
          } catch (error) {
            console.error(`Error cargando transferencia ${id}:`, error);
            return null;
          }
        });

        const transferDetails = (await Promise.all(transferDetailsPromises)).filter(
          (transfer): transfer is TransferData => transfer !== null
        );

        // Ordenar por fecha (más recientes primero)
        transferDetails.sort((a, b) => b.dateCreated - a.dateCreated);

        console.log('✅ Transferencias cargadas:', transferDetails);
        setTransfers(transferDetails);
        setFilteredTransfers(transferDetails);
      } catch (error: any) {
        console.error('❌ Error cargando transferencias:', error);
        setError(error.message || 'Error al cargar las transferencias');
      } finally {
        setIsLoading(false);
      }
    };

    if (address) {
      loadTransfers();
    }
  }, [address]);

  // Filtrar transferencias
  useEffect(() => {
    switch (filter) {
      case 'sent':
        setFilteredTransfers(transfers.filter(t => t.isSender));
        break;
      case 'received':
        setFilteredTransfers(transfers.filter(t => t.isReceiver));
        break;
      case 'pending':
        setFilteredTransfers(transfers.filter(t => t.status === 0));
        break;
      default:
        setFilteredTransfers(transfers);
    }
  }, [filter, transfers]);

  // Función para recargar transferencias sin recargar la página
  const reloadTransfers = async () => {
    if (!address) return;

    try {
      console.log('🔄 Recargando transferencias...');
      const transferIds = await getUserTransfers(address);
      
      if (transferIds.length === 0) {
        setTransfers([]);
        setFilteredTransfers([]);
        return;
      }

      const transferDetailsPromises = transferIds.map(async (id) => {
        try {
          const transfer = await getTransfer(id);
          return {
            id: Number(transfer.id),
            from: transfer.from,
            to: transfer.to,
            tokenId: Number(transfer.tokenId),
            amount: Number(transfer.amount),
            dateCreated: Number(transfer.dateCreated),
            status: Number(transfer.status),
            exists: transfer.exists,
            isSender: transfer.from.toLowerCase() === address.toLowerCase(),
            isReceiver: transfer.to.toLowerCase() === address.toLowerCase(),
          };
        } catch (error) {
          console.error(`Error cargando transferencia ${id}:`, error);
          return null;
        }
      });

      const transferDetails = (await Promise.all(transferDetailsPromises)).filter(
        (transfer): transfer is TransferData => transfer !== null
      );

      transferDetails.sort((a, b) => b.dateCreated - a.dateCreated);
      setTransfers(transferDetails);
      console.log('✅ Transferencias recargadas');
    } catch (error) {
      console.error('❌ Error recargando transferencias:', error);
    }
  };

  const handleAcceptTransfer = async (transferId: number) => {
    setMessage(null);
    try {
      await acceptTransfer(transferId);
      setMessage({ type: 'success', text: '¡Transferencia aceptada exitosamente!' });
      
      // Recargar transferencias sin recargar la página
      setTimeout(async () => {
        await reloadTransfers();
        setMessage(null);
      }, 2000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al aceptar la transferencia' });
    }
  };

  const handleRejectTransfer = async (transferId: number) => {
    setMessage(null);
    try {
      await rejectTransfer(transferId);
      setMessage({ type: 'success', text: 'Transferencia rechazada' });
      
      // Recargar transferencias sin recargar la página
      setTimeout(async () => {
        await reloadTransfers();
        setMessage(null);
      }, 2000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al rechazar la transferencia' });
    }
  };

  const handleCancelTransfer = async (transferId: number) => {
    setMessage(null);
    try {
      await cancelTransfer(transferId);
      setMessage({ type: 'success', text: 'Transferencia cancelada' });
      
      // Recargar transferencias sin recargar la página
      setTimeout(async () => {
        await reloadTransfers();
        setMessage(null);
      }, 2000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al cancelar la transferencia' });
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          <Clock className="h-3 w-3 mr-1" />
          Pendiente
        </Badge>;
      case 1:
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
          <Check className="h-3 w-3 mr-1" />
          Aceptada
        </Badge>;
      case 2:
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
          <X className="h-3 w-3 mr-1" />
          Rechazada
        </Badge>;
      case 3:
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
          <Ban className="h-3 w-3 mr-1" />
          Cancelada
        </Badge>;
      default:
        return null;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) return null;

  const pendingReceived = transfers.filter(t => t.isReceiver && t.status === 0);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Transferencias</h1>
        <p className="text-muted-foreground">
          Gestiona las transferencias de tokens enviadas y recibidas
        </p>
      </div>

      {/* Pending Alert */}
      {pendingReceived.length > 0 && (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardContent className="py-6">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-yellow-600 dark:text-yellow-500">
                  Tienes {pendingReceived.length} transferencia{pendingReceived.length !== 1 ? 's' : ''} pendiente{pendingReceived.length !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-muted-foreground">
                  Revisa y acepta o rechaza las transferencias recibidas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message */}
      {message && (
        <Card className={`border-l-4 ${
          message.type === 'error' ? 'border-l-red-500 bg-red-500/5' :
          'border-l-green-500 bg-green-500/5'
        }`}>
          <CardContent className="pt-6">
            <p className="text-sm">{message.text}</p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todas ({transfers.length})
            </Button>
            <Button
              variant={filter === 'sent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('sent')}
            >
              <ArrowRight className="h-4 w-4 mr-1" />
              Enviadas ({transfers.filter(t => t.isSender).length})
            </Button>
            <Button
              variant={filter === 'received' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('received')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Recibidas ({transfers.filter(t => t.isReceiver).length})
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              <Clock className="h-4 w-4 mr-1" />
              Pendientes ({transfers.filter(t => t.status === 0).length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Cargando transferencias...</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-500/20">
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredTransfers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <ArrowLeftRight className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {filter === 'all' ? 'No hay transferencias' : 'No se encontraron transferencias'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {filter === 'all'
                  ? 'Las transferencias que envíes o recibas aparecerán aquí'
                  : 'Cambia el filtro para ver otras transferencias'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transfers List */}
      {!isLoading && !error && filteredTransfers.length > 0 && (
        <div className="space-y-4">
          {filteredTransfers.map((transfer) => (
            <Card key={transfer.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">
                        Transferencia #{transfer.id}
                      </CardTitle>
                      {getStatusBadge(transfer.status)}
                    </div>
                    <CardDescription>
                      {formatDate(transfer.dateCreated)}
                    </CardDescription>
                  </div>
                  {transfer.isSender ? (
                    <ArrowRight className="h-5 w-5 text-blue-500" />
                  ) : (
                    <ArrowLeft className="h-5 w-5 text-green-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">
                      {transfer.isSender ? 'Enviado a' : 'Recibido de'}:
                    </p>
                    <p className="font-mono">{shortenAddress(transfer.isSender ? transfer.to : transfer.from)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Producto:</p>
                    <p className="font-semibold">{transfer.tokenName}</p>
                    <p className="text-xs text-muted-foreground">ID: #{transfer.tokenId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Cantidad:</p>
                    <p className="font-semibold">{transfer.amount} unidades</p>
                  </div>
                </div>

                {/* Actions for Pending Transfers */}
                {transfer.status === 0 && (
                  <div className="flex gap-2 pt-2 border-t">
                    {transfer.isReceiver && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleAcceptTransfer(transfer.id)}
                          disabled={contractLoading}
                          className="flex-1"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Aceptar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectTransfer(transfer.id)}
                          disabled={contractLoading}
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Rechazar
                        </Button>
                      </>
                    )}
                    {transfer.isSender && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelTransfer(transfer.id)}
                        disabled={contractLoading}
                        className="flex-1"
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

