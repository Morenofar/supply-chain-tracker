'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useWeb3 } from '@/contexts/Web3Context';
import { useContract } from '@/hooks/useContract';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Loader2, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { getToken, getTokenBalance, getUserTransfers, getTransfer } from '@/lib/web3';
import type { UserRole } from '@/types';

interface TokenDetails {
  id: number;
  name: string;
  balance: number;
  availableBalance: number; // NUEVO: balance disponible real (considerando transferencias pendientes)
}

export default function TransferTokenPage() {
  const router = useRouter();
  const params = useParams();
  const tokenId = params.id as string;
  
  const { walletState } = useWeb3();
  const { transfer, isLoading: contractLoading } = useContract();
  const { address, isConnected, user } = walletState;

  const [token, setToken] = useState<TokenDetails | null>(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Mapa de flujo de transferencias según roles (actualizado)
  const roleFlow: Record<UserRole, UserRole[]> = {
    Producer: ['Producer', 'Factory'],
    Factory: ['Factory', 'Retailer'],
    Retailer: ['Retailer', 'Consumer'],
    Consumer: [],
  };

  // Verificar acceso
  useEffect(() => {
    if (!isConnected || !user || user.status !== 1) {
      router.push('/dashboard');
    }
  }, [isConnected, user, router]);

  // Cargar detalles del token
  useEffect(() => {
    const loadToken = async () => {
      if (!address || !tokenId) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log('📦 Cargando token para transferencia:', tokenId);
        const tokenData = await getToken(parseInt(tokenId));
        const balance = await getTokenBalance(parseInt(tokenId), address);

        if (balance === 0) {
          setError('No tienes unidades de este token para transferir');
          setIsLoading(false);
          return;
        }

        // Calcular balance disponible (balance - transferencias pendientes enviadas)
        console.log('📊 Calculando balance disponible...');
        const transferIds = await getUserTransfers(address);
        let pendingOutgoing = 0;
        
        for (const transferId of transferIds) {
          try {
            const transfer = await getTransfer(transferId);
            // Solo contar transferencias pendientes (status 0) de este token que yo envié
            if (
              Number(transfer.status) === 0 && 
              Number(transfer.tokenId) === parseInt(tokenId) &&
              transfer.from.toLowerCase() === address.toLowerCase()
            ) {
              pendingOutgoing += Number(transfer.amount);
              console.log(`  - Transferencia pendiente #${transferId}: ${transfer.amount} unidades`);
            }
          } catch (error) {
            console.warn(`No se pudo cargar transferencia ${transferId}:`, error);
          }
        }
        
        const availableBalance = balance - pendingOutgoing;
        
        console.log(`📊 Balance total: ${balance}, Pendientes enviadas: ${pendingOutgoing}, Disponible: ${availableBalance}`);

        if (availableBalance <= 0) {
          setError(`No tienes unidades disponibles. Balance: ${balance}, En transferencias pendientes: ${pendingOutgoing}`);
          setIsLoading(false);
          return;
        }

        const tokenDetails: TokenDetails = {
          id: Number(tokenData.id),
          name: tokenData.name,
          balance: balance,
          availableBalance: availableBalance,
        };

        console.log('✅ Token cargado para transferencia:', tokenDetails);
        setToken(tokenDetails);
      } catch (error: any) {
        console.error('❌ Error cargando token:', error);
        setError(error.message || 'Error al cargar el token');
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, [address, tokenId]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validaciones
    if (!recipientAddress || recipientAddress.length !== 42 || !recipientAddress.startsWith('0x')) {
      setMessage({ type: 'error', text: 'Dirección del receptor inválida' });
      return;
    }

    if (recipientAddress.toLowerCase() === address?.toLowerCase()) {
      setMessage({ type: 'error', text: 'No puedes transferir a tu propia dirección' });
      return;
    }

    if (!amount || parseInt(amount) <= 0) {
      setMessage({ type: 'error', text: 'La cantidad debe ser mayor a 0' });
      return;
    }

    if (token && parseInt(amount) > token.availableBalance) {
      const pendingAmount = token.balance - token.availableBalance;
      setMessage({ 
        type: 'error', 
        text: `Solo tienes ${token.availableBalance} unidades disponibles. Balance total: ${token.balance}, En transferencias pendientes: ${pendingAmount}` 
      });
      return;
    }

    try {
      console.log('🚀 Iniciando transferencia:', {
        recipientAddress,
        tokenId: parseInt(tokenId),
        amount: parseInt(amount),
      });

      await transfer(
        recipientAddress,
        parseInt(tokenId),
        parseInt(amount)
      );

      setMessage({ type: 'success', text: '¡Transferencia iniciada! El receptor debe aceptarla.' });
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        router.push('/transfers');
      }, 3000);
    } catch (error: any) {
      console.error('Error en transferencia:', error);
      setMessage({ type: 'error', text: error.message || 'Error al iniciar la transferencia' });
    }
  };

  if (!user) return null;

  const allowedRoles = roleFlow[user.role];
  const canTransfer = allowedRoles && allowedRoles.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.push(`/tokens/${tokenId}`)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al Token
      </Button>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Transferir Token</h1>
          <p className="text-muted-foreground">
            Envía unidades de tu token a otro participante
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Cargando información del token...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-500/20">
            <CardContent className="py-8">
              <div className="flex flex-col items-center gap-3 text-red-500">
                <AlertCircle className="h-8 w-8" />
                <p className="text-center">{error}</p>
                <Button variant="outline" onClick={() => router.push('/tokens')}>
                  Volver a Tokens
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Role Restriction */}
        {!isLoading && token && !canTransfer && (
          <Card className="border-yellow-500/20 bg-yellow-500/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <CardTitle>No Puedes Transferir</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Como <strong>{user.role}</strong>, no tienes permisos para realizar transferencias
                en este momento.
              </p>
              <Button onClick={() => router.push('/tokens')}>
                Volver a Tokens
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Transfer Form */}
        {!isLoading && !error && token && canTransfer && (
          <>
            {/* Token Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {token.name}
                </CardTitle>
                <CardDescription>Token #{tokenId}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Balance total:</span>
                  <span className="text-lg font-semibold">{token.balance} unidades</span>
                </div>
                {token.balance !== token.availableBalance && (
                  <>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground">En transferencias pendientes:</span>
                      <span className="text-sm text-yellow-600 font-semibold">{token.balance - token.availableBalance} unidades</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm font-medium">Disponible para transferir:</span>
                      <span className="text-lg font-bold text-green-600">{token.availableBalance} unidades</span>
                    </div>
                  </>
                )}
                {token.balance === token.availableBalance && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-medium">Disponible para transferir:</span>
                    <span className="text-lg font-bold text-green-600">{token.availableBalance} unidades</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Message */}
            {message && (
              <Card className={`border-l-4 ${
                message.type === 'error' ? 'border-l-red-500 bg-red-500/5' :
                message.type === 'success' ? 'border-l-green-500 bg-green-500/5' :
                'border-l-blue-500 bg-blue-500/5'
              }`}>
                <CardContent className="pt-6">
                  <p className="text-sm">{message.text}</p>
                </CardContent>
              </Card>
            )}

            {/* Form */}
            <form onSubmit={handleTransfer}>
              <Card>
                <CardHeader>
                  <CardTitle>Datos de la Transferencia</CardTitle>
                  <CardDescription>
                    El receptor debe aprobar la transferencia
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Recipient Address */}
                  <div className="space-y-2">
                    <Label htmlFor="recipient">Dirección del Receptor *</Label>
                    <Input
                      id="recipient"
                      placeholder="0x..."
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      required
                      pattern="^0x[a-fA-F0-9]{40}$"
                    />
                    <p className="text-xs text-muted-foreground">
                      Debe ser una dirección Ethereum válida (42 caracteres)
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="amount">Cantidad a Transferir *</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="1"
                      max={token.balance}
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Máximo: {token.balance} unidades</span>
                      <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={() => setAmount(token.balance.toString())}
                      >
                        Usar todo
                      </button>
                    </div>
                  </div>

                  {/* Role Flow Info */}
                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 text-sm">
                    <p className="font-medium text-blue-400 mb-2">🔄 Flujo de Transferencia</p>
                    <p className="text-muted-foreground">
                      Como <strong>{user.role}</strong>, puedes transferir a:{' '}
                      <strong className="text-primary">
                        {allowedRoles.join(', ')}
                      </strong>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.push(`/tokens/${tokenId}`)}
                  disabled={contractLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={contractLoading}
                >
                  {contractLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Iniciar Transferencia
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

