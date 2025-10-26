# 🚀 Instrucciones de Deploy - SupplyChain DApp

## ⚠️ IMPORTANTE: El Contrato Ya Está Desplegado

La dirección del contrato actual es:
```
0x5FbDB2315678afecb367f032d93F642f64180aa3
```

## 📋 Pasos para Usar la DApp

### 1️⃣ Limpiar Estado del Navegador

**ANTES DE ABRIR LA DAPP**, ejecuta en la consola del navegador (F12):

```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### 2️⃣ Configurar MetaMask

#### A. Agregar Red Anvil (si no la tienes):

1. Click en selector de redes → "Agregar red manualmente"
2. Llenar los datos:
   - **Nombre**: `Anvil Local`
   - **URL de RPC**: `http://127.0.0.1:8545`
   - **ID de cadena**: `31337`
   - **Símbolo**: `ETH`
3. Click en "Guardar"

#### B. Importar Cuenta Admin:

1. Icono de cuenta → "Importar cuenta"
2. **Clave privada**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
3. Click en "Importar"

Esta cuenta es: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` (Admin)

### 3️⃣ Conectar la DApp

1. Abre `http://localhost:3000`
2. Asegúrate de estar en red **"Anvil Local"** en MetaMask
3. Click en **"Conectar MetaMask"**
4. Autoriza la conexión

### 4️⃣ Usar el Contrato Desplegado

La DApp debería detectar automáticamente el contrato en:
```
0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Si no lo detecta, guarda manualmente esta dirección en localStorage:

```javascript
localStorage.setItem('deployInfo', JSON.stringify({
  contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  adminAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  deployedAt: Date.now()
}));
location.reload();
```

---

## 🔄 Si Necesitas Reiniciar Todo

### Opción 1: Reiniciar Solo la Blockchain

```bash
# Detener Anvil
pkill -9 anvil

# Reiniciar Anvil
cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker
anvil --code-size-limit 50000
```

Luego, en el navegador:
```javascript
localStorage.clear();
location.reload();
```

### Opción 2: Desplegar Nuevo Contrato Manualmente

```bash
cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker/sc

cast send \
  --rpc-url http://localhost:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --create "$(cat out/SupplyChain.sol/SupplyChain.json | python3 -c 'import sys, json; print(json.load(sys.stdin)["bytecode"]["object"])')"
```

Copia la dirección `contractAddress` del output y guárdala en la DApp.

---

## 🎯 Cuentas de Prueba de Anvil

Todas tienen **10,000 ETH**:

| Rol | Dirección | Clave Privada |
|-----|-----------|---------------|
| **Admin** | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| Producer1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |
| Factory1 | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` |
| Retailer | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6` |
| Consumer1 | `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` | `0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a` |

---

## 🐛 Troubleshooting

### Error: "Block out of range"
**Solución**: La blockchain se reinició. Limpia el localStorage:
```javascript
localStorage.clear();
location.reload();
```

### Error: "Contrato no encontrado"
**Solución**: Despliega el contrato de nuevo o usa la dirección correcta.

### Error: "OutOfGas"
**Solución**: Ya está configurado con 8M de gas limit.

### Error: "CreateContractSizeLimit"
**Solución**: Anvil debe ejecutarse con `--code-size-limit 50000`.

---

## ✅ Verificación Rápida

```bash
# 1. Verificar que Anvil está corriendo
curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' http://localhost:8545

# 2. Verificar que el contrato existe
cast code 0x5FbDB2315678afecb367f032d93F642f64180aa3 --rpc-url http://localhost:8545

# 3. Verificar que Next.js está corriendo
curl -I http://localhost:3000
```


