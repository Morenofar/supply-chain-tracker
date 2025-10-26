#!/bin/bash

# Script para reiniciar todo el sistema de trazabilidad
# Uso: ./restart_all.sh

echo "🔄 Reiniciando Sistema de Trazabilidad..."
echo "=========================================="
echo ""

# 1. Detener procesos existentes
echo "🛑 Deteniendo procesos existentes..."
pkill -f anvil 2>/dev/null
pkill -f "next dev" 2>/dev/null
sleep 2
echo "✅ Procesos detenidos"
echo ""

# 2. Iniciar Anvil
echo "⚙️  Iniciando Anvil..."
cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker
anvil --code-size-limit 50000 > anvil.log 2>&1 &
ANVIL_PID=$!
sleep 3
echo "✅ Anvil iniciado (PID: $ANVIL_PID)"
echo ""

# 3. Desplegar contrato y crear usuarios/tokens
echo "📜 Desplegando contrato y creando datos de prueba..."
cd sc
forge script script/DeployAndSetup.s.sol:DeployAndSetup \
  --rpc-url http://127.0.0.1:8545 \
  --broadcast 2>&1 | grep -A 50 "SETUP COMPLETADO"
echo ""

# 4. Actualizar ABI y Bytecode
echo "📝 Actualizando ABI y Bytecode..."
python3 << 'EOF'
import json

with open('out/SupplyChain.sol/SupplyChain.json', 'r') as f:
    data = json.load(f)

with open('../web/public/contracts/SupplyChain.abi.json', 'w') as f:
    json.dump(data['abi'], f, indent=2)

bytecode = data['bytecode']['object']
with open('../web/public/contracts/SupplyChain.bytecode.json', 'w') as f:
    json.dump({"bytecode": bytecode}, f)

print("✅ ABI actualizado")
print("✅ Bytecode actualizado")
EOF
echo ""

# 5. Iniciar DApp
echo "🌐 Iniciando DApp..."
cd ../web
npm run dev > ../dapp.log 2>&1 &
DAPP_PID=$!
sleep 5
echo "✅ DApp iniciada (PID: $DAPP_PID)"
echo ""

# Resumen final
echo "=========================================="
echo "✅ SISTEMA INICIADO CORRECTAMENTE"
echo "=========================================="
echo ""
echo "📍 Servicios Disponibles:"
echo "  - Anvil:   http://127.0.0.1:8545"
echo "  - DApp:    http://localhost:3000"
echo ""
echo "📝 Logs:"
echo "  - Anvil:   tail -f anvil.log"
echo "  - DApp:    tail -f dapp.log"
echo ""
echo "📦 Datos Pre-cargados:"
echo "  - Usuarios: 7 aprobados"
echo "  - Tokens:   3 creados"
echo ""
echo "⚠️  IMPORTANTE:"
echo "  1. Limpia localStorage del navegador (F12 → Application → Clear)"
echo "  2. Recarga la página: http://localhost:3000"
echo "  3. Conecta MetaMask"
echo ""
echo "🎉 ¡Sistema listo para usar!"
echo ""


