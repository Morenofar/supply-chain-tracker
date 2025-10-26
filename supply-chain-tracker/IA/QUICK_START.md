# ⚡ Quick Start - Sistema Trazabilidad

## 🚀 Inicio Rápido (3 Comandos)

### **Terminal 1: Anvil**
```bash
cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker
anvil --code-size-limit 50000
```

### **Terminal 2: Deploy Automatizado**
```bash
cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker/sc
forge script script/DeployAndSetup.s.sol:DeployAndSetup \
  --rpc-url http://127.0.0.1:8545 \
  --broadcast
```

### **Terminal 3: Frontend**
```bash
cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker/web
npm run dev
```

### **Navegador:**
```
1. Abre: http://localhost:3000
2. F12 → Application → Local Storage → Clear (si ya lo usaste antes)
3. Recarga la página (F5)
4. Conecta MetaMask
5. ¡Listo! 🎉
```

---

## 📦 Lo Que Obtienes Automáticamente

### **✅ Contrato Desplegado:**
- Dirección: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- Admin: Cuenta 0 de Anvil

### **✅ 7 Usuarios Aprobados:**
- Producer1, Producer2, Producer3
- Factory1, Factory2
- Retailer
- Consumer1

### **✅ 3 Tokens Pre-creados:**
- [1] Tomates 1000kg (Producer1)
- [2] Calabacines 1000kg (Producer1)
- [3] Cebollas 1000kg (Producer2)

---

## 🎯 Flujo de Prueba Rápido

1. **Conecta como Producer1** (`0x7099...79C8`)
   - Ve a "Mis Tokens" → Verás Tomates y Calabacines
   - Transfiere 500kg de Tomates a Factory1

2. **Conecta como Factory1** (`0x3C44...93BC`)
   - Ve a "Transferencias" → Acepta los Tomates
   - Ve a "Crear Token" → Crea "Salsa de Tomate"
     - Usa Token #1 (Tomates) como padre
   - Transfiere la Salsa a Factory2 ← NUEVO FLUJO

3. **Conecta como Factory2** (`0x976E...0aa9`)
   - Acepta la Salsa
   - Crea producto final usando la Salsa
   - Transfiere a Retailer

4. **Conecta como Retailer** (`0x90F7...b906`)
   - Acepta el producto
   - Transfiere a Consumer1

5. **Conecta como Consumer1** (`0x15d3...6A65`)
   - Acepta el producto
   - Ve la trazabilidad completa: Tomates → Salsa → Producto Final

---

## 🔍 Verificación

```bash
# Ver todos los tests
forge test --summary

# Ver gas report
forge test --gas-report

# Ver usuarios registrados
forge script script/CheckUser.s.sol --rpc-url http://127.0.0.1:8545

# Ver tokens
forge script script/ListAllTokens.s.sol --rpc-url http://127.0.0.1:8545
```

---

## 📚 Más Información

- `RESUMEN_FINAL_DEPLOYMENT.md` - Detalle completo del deployment
- `REDEPLOY_GUIDE.md` - Cómo re-desplegar
- `IMPORTAR_CUENTAS_METAMASK.md` - Todas las claves privadas
- `sc/OPTIMIZACIONES_DETALLADAS.md` - Optimizaciones de gas

---

**Todo listo en menos de 5 minutos** ⚡


