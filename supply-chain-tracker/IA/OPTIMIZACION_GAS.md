# Optimización de Gas - Supply Chain Tracker

## ✅ Verificación Completa de Funciones

Todas las funciones entre la DApp y el Smart Contract tienen los parámetros en el **orden correcto**.

### Funciones Verificadas (15 totales):

1. ✅ `requestUserRole(role: string)`
2. ✅ `changeStatusUser(userAddress, newStatus)`
3. ✅ `getUserInfo(address)`
4. ✅ `isAdmin(address)`
5. ✅ `createToken(name, totalSupply, features, parentIds, parentAmounts)`
6. ✅ `getToken(tokenId)`
7. ✅ `getTokenBalance(tokenId, address)` - **CORREGIDO**
8. ✅ `getUserTokens(address)`
9. ✅ `transfer(to, tokenId, amount)`
10. ✅ `acceptTransfer(transferId)`
11. ✅ `rejectTransfer(transferId)`
12. ✅ `cancelTransfer(transferId)`
13. ✅ `getTransfer(transferId)`
14. ✅ `getUserTransfers(address)`
15. ✅ `traceTokenToOrigin(tokenId)`

---

## 🔥 Optimizaciones de Gas Implementadas

### En el Smart Contract (SupplyChain.sol)

#### 1. **Custom Errors** (-68% gas vs require con string)
```solidity
// ✅ Optimizado
error UserNotRegistered();
if (userId == 0) revert UserNotRegistered();

// ❌ No optimizado  
require(userId != 0, "User not registered");
```

**Ahorro**: ~300-500 gas por error

#### 2. **Calldata en lugar de Memory** (-20-40% gas en arrays)
```solidity
// ✅ Optimizado
function createToken(
    string calldata name,
    uint256[] calldata parentIds,
    uint256[] calldata parentAmounts
) external
```

**Ahorro**: ~500-2000 gas dependiendo del tamaño del array

#### 3. **Variable Caching** (evita SLOAD múltiples)
```solidity
// ✅ Optimizado
uint256 userId = addressToUserId[msg.sender];
if (userId == 0) revert UserNotRegistered();
User storage user = users[userId];
```

**Ahorro**: ~100 gas por SLOAD evitado

#### 4. **Packed Storage Variables**
```solidity
// ✅ Optimizado - 1 slot en lugar de 2
uint128 public nextTokenId = 1;    // 16 bytes
uint128 public nextTransferId = 1; // 16 bytes
```

**Ahorro**: ~20,000 gas en deploy, ~100 gas por lectura

#### 5. **Loop Optimization**
```solidity
// ✅ Optimizado
uint256 length = parentIds.length;
for (uint256 i = 0; i < length;) {
    // ... código ...
    unchecked { ++i; }
}
```

**Ahorro**: ~30-50 gas por iteración

#### 6. **Short-Circuit Evaluation**
```solidity
// ✅ Optimizado - valida lo más barato primero
if (totalSupply == 0) revert InvalidSupply();
if (parentIds.length != parentAmounts.length) revert InvalidParentArrays();
```

#### 7. **External Functions**
```solidity
// ✅ Optimizado - external es más barato que public
function createToken(...) external { }
```

**Ahorro**: ~200-500 gas vs public

#### 8. **Modifier Optimization**
```solidity
// ✅ Optimizado - modifiers reutilizables
modifier onlyApprovedUser() {
    uint256 userId = addressToUserId[msg.sender];
    if (userId == 0) revert UserNotRegistered();
    if (users[userId].status != UserStatus.Approved) revert UserNotApproved();
    _;
}
```

---

### En la DApp (web3.ts)

#### 1. **Estimación Automática de Gas**
```typescript
// ✅ Optimizado - ethers.js estima automáticamente
const tx = await this.contract.createToken(name, totalSupply, features, parentIds, parentAmounts);

// Solo usamos gas fijo para deploy (contrato grande)
const contract = await factory.deploy({ gasLimit: 8000000 });
```

**Beneficio**: No sobrepagar gas innecesariamente

#### 2. **Conversión Eficiente de Tipos**
```typescript
// ✅ Optimizado - conversión directa a BigInt
await web3Service.createToken(
  name,
  BigInt(totalSupply),
  features,
  parentIds.map(id => BigInt(id)),
  parentAmounts.map(amount => BigInt(amount))
);
```

#### 3. **Lazy Loading de ABI/Bytecode**
```typescript
// ✅ Optimizado - solo carga cuando se necesita
export async function getABI(): Promise<any> {
  if (typeof window === 'undefined') return [];
  const response = await fetch('/contracts/SupplyChain.abi.json');
  return await response.json();
}
```

---

## 📊 Estimación de Costos de Gas

### Operaciones Principales (en Anvil/Localhost)

| Función | Gas Estimado | Comentarios |
|---------|-------------|-------------|
| `requestUserRole` | ~80,000 | Primera vez (SSTORE nuevo) |
| `changeStatusUser` | ~30,000 | Solo admin |
| `createToken` (sin padres) | ~150,000 | Producer materia prima |
| `createToken` (con padres) | ~250,000 | Factory producto derivado |
| `transfer` | ~100,000 | Crear transferencia |
| `acceptTransfer` | ~80,000 | Mover tokens |
| `rejectTransfer` | ~30,000 | Solo cambiar estado |
| `cancelTransfer` | ~30,000 | Solo cambiar estado |

### En Red Principal (Ethereum Mainnet)

**Con gas price de 30 gwei:**
- `createToken`: ~0.0045 ETH (~$10 USD)
- `transfer`: ~0.003 ETH (~$6.5 USD)
- `acceptTransfer`: ~0.0024 ETH (~$5 USD)

---

## 🚀 Optimizaciones Adicionales Recomendadas

### 1. Batch Operations (Futuro)
```typescript
// Permitir múltiples transferencias en una transacción
async batchTransfer(
  recipients: string[],
  tokenIds: number[],
  amounts: number[]
): Promise<void>
```

**Ahorro potencial**: 30-40% de gas vs transferencias individuales

### 2. Meta-Transactions (Futuro)
- Permitir que el admin pague el gas de los usuarios
- Usar EIP-2771 o similar

### 3. Layer 2 (Futuro)
- Desplegar en Polygon, Arbitrum, u Optimism
- Reducción de costos del 95-99%

---

## 🎯 Resumen

### ✅ Ya Implementado:
- Custom errors en todas las validaciones
- Calldata para todos los parámetros externos
- Variable caching en funciones complejas
- Packed storage variables
- Loop optimization con unchecked
- External functions
- Estimación automática de gas en DApp

### 📈 Resultado:
El contrato ya está **altamente optimizado**. Las únicas optimizaciones adicionales significativas requerirían cambios arquitectónicos (batch operations, L2, etc).

### 💡 Recomendación:
Mantener el código actual. Es eficiente y sigue las mejores prácticas de Solidity 0.8+.

---

## 🛠️ Herramientas Útiles

Para análisis adicional de gas:
```bash
# En el directorio sc/
forge snapshot --gas-report
forge test --gas-report
```

Para profiling detallado:
```bash
forge test --gas-report > gas-report.txt
```


