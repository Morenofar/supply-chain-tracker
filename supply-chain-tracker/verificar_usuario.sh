#!/bin/bash

cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker/sc

echo "🔍 Verificando estado de Consumer1..."
echo ""

forge script script/CheckUser.s.sol --rpc-url http://127.0.0.1:8545 2>&1 | grep -A 10 "ESTADO DE CONSUMER1"

echo ""
echo "✅ Si muestra 'Estado: 3 (Canceled)' → Usuario listo para re-solicitar"
echo "⚠️  Pero necesitas RE-DESPLEGAR el contrato para que funcione"


