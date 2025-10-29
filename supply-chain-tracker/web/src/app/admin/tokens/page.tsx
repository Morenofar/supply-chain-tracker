'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '@/contexts/Web3Context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Eye, ArrowRight, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { web3Service } from '@/lib/web3';
import type { Token } from '@/types';

export default function AdminTokensPage() {
  const router = useRouter();
  const { walletState } = useWeb3();
  const { isAdmin, isConnected } = walletState;
  
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Redirigir si no es admin
  useEffect(() => {
    if (isConnected && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, isConnected, router]);

  // Cargar todos los tokens
  useEffect(() => {
    const loadAllTokens = async () => {
      if (!isConnected || !isAdmin) return;

      try {
        setIsLoading(true);
        
        // Intentar cargar tokens del 1 al 100 (máximo esperado)
        const tokenPromises = [];
        for (let i = 1; i <= 100; i++) {
          tokenPromises.push(
            web3Service.getToken(BigInt(i))
              .then(token => token)
              .catch(() => null) // Si falla, retornar null
          );
        }

        const loadedTokens = await Promise.all(tokenPromises);
        
        // Filtrar tokens válidos (no null)
        const validTokens = loadedTokens.filter(token => token !== null) as Token[];
        
        console.log('✅ Tokens cargados:', validTokens.length);
        setTokens(validTokens);
      } catch (error) {
        console.error('❌ Error cargando tokens:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllTokens();
  }, [isConnected, isAdmin]);

  // Filtrar tokens por búsqueda
  const filteredTokens = tokens.filter(token => 
    token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.creator.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isConnected || !isAdmin) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Todos los Tokens del Sistema</h1>
        <p className="text-muted-foreground mt-2">
          Vista completa de tokens y trazabilidad
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : tokens.length}</div>
            <p className="text-xs text-muted-foreground">Tokens en el sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Materias Primas</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {isLoading ? '...' : tokens.filter(t => t.parentIds.length === 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Sin token padre</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Derivados</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {isLoading ? '...' : tokens.filter(t => t.parentIds.length > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Con token padre</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o dirección del propietario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tokens List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredTokens.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No se encontraron tokens con ese criterio' : 'No hay tokens en el sistema'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTokens.map((token) => (
            <Card key={token.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{token.name}</CardTitle>
                      {token.parentIds.length === 0 ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/50">
                          Materia Prima
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/50">
                          Producto Derivado
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="flex flex-col gap-1">
                      <span className="font-mono text-xs">ID: #{token.id}</span>
                      {token.parentIds.length > 0 && (
                        <span className="text-xs text-blue-500">
                          Derivado de {token.parentIds.length} token{token.parentIds.length > 1 ? 's' : ''} padre
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => router.push(`/tokens/${token.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Trazabilidad
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Creador Original</p>
                    <p className="text-sm font-mono bg-muted px-2 py-1 rounded break-all">
                      {token.creator}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Cantidad Total</p>
                    <p className="text-2xl font-bold">{token.totalSupply.toString()}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Fecha Creación</p>
                    <p className="text-sm">
                      {new Date(Number(token.dateCreated) * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {token.features && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Características</p>
                    <div className="bg-muted/50 rounded p-3 text-sm font-mono text-xs max-h-24 overflow-y-auto">
                      {token.features}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Back Button */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={() => router.push('/admin')}>
          Volver al Panel de Admin
        </Button>
      </div>
    </div>
  );
}

