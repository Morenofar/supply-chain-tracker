#!/bin/bash
# 🚀 Comandos de Referencia Rápida - Supply Chain Tracker
# Fecha: 26 de Octubre, 2025

# ============================================
# INICIAR TODO EL SISTEMA
# ============================================

# Terminal 1 - Blockchain (Anvil)
cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker
anvil --code-size-limit 50000

# Terminal 2 - DApp (Next.js)
cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker/web
npm run dev

# ============================================
# LIMPIAR Y REINICIAR
# ============================================

# Limpiar cache de DApp
cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker/web
rm -rf .next
npm run dev

# Limpiar localStorage del navegador
# Browser: http://localhost:3000/clear-cache.html?auto=true

# Reiniciar Anvil (blockchain limpia)
pkill -9 anvil
cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker
anvil --code-size-limit 50000

# ============================================
# SMART CONTRACT
# ============================================

# Compilar contrato
cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker/sc
forge build

# Ejecutar tests
forge test

# Tests con reporte de gas
forge test --gas-report

# Tests verbosos (ver logs)
forge test -vvv

# Test específico
forge test --match-test testCreateTokenManufacturado -vvv

# Limpiar build
forge clean

# Ver tamaño del contrato
forge build --sizes

# ============================================
# ACTUALIZAR ABI Y BYTECODE EN DAPP
# ============================================

cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker/sc

# Actualizar ABI
python3 << 'EOF'
import json
with open('out/SupplyChain.sol/SupplyChain.json', 'r') as f:
    data = json.load(f)
with open('../web/public/contracts/SupplyChain.abi.json', 'w') as f:
    json.dump(data['abi'], f, indent=2)
print("✅ ABI actualizado")
EOF

# Actualizar Bytecode
python3 << 'EOF'
import json
with open('out/SupplyChain.sol/SupplyChain.json', 'r') as f:
    data = json.load(f)
with open('../web/public/contracts/SupplyChain.bytecode.json', 'w') as f:
    json.dump({"bytecode": data['bytecode']['object']}, f)
print("✅ Bytecode actualizado")
EOF

# ============================================
# VERIFICAR ESTADO
# ============================================

# Verificar Anvil está corriendo
curl http://localhost:8545 -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Verificar DApp está corriendo
curl -I http://localhost:3000

# Ver procesos de Next.js
ps aux | grep "next dev"

# Ver procesos de Anvil
ps aux | grep anvil

# Ver dirección del contrato desplegado (si existe)
cast code 0x5FbDB2315678afecb367f032d93F642f64180aa3 --rpc-url http://localhost:8545

# ============================================
# INTERACCIÓN DIRECTA CON CONTRATO (cast)
# ============================================

# Verificar si contrato existe en dirección
cast code <CONTRACT_ADDRESS> --rpc-url http://localhost:8545

# Llamar función view
cast call <CONTRACT_ADDRESS> "isAdmin(address)" <ADDRESS> --rpc-url http://localhost:8545

# Enviar transacción
cast send <CONTRACT_ADDRESS> "requestUserRole(string)" "Producer" \
  --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d \
  --rpc-url http://localhost:8545

# Ver balance de cuenta
cast balance 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --rpc-url http://localhost:8545

# Ver último bloque
cast block-number --rpc-url http://localhost:8545

# ============================================
# METAMASK
# ============================================

# Seed Phrase de Anvil (importa 10 cuentas automáticamente)
# test test test test test test test test test test test junk

# Claves Privadas Individuales:
# Admin:     0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
# Producer1: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
# Factory1:  0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
# Retailer:  0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
# Consumer1: 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a

# Configuración Red Anvil:
# Nombre:     Anvil Local
# RPC URL:    http://127.0.0.1:8545
# Chain ID:   31337
# Símbolo:    ETH

# ============================================
# TROUBLESHOOTING
# ============================================

# Si DApp no carga
cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker/web
pkill -f "next dev"
rm -rf .next
npm run dev

# Si Anvil no responde
pkill -9 anvil
cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker
anvil --code-size-limit 50000

# Si hay error de puerto ocupado
lsof -i :3000  # Ver qué usa el puerto 3000
lsof -i :8545  # Ver qué usa el puerto 8545
pkill -f "next dev"
pkill -9 anvil

# Si localStorage está corrupto
# Browser: http://localhost:3000/clear-cache.html?auto=true

# ============================================
# DEPLOYMENT EN TESTNET (FUTURO)
# ============================================

# Sepolia
cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker/sc
forge script script/Deploy.s.sol:SupplyChainDeploy \
  --rpc-url https://sepolia.infura.io/v3/<API_KEY> \
  --private-key <PRIVATE_KEY> \
  --broadcast \
  --verify

# Polygon Mumbai
forge script script/Deploy.s.sol:SupplyChainDeploy \
  --rpc-url https://rpc-mumbai.maticvigil.com \
  --private-key <PRIVATE_KEY> \
  --broadcast \
  --verify

# ============================================
# GIT COMMANDS (OPCIONAL)
# ============================================

cd /home/morenofar/foundry/98_pfm_traza_2025

# Ver estado
git status

# Agregar todos los cambios
git add .

# Commit
git commit -m "feat: Sistema completo con optimizaciones de gas"

# Ver historial
git log --oneline

# ============================================
# HASHES PRE-CALCULADOS (PARA REFERENCIA)
# ============================================

# keccak256("Producer") = 0x95329f0f598032755f454b63034035528a2f09e00bb3dde055a4f8e3f7b11683
# keccak256("Factory")  = 0x992f90ffb92c5ad86f1df6829115f18aaea41d6094dadc8955c35086081a7bb9
# keccak256("Retailer") = 0x38a3b5f684ad6f73b7e2e4c5f36a51d1e05d8f9e0f71d3e6e5f4c3b2a1d0e9f8
# keccak256("Consumer") = 0x7d8f9e0f71d3e6e5f4c3b2a1d0e9f838a3b5f684ad6f73b7e2e4c5f36a51d1e0

# Calcular hash de string
cast keccak "TuString"

# ============================================
# ÚTILES
# ============================================

# Ver documentación completa
cat /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker/ESTADO_PROYECTO.md

# Ver optimizaciones
cat /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker/sc/OPTIMIZACIONES_RESUMEN.md

# Inicio rápido
cat /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker/INICIO_RAPIDO.md

# ============================================
# NOTAS
# ============================================

# - Anvil usa siempre las mismas cuentas (determinístico)
# - Anvil resetea estado al cerrar (no persiste)
# - MetaMask puede borrar cuentas importadas (ver DIAGNOSTICO_METAMASK.md)
# - ABI/Bytecode deben actualizarse después de cada cambio en el contrato
# - localStorage debe limpiarse si cambia la dirección del contrato

# ============================================
# FIN
# ============================================


