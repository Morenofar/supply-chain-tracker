# 🔄 RE-DESPLIEGUE DEL CONTRATO (Nueva Funcionalidad)

## 📋 **Resumen**

El contrato **debe ser re-desplegado** porque la versión actual (`0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9`) **NO incluye** la funcionalidad de **re-solicitud para usuarios cancelados**.

### ✅ Nueva Funcionalidad Incluida:
- Usuarios con estado **Canceled** pueden **volver a solicitar acceso**
- Pueden **mantener el mismo rol** o **cambiar a otro rol**
- Su estado vuelve automáticamente a **Pending** (amarillo)
- **4 tests nuevos** agregados (31/31 pasando)
- **Gas optimizado** en `requestUserRole` (-5.3%)

---

## 🚨 **MÉTODO RÁPIDO (Recomendado)**

### Paso 1: Limpiar Estado Previo

```bash
# En tu navegador:
1. Abre: http://localhost:3000/clear-cache.html?auto=true
2. Espera 2 segundos (se limpia automáticamente)
3. Cierra la pestaña
```

### Paso 2: Re-desplegar desde DApp

```bash
1. Abre: http://localhost:3000
2. Click "Conectar MetaMask"
3. Selecciona cuenta ADMIN: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
4. Aprueba la conexión
5. Click "Desplegar Contrato"
6. Aprueba la transacción en MetaMask
7. Espera ~10 segundos
8. ✅ Verás: "Contrato desplegado en: 0x..."
```

---

## 🛠️ **MÉTODO ALTERNATIVO (Foundry + Manual)**

### Opción A: Desplegar con Foundry

```bash
cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker/sc

# Desplegar con la cuenta admin
forge script script/Deploy.s.sol \
  --rpc-url http://127.0.0.1:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Anota la dirección del contrato desplegado
```

### Opción B: Actualizar Configuración Manual

Si desplegaste con Foundry, actualiza `web/src/contracts/config.ts`:

```typescript
// Línea ~4
export const DEPLOYED_CONTRACT_ADDRESS = "0x_NUEVA_DIRECCION_AQUI_";
```

---

## 🧪 **Verificar que el Nuevo Contrato Funciona**

### Test 1: Usuario Cancelado Puede Re-solicitar

```bash
cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker/sc

# Verificar estado del usuario
forge script script/CheckUser.s.sol --rpc-url http://127.0.0.1:8545

# Debería mostrar:
# Usuario EXISTE:
#   Estado: 3 (Canceled)
```

### Test 2: Desde la DApp

1. **Conectar como usuario cancelado** (Consumer1: `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65`)
2. Deberías ver pantalla **naranja** con:
   - ❌ "Tu cuenta fue cancelada"
   - "Solicitar Acceso Nuevamente" button
3. **Seleccionar nuevo rol** (ej: "Producer")
4. Click **"Solicitar Acceso Nuevamente"**
5. ✅ Debería mostrar: "✅ Solicitud enviada. Esperando aprobación del administrador"

### Test 3: Admin Aprueba

1. **Conectar como Admin**
2. Ir a **Admin Panel** → **Gestión de Usuarios**
3. Ver usuario con estado **Pending** (amarillo)
4. Cambiar a **Approved** (verde)
5. ✅ Usuario puede usar el sistema

---

## 📊 **Comparación de Versiones**

| Funcionalidad | Contrato Anterior | Nuevo Contrato |
|---------------|-------------------|----------------|
| Usuario Canceled re-solicita | ❌ Error `UserAlreadyRegistered` | ✅ Puede re-solicitar |
| Cambio de rol para Canceled | ❌ No permitido | ✅ Permitido |
| Tests | 28/28 | 31/31 (+3 nuevos) |
| Gas `requestUserRole` | 133,252 avg | 126,226 avg (-5.3%) |
| Usuarios Approved re-solicitan | ❌ No | ❌ No (correcto) |
| Usuarios Rejected re-solicitan | ❌ No | ❌ No (correcto) |

---

## 🔍 **Cómo Saber si Tengo el Nuevo Contrato**

### Método 1: Probar Funcionalidad

Intenta que un usuario cancelado re-solicite acceso:
- ❌ **Error `UserAlreadyRegistered`** → Contrato antiguo
- ✅ **"Solicitud enviada..."** → Nuevo contrato

### Método 2: Verificar Address

El contrato antiguo es: `0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9`

Si en tu navegador (consola de desarrollo):
```javascript
localStorage.getItem('contractAddress')
```

Devuelve una dirección **diferente** → Nuevo contrato ✅

---

## ⚠️ **Problemas Comunes**

### Error: "Contract not deployed"

**Solución**:
```bash
# Limpiar cache
curl http://localhost:3000/clear-cache.html?auto=true

# Reconectar como admin
# Re-desplegar desde DApp
```

### Error: "insufficient funds"

**Solución**:
```bash
# Reiniciar Anvil (resetea balances)
# Ctrl+C en terminal de Anvil
anvil --code-size-limit 50000
```

### DApp no detecta nuevo contrato

**Solución**:
```bash
# Hard refresh en navegador
Ctrl + Shift + R (Linux/Windows)
Cmd + Shift + R (Mac)

# O limpiar cache:
F12 → Application → Storage → Clear Site Data
```

---

## 📝 **Checklist Post-Deployment**

- [ ] Contrato desplegado en nueva dirección
- [ ] Address guardado en localStorage
- [ ] Admin puede acceder a Admin Panel
- [ ] Usuario nuevo puede registrarse
- [ ] Usuario cancelado puede re-solicitar ✅ **NUEVO**
- [ ] Admin puede aprobar/rechazar/cancelar
- [ ] Tokens se pueden crear
- [ ] Transferencias funcionan

---

## 🎯 **Próximos Pasos**

1. ✅ Re-desplegar contrato (método rápido o Foundry)
2. ✅ Verificar funcionalidad de re-solicitud
3. ✅ Probar flujo completo de usuarios
4. ✅ Documentar nueva dirección del contrato
5. 🚀 ¡Sistema listo para producción!

---

**Fecha**: 26 Octubre 2025  
**Versión Smart Contract**: v2.1.0 (con re-solicitud para Canceled)  
**Tests**: 31/31 ✅  
**Gas Optimizado**: -5.3% en `requestUserRole`


