#!/bin/bash

# Script directo para deployment usando cast
# Más confiable que forge script en algunos casos

set -e

ANVIL_RPC="http://127.0.0.1:8545"
CONTRACT_PATH="out/SupplyChain.sol/SupplyChain.json"

# Claves privadas de Anvil
ADMIN_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
PRODUCER1_KEY="0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
FACTORY1_KEY="0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
RETAILER_KEY="0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"
CONSUMER1_KEY="0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"
PRODUCER2_KEY="0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba"
FACTORY2_KEY="0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e"
PRODUCER3_KEY="0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356"

echo "=========================================="
echo "DEPLOYMENT DIRECTO CON CAST"
echo "=========================================="
echo ""

# 1. Compilar contrato
echo "📦 Compilando contrato..."
forge build --silent
echo "✅ Contrato compilado"
echo ""

# 2. Extraer bytecode
echo "📝 Extrayendo bytecode..."
BYTECODE=$(cat $CONTRACT_PATH | python3 -c "import sys, json; print(json.load(sys.stdin)['bytecode']['object'])")
echo "✅ Bytecode extraído (${#BYTECODE} caracteres)"
echo ""

# 3. Desplegar contrato
echo "🚀 Desplegando contrato..."
DEPLOYMENT_TX=$(cast send --create $BYTECODE --private-key $ADMIN_KEY --rpc-url $ANVIL_RPC --json)
CONTRACT_ADDRESS=$(echo $DEPLOYMENT_TX | python3 -c "import sys, json; print(json.load(sys.stdin)['contractAddress'])")

echo "✅ Contrato desplegado en: $CONTRACT_ADDRESS"
echo ""

# Guardar dirección para uso posterior
echo "$CONTRACT_ADDRESS" > deployed_address.txt

echo "=========================================="
echo "DEPLOYMENT COMPLETADO"
echo "=========================================="
echo "Dirección del Contrato: $CONTRACT_ADDRESS"
echo ""
echo "⚠️  IMPORTANTE:"
echo "  - Actualiza la dirección en web/src/contracts/config.ts"
echo "  - Limpia localStorage del navegador"
echo "  - O despliega desde la DApp con esta dirección"
echo ""
echo "Los usuarios deben registrarse desde la DApp"
echo "=========================================="


