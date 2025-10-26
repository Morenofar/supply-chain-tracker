'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWeb3 } from '@/contexts/Web3Context';
import { useContract } from '@/hooks/useContract';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Loader2, AlertCircle, Plus, X, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as web3Service from '@/lib/web3';

// Interfaz para token disponible
interface AvailableToken {
  id: number;
  name: string;
  balance: number;
  creator: string;
  features: string;
}

export default function CreateTokenPage() {
  const router = useRouter();
  const { walletState } = useWeb3();
  const { createToken, isLoading } = useContract();
  const { isConnected, user, address } = walletState;

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [features, setFeatures] = useState('');
  const [parentTokens, setParentTokens] = useState<{ tokenId: string; amount: string }[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  // Estados para tokens disponibles
  const [availableTokens, setAvailableTokens] = useState<AvailableToken[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);

  // Verificar permisos
  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    } else if (!user || user.status !== 1) {
      router.push('/dashboard');
    } else if (!['Producer', 'Factory'].includes(user.role)) {
      setMessage({ 
        type: 'error', 
        text: 'Solo Productores y Fábricas pueden crear tokens' 
      });
    }
  }, [isConnected, user, router]);

  // Cargar tokens disponibles para Factory
  useEffect(() => {
    const loadAvailableTokens = async () => {
      console.log('📍 Verificando condiciones para cargar tokens:', {
        isConnected,
        address,
        userRole: user?.role
      });

      if (!isConnected || !address || user?.role !== 'Factory') {
        console.log('⏭️ Saltando carga de tokens (no cumple condiciones)');
        return;
      }

      setLoadingTokens(true);
      try {
        console.log('🔍 Cargando tokens disponibles para selección...');
        console.log('   Dirección Factory:', address);
        
        // Obtener IDs de tokens del usuario
        const tokenIds = await web3Service.getUserTokens(address);
        console.log('📦 IDs de tokens recibidos:', tokenIds);
        console.log('   Tipo:', typeof tokenIds);
        console.log('   Es array:', Array.isArray(tokenIds));
        console.log('   Longitud:', tokenIds?.length);

        if (!tokenIds || tokenIds.length === 0) {
          console.log('ℹ️ No hay tokens disponibles (array vacío o null)');
          setAvailableTokens([]);
          return;
        }

        // Cargar detalles de cada token
        const tokensData: AvailableToken[] = [];
        
        for (const tokenId of tokenIds) {
          try {
            console.log(`  🔍 Cargando token ID: ${tokenId}...`);
            const tokenData = await web3Service.getToken(Number(tokenId));
            console.log(`    ✅ Token data:`, tokenData);
            
            const balance = await web3Service.getTokenBalance(Number(tokenId), address);
            console.log(`    📊 Balance: ${balance}`);
            
            // Solo incluir tokens con balance > 0
            if (balance > 0) {
              tokensData.push({
                id: Number(tokenId),
                name: tokenData.name,
                balance: Number(balance),
                creator: tokenData.creator,
                features: tokenData.features
              });
              console.log(`    ✅ Token agregado: ${tokenData.name} (balance: ${balance})`);
            } else {
              console.log(`    ⏭️ Token omitido (balance = 0)`);
            }
          } catch (error) {
            console.error(`  ❌ Error cargando token ${tokenId}:`, error);
          }
        }

        console.log('✅ Tokens disponibles cargados:', tokensData.length);
        console.log('   Datos:', tokensData);
        setAvailableTokens(tokensData);
      } catch (error) {
        console.error('❌ Error cargando tokens disponibles:', error);
        setMessage({ 
          type: 'error', 
          text: 'Error al cargar tokens disponibles. Verifica la consola.' 
        });
      } finally {
        setLoadingTokens(false);
      }
    };

    loadAvailableTokens();
  }, [isConnected, address, user]);

  const addParentToken = () => {
    setParentTokens([...parentTokens, { tokenId: '', amount: '' }]);
  };

  const removeParentToken = (index: number) => {
    setParentTokens(parentTokens.filter((_, i) => i !== index));
  };

  const updateParentToken = (index: number, field: 'tokenId' | 'amount', value: string) => {
    const updated = [...parentTokens];
    updated[index][field] = value;
    setParentTokens(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validaciones
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'El nombre es requerido' });
      return;
    }

    if (!quantity || parseInt(quantity) <= 0) {
      setMessage({ type: 'error', text: 'La cantidad debe ser mayor a 0' });
      return;
    }

    // Solo Factory puede crear tokens derivados
    if (parentTokens.length > 0 && user?.role !== 'Factory') {
      setMessage({ type: 'error', text: 'Solo las Fábricas pueden crear tokens derivados' });
      return;
    }

    // Producer no puede tener tokens padre
    if (user?.role === 'Producer' && parentTokens.length > 0) {
      setMessage({ type: 'error', text: 'Los Productores solo pueden crear materias primas (sin tokens padre)' });
      return;
    }

    // Validar tokens padre si existen
    if (parentTokens.length > 0) {
      for (const parent of parentTokens) {
        if (!parent.tokenId || parseInt(parent.tokenId) <= 0) {
          setMessage({ type: 'error', text: 'Debes seleccionar un token padre' });
          return;
        }
        if (!parent.amount || parseInt(parent.amount) <= 0) {
          setMessage({ type: 'error', text: 'Cantidad de token padre inválida' });
          return;
        }

        // NUEVA VALIDACIÓN: Verificar que no exceda el balance disponible
        const selectedToken = availableTokens.find(t => t.id === parseInt(parent.tokenId));
        if (selectedToken && parseInt(parent.amount) > selectedToken.balance) {
          setMessage({ 
            type: 'error', 
            text: `Balance insuficiente para "${selectedToken.name}". Disponible: ${selectedToken.balance}, Solicitado: ${parent.amount}` 
          });
          return;
        }
      }
    }

    try {
      console.log('📦 Creando token:', {
        name,
        quantity: parseInt(quantity),
        features,
        parentTokenIds: parentTokens.map(p => parseInt(p.tokenId)),
        parentAmounts: parentTokens.map(p => parseInt(p.amount)),
      });

      await createToken(
        name,
        parseInt(quantity),
        features,
        parentTokens.map(p => parseInt(p.tokenId)),
        parentTokens.map(p => parseInt(p.amount))
      );

      setMessage({ type: 'success', text: '¡Token creado exitosamente!' });
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/tokens');
      }, 2000);
    } catch (error: any) {
      console.error('Error creando token:', error);
      setMessage({ type: 'error', text: error.message || 'Error al crear el token' });
    }
  };

  if (!user || !['Producer', 'Factory'].includes(user.role)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-lg mx-auto border-red-500/20">
          <CardHeader>
            <div className="flex items-center space-x-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              <CardTitle>Acceso Denegado</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Solo Productores y Fábricas pueden crear tokens.
            </p>
            <Button className="mt-4" onClick={() => router.push('/dashboard')}>
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Crear Nuevo Token</h1>
          <p className="text-muted-foreground">
            {user.role === 'Producer' 
              ? 'Registra una nueva materia prima en el sistema'
              : 'Crea un nuevo producto o materia prima'}
          </p>
        </div>

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
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Información del Token</CardTitle>
              <CardDescription>
                Completa los datos del {user.role === 'Producer' ? 'producto/materia prima' : 'producto'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  placeholder="Ej: Café Arábica Colombia, Leche Pasteurizada, etc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Cantidad */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad Inicial *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  placeholder="1000"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Cantidad de unidades de este token
                </p>
              </div>

              {/* Features (JSON) */}
              <div className="space-y-2">
                <Label htmlFor="features">Características (JSON)</Label>
                <Input
                  id="features"
                  placeholder='{"origen": "Colombia", "tipo": "Orgánico", "certificación": "Fair Trade"}'
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Formato JSON con las propiedades del producto (opcional)
                </p>
              </div>

              {/* Tokens Padre (Solo para Factory) */}
              {user.role === 'Factory' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Tokens Padre (Opcional)</Label>
                      <p className="text-xs text-muted-foreground">
                        Productos/materias primas necesarias para manufacturar este producto
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addParentToken}
                      disabled={loadingTokens || availableTokens.length === 0}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Ingrediente
                    </Button>
                  </div>

                  {/* Mensaje si no hay tokens disponibles */}
                  {!loadingTokens && availableTokens.length === 0 && (
                    <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-sm">
                      <p className="text-yellow-400 font-medium mb-1">⚠️ Sin tokens disponibles</p>
                      <p className="text-muted-foreground">
                        No tienes tokens en tu inventario para usar como ingredientes.
                        Los tokens padre deben ser transferidos a tu cuenta antes de poder usarlos.
                      </p>
                    </div>
                  )}

                  {/* Loading state */}
                  {loadingTokens && (
                    <div className="flex items-center justify-center p-4 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Cargando tokens disponibles...
                    </div>
                  )}

                  {/* Parent tokens form */}
                  {parentTokens.map((parent, index) => {
                    const selectedToken = availableTokens.find(t => t.id === parseInt(parent.tokenId));
                    const requestedAmount = parseInt(parent.amount) || 0;
                    const hasError = selectedToken && requestedAmount > selectedToken.balance;

                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex gap-2 items-end">
                          {/* Selector de Token Padre */}
                          <div className="flex-1 space-y-2">
                            <Label>Producto/Materia Prima</Label>
                            <Select
                              value={parent.tokenId}
                              onValueChange={(value) => updateParentToken(index, 'tokenId', value)}
                            >
                              <SelectTrigger className={hasError ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Seleccionar producto..." />
                              </SelectTrigger>
                              <SelectContent>
                                {availableTokens.map((token) => (
                                  <SelectItem key={token.id} value={token.id.toString()}>
                                    <div className="flex items-center justify-between w-full">
                                      <span>{token.name}</span>
                                      <span className="text-xs text-muted-foreground ml-2">
                                        (Stock: {token.balance})
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Cantidad Necesaria */}
                          <div className="flex-1 space-y-2">
                            <Label>
                              Cantidad Necesaria
                              {selectedToken && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  (Disponible: {selectedToken.balance})
                                </span>
                              )}
                            </Label>
                            <Input
                              type="number"
                              min="1"
                              max={selectedToken?.balance || undefined}
                              placeholder="Cantidad"
                              value={parent.amount}
                              onChange={(e) => updateParentToken(index, 'amount', e.target.value)}
                              className={hasError ? 'border-red-500' : ''}
                            />
                          </div>

                          {/* Botón Eliminar */}
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeParentToken(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Mensaje de validación */}
                        {selectedToken && requestedAmount > 0 && (
                          <div className={`flex items-center gap-2 text-sm ${
                            hasError ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {hasError ? (
                              <>
                                <AlertCircle className="h-4 w-4" />
                                <span>
                                  Cantidad excede el stock disponible ({selectedToken.balance} disponibles)
                                </span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                <span>
                                  Se consumirán {requestedAmount} unidades de "{selectedToken.name}"
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {parentTokens.length > 0 && (
                    <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-sm mt-2">
                      <p className="text-blue-400 font-medium mb-1">ℹ️ Nota importante:</p>
                      <p className="text-muted-foreground">
                        Los ingredientes seleccionados se consumirán automáticamente de tu inventario 
                        en las cantidades especificadas al crear este producto manufacturado.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Info Box */}
              {user.role === 'Producer' && (
                <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 text-sm">
                  <p className="font-medium text-blue-400 mb-2">📝 Nota para Productores:</p>
                  <p className="text-muted-foreground">
                    Como Productor, solo puedes crear tokens de materias primas (sin tokens padre).
                    Las Fábricas pueden usar tus tokens para crear productos derivados.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/tokens')}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Package className="mr-2 h-4 w-4" />
                  Crear Token
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

