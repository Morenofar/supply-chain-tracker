'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useWeb3 } from '@/contexts/Web3Context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Loader2, AlertCircle, ArrowLeft, ArrowRight, Factory, Clock } from 'lucide-react';
import { getToken, getTokenBalance } from '@/lib/web3';

interface ParentTokenInfo {
  id: number;
  name: string;
  amount: number;
}

interface TokenDetails {
  id: number;
  creator: string;
  name: string;
  totalSupply: number;
  features: string;
  parentIds: number[];
  parentAmounts: number[];
  parentTokens: ParentTokenInfo[]; // NUEVO: información completa de tokens padre
  dateCreated: number;
  exists: boolean;
  balance: number;
}

export default function TokenDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tokenId = params.id as string;
  
  const { walletState } = useWeb3();
  const { address, isConnected, user } = walletState;

  const [token, setToken] = useState<TokenDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        console.log('📦 Cargando token:', tokenId);
        const tokenData = await getToken(parseInt(tokenId));
        const balance = await getTokenBalance(parseInt(tokenId), address);

        // Cargar información de tokens padre (incluyendo nombres)
        const parentTokens: ParentTokenInfo[] = [];
        if (tokenData.parentIds.length > 0) {
          console.log('🔍 Cargando información de tokens padre...');
          for (let i = 0; i < tokenData.parentIds.length; i++) {
            const parentId = Number(tokenData.parentIds[i]);
            const parentAmount = Number(tokenData.parentAmounts[i]);
            
            try {
              const parentTokenData = await getToken(parentId);
              parentTokens.push({
                id: parentId,
                name: parentTokenData.name,
                amount: parentAmount,
              });
              console.log(`  ✅ Token padre #${parentId}: ${parentTokenData.name} (${parentAmount} unidades)`);
            } catch (error) {
              console.warn(`  ⚠️ No se pudo cargar token padre #${parentId}:`, error);
              parentTokens.push({
                id: parentId,
                name: `Token #${parentId}`,
                amount: parentAmount,
              });
            }
          }
        }

        const tokenDetails: TokenDetails = {
          id: Number(tokenData.id),
          creator: tokenData.creator,
          name: tokenData.name,
          totalSupply: Number(tokenData.totalSupply),
          features: tokenData.features,
          parentIds: tokenData.parentIds.map((id: any) => Number(id)),
          parentAmounts: tokenData.parentAmounts.map((amount: any) => Number(amount)),
          parentTokens, // NUEVO: información completa de tokens padre
          dateCreated: Number(tokenData.dateCreated),
          exists: tokenData.exists,
          balance: balance,
        };

        console.log('✅ Token cargado:', tokenDetails);
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

  if (!user) return null;

  // Parse features JSON
  const parsedFeatures = token?.features ? (() => {
    try {
      return JSON.parse(token.features);
    } catch {
      return null;
    }
  })() : null;

  const isOwner = token?.creator.toLowerCase() === address?.toLowerCase();
  const canTransfer = token && token.balance > 0;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Back Buttons */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <Button variant="outline" onClick={() => router.push('/tokens')}>
          <Package className="mr-2 h-4 w-4" />
          Mis Tokens
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Cargando detalles del token...</p>
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

      {/* Token Details */}
      {!isLoading && !error && token && (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{token.name}</h1>
                  <p className="text-muted-foreground">Token #{token.id}</p>
                </div>
              </div>
            </div>
            {canTransfer && (
              <Button asChild size="lg">
                <Link href={`/tokens/${tokenId}/transfer`}>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Transferir Token
                </Link>
              </Button>
            )}
          </div>

          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Tu Balance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{token.balance}</div>
                <p className="text-xs text-muted-foreground mt-1">unidades</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Cantidad Total</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{token.totalSupply}</div>
                <p className="text-xs text-muted-foreground mt-1">unidades creadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Estado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${token.exists ? 'text-green-500' : 'text-red-500'}`}>
                  {token.exists ? 'Activo' : 'Inactivo'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Propiedad</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-sm font-medium ${isOwner ? 'text-primary' : 'text-muted-foreground'}`}>
                  {isOwner ? 'Eres el creador' : 'Token recibido'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Date Created */}
          {token.dateCreated > 0 && (
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Creación</p>
                    <p className="font-medium">
                      {new Date(token.dateCreated * 1000).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Creator Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Creador</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Dirección</p>
                  <p className="font-mono text-sm break-all">{token.creator}</p>
                </div>
                {isOwner && (
                  <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 text-sm">
                    <p className="text-primary font-medium">🏭 Eres el creador de este token</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Características</CardTitle>
                <CardDescription>Propiedades del producto</CardDescription>
              </CardHeader>
              <CardContent>
                {parsedFeatures && Object.keys(parsedFeatures).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(parsedFeatures).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-start text-sm border-b border-border pb-2 last:border-0">
                        <span className="text-muted-foreground capitalize font-medium">{key}:</span>
                        <span className="font-semibold text-right max-w-[60%] break-words">
                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : token.features && token.features.trim() !== '' ? (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm font-mono whitespace-pre-wrap break-words">{token.features}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Sin características definidas
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Manufacturing Info (if has parent tokens) */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Factory className="h-5 w-5" />
                <CardTitle>Información de Manufactura</CardTitle>
              </div>
              <CardDescription>
                Tokens padre utilizados para crear este producto
              </CardDescription>
            </CardHeader>
            <CardContent>
              {token.parentIds.length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-sm">
                    <p className="text-blue-400 font-medium mb-2">
                      🏭 Producto Manufacturado
                    </p>
                    <p className="text-muted-foreground">
                      Este producto se creó utilizando {token.parentIds.length} token{token.parentIds.length > 1 ? 's' : ''} padre
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Tokens Padre Utilizados:</p>
                    {token.parentTokens.map((parent) => (
                      <Link 
                        key={parent.id} 
                        href={`/tokens/${parent.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{parent.name}</p>
                              <p className="text-xs text-muted-foreground">
                                ID: #{parent.id} • Cantidad consumida: {parent.amount} unidades
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3">
                    <p className="font-medium mb-1">ℹ️ Nota:</p>
                    <p>
                      Los tokens padre fueron consumidos durante la creación de este producto.
                      Las cantidades mostradas fueron deducidas del balance de los tokens padre originales.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Materia Prima Original
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Este token no tiene tokens padre - es un producto base o materia prima
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {token.balance === 0 && (
            <Card className="border-yellow-500/20 bg-yellow-500/5">
              <CardContent className="py-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-yellow-600 dark:text-yellow-500">
                      No tienes unidades de este token
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Has transferido todas tus unidades o el token ha sido consumido en la manufactura de otros productos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

