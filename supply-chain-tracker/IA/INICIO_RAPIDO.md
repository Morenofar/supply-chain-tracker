# ⚡ Inicio Rápido - Supply Chain Tracker

## 🚀 Para Retomar Mañana (3 Comandos)

### Terminal 1 - Blockchain:
```bash
cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker
anvil --code-size-limit 50000
```

### Terminal 2 - DApp:
```bash
cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker/web
npm run dev
```

### Browser:
```
1. http://localhost:3000/clear-cache.html?auto=true
2. Importar seed phrase en MetaMask: 
   test test test test test test test test test test test junk
3. Configurar red Anvil (RPC: http://127.0.0.1:8545, Chain: 31337)
4. http://localhost:3000
```

---

## 🔑 Cuentas de Anvil

### Seed Phrase (Importa las 10 automáticamente):
```
test test test test test test test test test test test junk
```

### O Claves Individuales:
```
Admin:     0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Producer1: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
Factory1:  0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
Retailer:  0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
Consumer1: 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a
```

---

## 📋 Flujo Rápido de Prueba

1. **Conectar como Admin** → Desplegar contrato
2. **Cambiar a Producer1** → Solicitar rol Producer
3. **Cambiar a Admin** → Aprobar Producer1
4. **Cambiar a Producer1** → Crear token (Café, 1000)
5. **Transferir 500** a Factory1 (0x3C44...93BC)
6. **Registrar y aprobar Factory1**
7. **Factory1 acepta transferencia**
8. **Factory1 crea producto manufacturado** (usa 400 de Café)
9. ✅ Ver trazabilidad completa

---

## 📁 Documentación Principal

- **`ESTADO_PROYECTO.md`** - Documento completo (lee esto primero)
- **`sc/OPTIMIZACIONES_DETALLADAS.md`** - 20 optimizaciones explicadas
- **`DIAGNOSTICO_METAMASK.md`** - Solución a cuentas borradas
- **`IMPORTAR_CUENTAS_METAMASK.md`** - Guía de importación

---

## ⚠️ Problema Conocido

**MetaMask borra cuentas importadas**

Solución temporal: Usar seed phrase
```
test test test test test test test test test test test junk
```

Solución permanente: Ver `DIAGNOSTICO_METAMASK.md`

---

## 📊 Estado Actual

✅ **95% Completo**
- Smart Contract: ✅ Optimizado (27-31% ahorro gas)
- DApp: ✅ Todas las funcionalidades
- Tests: ✅ 26/26 pasando
- Docs: ✅ 11 archivos creados

---

**Lee `ESTADO_PROYECTO.md` para el resumen completo** 📖


