# 🔧 Solución: Problema de Tokens Padre en Factory

## 🐛 **Problemas Encontrados**

### 1. **Componentes Select No Exportados**
```
❌ Error: 'SelectTrigger' is not exported from '@/components/ui/select'
❌ Error: 'SelectValue' is not exported from '@/components/ui/select'
❌ Error: 'SelectContent' is not exported from '@/components/ui/select'
❌ Error: 'SelectItem' is not exported from '@/components/ui/select'
```

**Causa**: El archivo `select.tsx` era una versión básica de HTML `<select>`, no los componentes completos de Shadcn UI.

### 2. **Factory No Muestra Tokens Disponibles**
```
⚠️ Sin tokens disponibles
   No tienes tokens en tu inventario para usar como ingredientes.
```

**Causa Posible**: Parámetros invertidos en `getTokenBalance()` o error en la carga de tokens.

---

## ✅ **Soluciones Implementadas**

### Solución 1: Actualizar Componente Select

**Archivo**: `web/src/components/ui/select.tsx`

**Cambios**:
- ✅ Reemplazado con componentes completos de Shadcn UI
- ✅ Basado en Radix UI Select
- ✅ Incluye todos los sub-componentes necesarios:
  - `SelectTrigger`
  - `SelectValue`
  - `SelectContent`
  - `SelectItem`
  - `SelectLabel`
  - `SelectSeparator`
  - `SelectScrollUpButton`
  - `SelectScrollDownButton`

**Dependencia Instalada**:
```bash
npm install @radix-ui/react-select
```

### Solución 2: Corregir Orden de Parámetros

**Archivo**: `web/src/lib/web3.ts`

**Antes**:
```typescript
export async function getTokenBalance(address: string, tokenId: number): Promise<number>
```

**Ahora**:
```typescript
export async function getTokenBalance(tokenId: number, address: string): Promise<number>
```

**Razón**: Consistencia con la función interna que espera `(tokenId, address)`.

### Solución 3: Logging Extensivo para Debugging

**Archivo**: `web/src/app/tokens/create/page.tsx`

**Agregado**:
```typescript
console.log('📍 Verificando condiciones para cargar tokens:', {
  isConnected,
  address,
  userRole: user?.role
});

console.log('📦 IDs de tokens recibidos:', tokenIds);
console.log('   Tipo:', typeof tokenIds);
console.log('   Es array:', Array.isArray(tokenIds));
console.log('   Longitud:', tokenIds?.length);

for (const tokenId of tokenIds) {
  console.log(`  🔍 Cargando token ID: ${tokenId}...`);
  console.log(`    ✅ Token data:`, tokenData);
  console.log(`    📊 Balance: ${balance}`);
  
  if (balance > 0) {
    console.log(`    ✅ Token agregado: ${tokenData.name} (balance: ${balance})`);
  } else {
    console.log(`    ⏭️ Token omitido (balance = 0)`);
  }
}

console.log('✅ Tokens disponibles cargados:', tokensData.length);
```

**Beneficio**: Permite identificar exactamente dónde está fallando la carga de tokens.

---

## 🧪 **Cómo Verificar la Solución**

### Paso 1: Abrir Consola del Navegador
```
1. Presiona F12
2. Ve a la pestaña "Console"
3. Mantén abierta para ver logs
```

### Paso 2: Navegar a Crear Token
```
1. Conecta como Factory1
2. Ve a /tokens/create
3. Observa los logs en consola
```

### Paso 3: Interpretar Logs

**Escenario 1: Carga Exitosa** ✅
```
📍 Verificando condiciones para cargar tokens:
   { isConnected: true, address: "0x3C44...", userRole: "Factory" }

🔍 Cargando tokens disponibles para selección...
   Dirección Factory: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC

📦 IDs de tokens recibidos: [1, 2]
   Tipo: object
   Es array: true
   Longitud: 2

  🔍 Cargando token ID: 1...
    ✅ Token data: { name: "Café Arábica Colombia", ... }
    📊 Balance: 5000
    ✅ Token agregado: Café Arábica Colombia (balance: 5000)

  🔍 Cargando token ID: 2...
    ✅ Token data: { name: "Leche Pasteurizada", ... }
    📊 Balance: 3000
    ✅ Token agregado: Leche Pasteurizada (balance: 3000)

✅ Tokens disponibles cargados: 2
   Datos: [...]
```

**Escenario 2: Sin Tokens** ℹ️
```
📍 Verificando condiciones para cargar tokens:
   { isConnected: true, address: "0x3C44...", userRole: "Factory" }

🔍 Cargando tokens disponibles para selección...
   Dirección Factory: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC

📦 IDs de tokens recibidos: []
   Tipo: object
   Es array: true
   Longitud: 0

ℹ️ No hay tokens disponibles (array vacío o null)
```

**Escenario 3: Condiciones No Cumplidas** ⏭️
```
📍 Verificando condiciones para cargar tokens:
   { isConnected: false, address: null, userRole: undefined }

⏭️ Saltando carga de tokens (no cumple condiciones)
```

**Escenario 4: Error** ❌
```
📍 Verificando condiciones para cargar tokens:
   { isConnected: true, address: "0x3C44...", userRole: "Factory" }

🔍 Cargando tokens disponibles para selección...

❌ Error cargando tokens disponibles: Error: ...
```

---

## 🔍 **Diagnóstico de Problemas Comunes**

### Problema A: "Sin tokens disponibles" pero dashboard muestra tokens

**Causas Posibles**:
1. ✅ **Tokens no transferidos a Factory**: Producer creó tokens pero no los transfirió
2. ✅ **Balance = 0**: Tokens ya fueron consumidos
3. ✅ **getUserTokens() devuelve array vacío**: Problema con el contrato

**Cómo Verificar**:
```javascript
// En consola del navegador:
const address = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
const tokens = await window.ethereum.request({
  method: 'eth_call',
  params: [{
    to: "DIRECCION_CONTRATO",
    data: "0x..." // getUserTokens(address)
  }]
});
console.log("Tokens:", tokens);
```

### Problema B: Dropdown no muestra productos

**Causas Posibles**:
1. ✅ **Componentes Select no cargados**: Error de import
2. ✅ **availableTokens vacío**: No hay datos para mostrar
3. ✅ **Error de renderizado**: Problema con el componente

**Solución**:
```typescript
// Verificar en consola:
console.log("availableTokens:", availableTokens);
console.log("loadingTokens:", loadingTokens);
```

### Problema C: Error al cargar token individual

**Causas Posibles**:
1. ✅ **Token ID inválido**: Token no existe
2. ✅ **Permisos**: No tiene acceso al token
3. ✅ **Contrato no desplegado**: Dirección incorrecta

**Log Esperado**:
```
  🔍 Cargando token ID: 1...
  ❌ Error cargando token 1: Error: ...
```

---

## 📊 **Checklist de Verificación**

### Preparación
- [ ] Anvil corriendo en http://127.0.0.1:8545
- [ ] Contrato desplegado (nuevo con funcionalidad de re-solicitud)
- [ ] DApp corriendo en http://localhost:3000
- [ ] MetaMask configurado con cuentas de Anvil

### Flujo de Prueba

#### 1. Producer Crea Materia Prima
- [ ] Conectar como Producer1 (`0x7099...`)
- [ ] Crear token "Café Arábica Colombia" (cantidad: 5000)
- [ ] Verificar creación en /tokens
- [ ] **Verificar balance**: Debería mostrar 5000

#### 2. Transferir a Factory
- [ ] Desde /tokens, click en token
- [ ] "Transferir Token"
- [ ] Destino: Factory1 (`0x3C44...`)
- [ ] Cantidad: 1000
- [ ] Enviar transferencia

#### 3. Factory Acepta Transferencia
- [ ] Desconectar Producer1
- [ ] Conectar como Factory1
- [ ] Ir a /transfers
- [ ] Filtrar "Pendientes"
- [ ] Aceptar transferencia
- [ ] **Verificar balance**: Factory debería tener 1000

#### 4. Factory Crea Producto Manufacturado
- [ ] Factory1 en /tokens/create
- [ ] **Abrir consola del navegador** (F12)
- [ ] **Observar logs de carga**
- [ ] Verificar que aparece dropdown con "Café Arábica Colombia (Stock: 1000)"
- [ ] Seleccionar producto
- [ ] Ingresar cantidad: 100
- [ ] Verificar mensaje verde: "Se consumirán 100 unidades..."
- [ ] Crear token
- [ ] **Verificar**: Balance de café debería reducirse a 900

---

## 🚀 **Estado Actual**

```
✅ Componentes Select instalados y exportados
✅ Parámetros de getTokenBalance corregidos
✅ Logging extensivo implementado
✅ Servidor corriendo: http://localhost:3000
🔄 Pendiente: Re-deployment del contrato (nueva funcionalidad)
🔄 Pendiente: Pruebas end-to-end completas
```

---

## 📝 **Próximos Pasos**

### 1. Re-desplegar Contrato
```bash
cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker
./redeployment_foundry.sh
```

### 2. Limpiar Cache
```
http://localhost:3000/clear-cache.html?auto=true
```

### 3. Probar Flujo Completo
- Seguir checklist de verificación anterior
- Documentar resultados de logs
- Reportar cualquier error encontrado

### 4. Verificar Selector Visual
- Dropdown muestra nombres (no IDs) ✅
- Stock visible en cada producto ✅
- Validación de cantidad funciona ✅
- Mensajes descriptivos ✅

---

## 🆘 **Si el Problema Persiste**

### Información a Proporcionar:
1. **Logs de consola** (copia completa)
2. **Dirección del Factory** usado
3. **Dirección del contrato** desplegado
4. **Tokens visibles** en dashboard
5. **Resultado** de `getUserTokens()` en consola

### Comandos de Diagnóstico:

```bash
# Verificar contrato desplegado
cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker/sc
forge script script/CheckUser.s.sol --rpc-url http://127.0.0.1:8545

# Ver tokens de Factory1
cast call DIRECCION_CONTRATO "getUserTokens(address)(uint256[])" \
  0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC \
  --rpc-url http://127.0.0.1:8545

# Ver balance específico
cast call DIRECCION_CONTRATO "balanceOf(address,uint256)(uint256)" \
  0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC \
  1 \
  --rpc-url http://127.0.0.1:8545
```

---

**Fecha**: 26 Octubre 2025  
**Versión DApp**: v2.2.1  
**Estado**: Componentes corregidos, logging implementado, listo para pruebas


