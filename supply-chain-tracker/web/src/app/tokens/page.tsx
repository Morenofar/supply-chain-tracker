'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWeb3 } from '@/contexts/Web3Context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, Plus, Search, Loader2, AlertCircle, ExternalLink, Clock } from 'lucide-react';
import { getUserTokens, getTokenBalance, getToken } from '@/lib/web3';

interface TokenData {
  id: number;
  name: string;
  creator: string;
  quantity: number;
  balance: number;
  features: string;
  dateCreated: number;
  exists: boolean;
}

export default function TokensPage() {
  const router = useRouter();
  const { walletState } = useWeb3();
  const { address, isConnected, user } = walletState;

  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<TokenData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar acceso
  useEffect(() => {
    if (!isConnected || !user || user.status !== 1) {
      router.push('/dashboard');
    }
  }, [isConnected, user, router]);

  // Cargar tokens del usuario
  useEffect(() => {
    const loadTokens = async () => {
      if (!address) return;

      setIsLoading(true);
      setError(null);

      try {
        console.log('📦 Cargando tokens del usuario:', address);
        const tokenIds = await getUserTokens(address);
        console.log('📋 IDs de tokens encontrados:', tokenIds);

        if (tokenIds.length === 0) {
          setTokens([]);
          setFilteredTokens([]);
          setIsLoading(false);
          return;
        }

        // Cargar detalles de cada token
        const tokenDetailsPromises = tokenIds.map(async (id) => {
          try {
            const [tokenData, balance] = await Promise.all([
              getToken(id),
              getTokenBalance(id, address)
            ]);
            
            return {
              id,
              name: tokenData.name,
              creator: tokenData.creator,
              quantity: Number(tokenData.totalSupply),
              balance,
              features: tokenData.features,
              dateCreated: Number(tokenData.dateCreated),
              exists: tokenData.exists,
            };
          } catch (error) {
            console.error(`Error cargando token ${id}:`, error);
            return null;
          }
        });

        const tokenDetails = (await Promise.all(tokenDetailsPromises)).filter(
          (token): token is TokenData => token !== null
        );

        console.log('✅ Tokens cargados:', tokenDetails);
        setTokens(tokenDetails);
        setFilteredTokens(tokenDetails);
      } catch (error: any) {
        console.error('❌ Error cargando tokens:', error);
        setError(error.message || 'Error al cargar los tokens');
      } finally {
        setIsLoading(false);
      }
    };

    if (address) {
      loadTokens();
    }
  }, [address]);

  // Filtrar tokens por búsqueda
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTokens(tokens);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredTokens(
        tokens.filter(
          (token) =>
            token.name.toLowerCase().includes(query) ||
            token.id.toString().includes(query)
        )
      );
    }
  }, [searchQuery, tokens]);

  if (!user) return null;

  const canCreateTokens = ['Producer', 'Factory'].includes(user.role);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Mis Tokens</h1>
          <p className="text-muted-foreground">
            Gestiona tu inventario de productos y materias primas
          </p>
        </div>
        {canCreateTokens && (
          <Button asChild>
            <Link href="/tokens/create">
              <Plus className="mr-2 h-4 w-4" />
              Crear Token
            </Link>
          </Button>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Cargando tokens...</p>
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
      {!isLoading && !error && filteredTokens.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {searchQuery ? 'No se encontraron tokens' : 'No tienes tokens todavía'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery
                  ? 'Intenta con otra búsqueda'
                  : canCreateTokens
                  ? 'Crea tu primer token para comenzar'
                  : 'Los tokens aparecerán aquí cuando los recibas'}
              </p>
            </div>
            {canCreateTokens && !searchQuery && (
              <Button asChild>
                <Link href="/tokens/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Primer Token
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tokens Grid */}
      {!isLoading && !error && filteredTokens.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTokens.map((token) => (
            <Link key={token.id} href={`/tokens/${token.id}`}>
              <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-base line-clamp-1">
                        {token.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        ID: #{token.id}
                      </CardDescription>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Balance:</span>
                    <span className="font-semibold">{token.balance} unidades</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cantidad Total:</span>
                    <span className="font-medium">{token.quantity} unidades</span>
                  </div>

                  {token.dateCreated > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(token.dateCreated * 1000).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Estado:</span>
                      <span className={token.exists && token.balance > 0 ? 'text-green-500' : 'text-red-500'}>
                        {token.exists && token.balance > 0 ? 'Activo' : 'Agotado'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Results Count */}
      {!isLoading && !error && filteredTokens.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Mostrando {filteredTokens.length} de {tokens.length} token{tokens.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

