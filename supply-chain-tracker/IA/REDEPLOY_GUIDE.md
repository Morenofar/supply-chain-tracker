# 🔄 Guía de Re-deployment del Contrato

## ⚠️ IMPORTANTE: Esto Borrará Todos los Datos

Al re-desplegar el contrato:
- ❌ Se perderán todos los usuarios registrados
- ❌ Se perderán todos los tokens creados
- ❌ Se perderán todas las transferencias
- ✅ Tendrás la nueva versión con Factory → Factory habilitado

---

## 📋 Pasos para Re-desplegar

### **Opción 1: Script Automatizado (RECOMENDADO)**

Este script despliega el contrato Y registra/aprueba a todos los usuarios automáticamente.

```bash
# 1. Asegúrate de que Anvil esté corriendo
# En una terminal separada:
anvil --code-size-limit 50000

# 2. En otra terminal, ejecuta el script de deployment
cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker/sc
forge script script/DeployAndSetup.s.sol:DeployAndSetup --rpc-url http://127.0.0.1:8545 --broadcast
```

**Este script automáticamente:**
- ✅ Despliega el contrato con el Admin (cuenta 0)
- ✅ Registra 7 usuarios con sus roles
- ✅ Aprueba a todos los usuarios
- ✅ Muestra la dirección del contrato desplegado

**Usuarios que se registrarán:**
1. Producer1: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
2. Factory1: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
3. Retailer: `0x90F79bf6EB2c4f870365E785982E1f101E93b906`
4. Consumer1: `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65`
5. Producer2: `0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc`
6. Factory2: `0x976EA74026E726554dB657fA54763abd0C3a0aa9`
7. Producer3: `0x14dC79964da2C08b23698B3D3cc7Ca32193d9955`

---

### **Opción 2: Script Manual (Solo Deployment)**

Si prefieres registrar usuarios manualmente desde la DApp:

```bash
cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker/sc
forge script script/Deploy.s.sol:DeployScript --rpc-url http://127.0.0.1:8545 --broadcast
```

---

## 🔧 Actualizar la DApp

Después del re-deployment, **debes actualizar la dirección del contrato** en la DApp.

### **Pasos:**

1. **Copia la dirección del contrato** que muestra el script (ejemplo: `0x...`)

2. **Limpia el localStorage del navegador:**
   - Abre DevTools (F12)
   - Ve a Application → Local Storage → `http://localhost:3000`
   - Click derecho → Clear
   - O visita: `http://localhost:3000/clear-cache.html`

3. **Actualiza `web/src/contracts/config.ts`** (SI USAS DIRECCIÓN FIJA):
   ```typescript
   export const DEPLOYED_CONTRACT_ADDRESS = '0xNUEVA_DIRECCION_AQUI';
   ```
   
   **O mejor**, la DApp ya está configurada para deployment dinámico, así que:
   - Solo limpia localStorage
   - Recarga la página
   - Conecta con la cuenta Admin
   - Despliega desde la DApp

---

## 🎯 Después del Re-deployment

### **Si usaste el Script Automatizado:**

1. ✅ El contrato está desplegado
2. ✅ Los 7 usuarios ya están registrados y aprobados
3. ✅ Puedes empezar a crear tokens inmediatamente
4. ✅ **Ahora Factory1 puede transferir a Factory2** ✨

### **Si usaste el Script Manual:**

1. Conecta con cada cuenta de usuario
2. Solicita rol desde la DApp
3. Conéctate como Admin
4. Aprueba a cada usuario

---

## 🧪 Verificar que Funciona

```bash
# Ver el contrato desplegado
forge script script/CheckUser.s.sol --rpc-url http://127.0.0.1:8545

# Ver usuarios registrados (si usaste script automatizado)
# Deberías ver 7 usuarios con estado "Approved"
```

---

## 📊 Nuevos Flujos Disponibles

Después del re-deployment, estos flujos estarán habilitados:

```
✅ Producer → Producer (redistribución de materias primas)
✅ Producer → Factory (suministro)
✅ Factory → Factory (componentes entre fábricas) ← NUEVO
✅ Factory → Retailer (productos terminados)
✅ Retailer → Retailer (redistribución) ← NUEVO
✅ Retailer → Consumer (venta final)
```

---

## ⚡ Quick Start (Todo en Uno)

```bash
# Terminal 1: Anvil
anvil --code-size-limit 50000

# Terminal 2: Deploy + Setup
cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker/sc
forge script script/DeployAndSetup.s.sol:DeployAndSetup --rpc-url http://127.0.0.1:8545 --broadcast

# Terminal 3: DApp
cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker/web
# Limpia localStorage en el navegador
# Recarga la página
# ¡Listo para usar!
```

---

## 🔍 Troubleshooting

### Error: "Contract already deployed"
- **Solución**: Reinicia Anvil (Ctrl+C y vuelve a ejecutar)

### Error: "Code size limit"
- **Solución**: Asegúrate de iniciar Anvil con `--code-size-limit 50000`

### La DApp no detecta el nuevo contrato
- **Solución**: Limpia localStorage y recarga la página

### Los usuarios no aparecen en el Admin panel
- **Solución**: Asegúrate de usar `DeployAndSetup.s.sol`, no `Deploy.s.sol`

---

## 📝 Notas

- El script usa las claves privadas de Anvil (SOLO para desarrollo)
- **NUNCA** uses estas claves en testnet o mainnet
- Cada vez que reinicies Anvil, deberás re-desplegar

---

**¿Listo para re-desplegar?** 🚀


