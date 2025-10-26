#!/bin/bash

echo "🚀 RE-DESPLEGANDO CONTRATO ACTUALIZADO"
echo "======================================"
echo ""

cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker/sc

echo "📦 Compilando contrato..."
forge build --force > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Compilación exitosa"
else
    echo "❌ Error en compilación"
    exit 1
fi

echo ""
echo "🔧 Desplegando con cuenta Admin..."
echo "   Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
echo ""

# Desplegar contrato
DEPLOY_OUTPUT=$(forge script script/Deploy.s.sol \
  --rpc-url http://127.0.0.1:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  2>&1)

# Extraer dirección del contrato
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -oP 'SupplyChain deployed at: \K0x[a-fA-F0-9]{40}' | head -1)

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "❌ Error al desplegar contrato"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

echo "✅ Contrato desplegado exitosamente"
echo ""
echo "📋 INFORMACIÓN DEL CONTRATO:"
echo "   Dirección: $CONTRACT_ADDRESS"
echo "   Admin:     0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
echo "   Network:   Anvil (Chain ID: 31337)"
echo ""

# Actualizar config.ts con la nueva dirección
CONFIG_FILE="../web/src/contracts/config.ts"

if [ -f "$CONFIG_FILE" ]; then
    echo "📝 Actualizando config.ts..."
    
    # Backup
    cp "$CONFIG_FILE" "${CONFIG_FILE}.backup"
    
    # Reemplazar dirección
    sed -i "s/export const DEPLOYED_CONTRACT_ADDRESS = .*/export const DEPLOYED_CONTRACT_ADDRESS = \"$CONTRACT_ADDRESS\";/" "$CONFIG_FILE"
    
    echo "✅ Config actualizado"
else
    echo "⚠️  No se encontró config.ts"
    echo "   Actualiza manualmente: DEPLOYED_CONTRACT_ADDRESS = \"$CONTRACT_ADDRESS\""
fi

echo ""
echo "🧪 VERIFICACIÓN:"
echo "   1. Ejecuta: ./verificar_usuario.sh"
echo "   2. Abre: http://localhost:3000"
echo "   3. Limpia cache del navegador (Ctrl+Shift+R)"
echo "   4. Conecta como Admin"
echo "   5. Deberías ver el nuevo contrato automáticamente"
echo ""
echo "✅ RE-DEPLOYMENT COMPLETADO"


