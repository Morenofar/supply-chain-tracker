#!/bin/bash

# Script completo para desplegar contrato y configurar usuarios/tokens
# Usa cast send para mayor control y confiabilidad

set -e

ANVIL_RPC="http://127.0.0.1:8545"

# Claves privadas de Anvil
ADMIN_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
PRODUCER1_KEY="0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
FACTORY1_KEY="0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
RETAILER_KEY="0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"
CONSUMER1_KEY="0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"
PRODUCER2_KEY="0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba"
FACTORY2_KEY="0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e"
PRODUCER3_KEY="0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356"

# Direcciones
ADMIN_ADDR="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
PRODUCER1_ADDR="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
FACTORY1_ADDR="0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
RETAILER_ADDR="0x90F79bf6EB2c4f870365E785982E1f101E93b906"
CONSUMER1_ADDR="0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
PRODUCER2_ADDR="0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc"
FACTORY2_ADDR="0x976EA74026E726554dB657fA54763abd0C3a0aa9"
PRODUCER3_ADDR="0x14dC79964da2C08b23698B3D3cc7Ca32193d9955"

echo "=========================================="
echo "DEPLOYMENT Y SETUP AUTOMATIZADO"
echo "=========================================="
echo ""

# 1. Compilar
echo "📦 Compilando contrato..."
cd /home/morenofar/foundry/98_pfm_traza_2025/supply-chain-tracker/sc
forge build --silent
echo "✅ Contrato compilado"
echo ""

# 2. Desplegar contrato
echo "🚀 Desplegando contrato..."
DEPLOYMENT=$(forge create src/SupplyChain.sol:SupplyChain \
  --private-key $ADMIN_KEY \
  --rpc-url $ANVIL_RPC \
  --legacy \
  --broadcast 2>&1)

CONTRACT=$(echo "$DEPLOYMENT" | grep "Deployed to:" | awk '{print $3}')
echo "✅ Contrato desplegado en: $CONTRACT"
echo "$CONTRACT" > deployed_address.txt
echo ""

# 3. Registrar usuarios
echo "=========================================="
echo "REGISTRANDO USUARIOS"
echo "=========================================="

# Producer1
echo "Registrando Producer1..."
cast send $CONTRACT "requestUserRole(string)" "Producer" \
  --private-key $PRODUCER1_KEY \
  --rpc-url $ANVIL_RPC \
  --legacy > /dev/null
echo "✅ Producer1 registrado"

# Factory1
echo "Registrando Factory1..."
cast send $CONTRACT "requestUserRole(string)" "Factory" \
  --private-key $FACTORY1_KEY \
  --rpc-url $ANVIL_RPC \
  --legacy > /dev/null
echo "✅ Factory1 registrado"

# Retailer
echo "Registrando Retailer..."
cast send $CONTRACT "requestUserRole(string)" "Retailer" \
  --private-key $RETAILER_KEY \
  --rpc-url $ANVIL_RPC \
  --legacy > /dev/null
echo "✅ Retailer registrado"

# Consumer1
echo "Registrando Consumer1..."
cast send $CONTRACT "requestUserRole(string)" "Consumer" \
  --private-key $CONSUMER1_KEY \
  --rpc-url $ANVIL_RPC \
  --legacy > /dev/null
echo "✅ Consumer1 registrado"

# Producer2
echo "Registrando Producer2..."
cast send $CONTRACT "requestUserRole(string)" "Producer" \
  --private-key $PRODUCER2_KEY \
  --rpc-url $ANVIL_RPC \
  --legacy > /dev/null
echo "✅ Producer2 registrado"

# Factory2
echo "Registrando Factory2..."
cast send $CONTRACT "requestUserRole(string)" "Factory" \
  --private-key $FACTORY2_KEY \
  --rpc-url $ANVIL_RPC \
  --legacy > /dev/null
echo "✅ Factory2 registrado"

# Producer3
echo "Registrando Producer3..."
cast send $CONTRACT "requestUserRole(string)" "Producer" \
  --private-key $PRODUCER3_KEY \
  --rpc-url $ANVIL_RPC \
  --legacy > /dev/null
echo "✅ Producer3 registrado"

echo ""

# 4. Aprobar usuarios
echo "=========================================="
echo "APROBANDO USUARIOS"
echo "=========================================="

cast send $CONTRACT "changeStatusUser(address,uint8)" $PRODUCER1_ADDR 1 \
  --private-key $ADMIN_KEY --rpc-url $ANVIL_RPC --legacy > /dev/null
echo "✅ Producer1 aprobado"

cast send $CONTRACT "changeStatusUser(address,uint8)" $FACTORY1_ADDR 1 \
  --private-key $ADMIN_KEY --rpc-url $ANVIL_RPC --legacy > /dev/null
echo "✅ Factory1 aprobado"

cast send $CONTRACT "changeStatusUser(address,uint8)" $RETAILER_ADDR 1 \
  --private-key $ADMIN_KEY --rpc-url $ANVIL_RPC --legacy > /dev/null
echo "✅ Retailer aprobado"

cast send $CONTRACT "changeStatusUser(address,uint8)" $CONSUMER1_ADDR 1 \
  --private-key $ADMIN_KEY --rpc-url $ANVIL_RPC --legacy > /dev/null
echo "✅ Consumer1 aprobado"

cast send $CONTRACT "changeStatusUser(address,uint8)" $PRODUCER2_ADDR 1 \
  --private-key $ADMIN_KEY --rpc-url $ANVIL_RPC --legacy > /dev/null
echo "✅ Producer2 aprobado"

cast send $CONTRACT "changeStatusUser(address,uint8)" $FACTORY2_ADDR 1 \
  --private-key $ADMIN_KEY --rpc-url $ANVIL_RPC --legacy > /dev/null
echo "✅ Factory2 aprobado"

cast send $CONTRACT "changeStatusUser(address,uint8)" $PRODUCER3_ADDR 1 \
  --private-key $ADMIN_KEY --rpc-url $ANVIL_RPC --legacy > /dev/null
echo "✅ Producer3 aprobado"

echo ""

# 5. Crear tokens
echo "=========================================="
echo "CREANDO TOKENS DE PRUEBA"
echo "=========================================="

# Token 1: Tomates (Producer1)
echo "Creando Token 1: Tomates..."
cast send $CONTRACT \
  'createToken(string,uint256,string,uint256[],uint256[])' \
  "LOTE-TOMATES-1000KG-AAAA0001" \
  1000 \
  '{ "identificador_lote": "LOTE-HOMOGENEO-1000KG-001", "peso_total_kg": 1000, "fecha_cosecha_estimada": "2025-10-25", "nombre_variedad_predominante": "Tomate Redondo Liso (Tipo Ensalada)", "caracteristicas_generales": { "color": "Rojo brillante y uniforme", "forma": "Esferica (redonda)", "descripcion": "Lote de tomate fresco de maduracion completa, ideal para consumo en crudo. Piel fina y pulpa jugosa.", "sabor_perfil": "Fresco, jugoso, con un equilibrio entre dulzor y ligera acidez.", "uso_culinario_principal": "Ensaladas, sandwiches y guarniciones.", "peso_promedio_unidad_g": 160, "firmeza": "Alta (para buena conservacion)", "diametro_promedio_cm": 7.5 }, "informacion_nutricional_por_100g": { "energia_kcal": 18, "agua_g": 94, "vitamina_C_mg": 13, "licopeno": "Alto contenido" }, "certificacion": "Producto de Categoria I" }' \
  "[]" \
  "[]" \
  --private-key $PRODUCER1_KEY \
  --rpc-url $ANVIL_RPC \
  --legacy > /dev/null
echo "✅ Token 1: TOMATES (1000kg) - Producer1"

# Token 2: Calabacines (Producer1)
echo "Creando Token 2: Calabacines..."
cast send $CONTRACT \
  'createToken(string,uint256,string,uint256[],uint256[])' \
  "LOTE-CALABACINES-1000KG-AAAA0002" \
  1000 \
  '{ "identificador_lote": "CBZ-MIL-KG-001", "peso_total_kg": 1000, "fecha_cosecha_estimada": "2025-10-25", "origen_geografico": "Huerta (Simulada)", "nombre_variedad_predominante": "Calabacin Verde Claro (Zucchini)", "caracteristicas_generales": { "color": "Verde claro a medio, uniforme", "forma": "Cilindrica, ligeramente abultada en el centro", "descripcion": "Calabacin de piel tierna y brillante. Pulpa firme, blanca y alta en contenido de agua.", "sabor_perfil": "Suave, ligeramente dulce y neutro.", "uso_culinario_principal": "Salteados, cremas, rellenos, coccion a la plancha.", "peso_promedio_unidad_g": 300, "longitud_promedio_cm": 20, "firmeza": "Alta" }, "informacion_nutricional_por_100g": { "energia_kcal": 17, "agua_g": 95, "fibra_g": 1.1, "potasio_mg": 261, "vitamina_C_mg": 17 }, "certificacion": "Producto de Categoria I" }' \
  "[]" \
  "[]" \
  --private-key $PRODUCER1_KEY \
  --rpc-url $ANVIL_RPC \
  --legacy > /dev/null
echo "✅ Token 2: CALABACINES (1000kg) - Producer1"

# Token 3: Cebollas (Producer2)
echo "Creando Token 3: Cebollas..."
cast send $CONTRACT \
  'createToken(string,uint256,string,uint256[],uint256[])' \
  "LOTE-CEBOLLAS-1000KG-AAAA0003" \
  1000 \
  '{ "lote_cebollas": { "identificador_lote": "CBL-MIL-KG-002", "peso_total_kg": 1000, "fecha_cosecha_estimada": "2025-10-20", "origen_geografico": "Almacen (Simulado)", "nombre_variedad_predominante": "Cebolla Amarilla (Clasica)", "caracteristicas_generales": { "color": "Piel exterior dorada/amarilla, carne blanca", "forma": "Bulbo esferico u ovalado", "descripcion": "Cebolla con alto contenido de solidos, lo que la hace ideal para cocinar. Buen almacenamiento.", "sabor_perfil": "Intenso, picante y fuerte cuando esta cruda, se vuelve dulce al cocinar.", "uso_culinario_principal": "Sofritos, guisos, caramelizado, coccion en general.", "peso_promedio_unidad_g": 180, "diametro_promedio_cm": 8, "dureza": "Muy alta" }, "informacion_nutricional_por_100g": { "energia_kcal": 40, "carbohidratos_g": 9.3, "azucares_g": 4.2, "fibra_g": 1.7, "vitamina_C_mg": 7.4 }, "certificacion": "Producto de Categoria I" } }' \
  "[]" \
  "[]" \
  --private-key $PRODUCER2_KEY \
  --rpc-url $ANVIL_RPC \
  --legacy > /dev/null
echo "✅ Token 3: CEBOLLAS (1000kg) - Producer2"

echo ""

# 6. Actualizar ABI y Bytecode
echo "=========================================="
echo "ACTUALIZANDO FRONTEND"
echo "=========================================="
cd ..
python3 << 'EOF'
import json

with open('sc/out/SupplyChain.sol/SupplyChain.json', 'r') as f:
    data = json.load(f)

with open('web/public/contracts/SupplyChain.abi.json', 'w') as f:
    json.dump(data['abi'], f, indent=2)

bytecode = data['bytecode']['object']
with open('web/public/contracts/SupplyChain.bytecode.json', 'w') as f:
    json.dump({"bytecode": bytecode}, f)

print("✅ ABI actualizado")
print("✅ Bytecode actualizado")
EOF

echo ""
echo "=========================================="
echo "SETUP COMPLETADO"
echo "=========================================="
echo "Contrato: $CONTRACT"
echo "Usuarios registrados y aprobados: 7"
echo "Tokens creados: 3"
echo ""
echo "USUARIOS APROBADOS:"
echo "  Admin:     $ADMIN_ADDR"
echo "  Producer1: $PRODUCER1_ADDR"
echo "  Factory1:  $FACTORY1_ADDR"
echo "  Factory2:  $FACTORY2_ADDR"
echo "  Retailer:  $RETAILER_ADDR"
echo "  Consumer1: $CONSUMER1_ADDR"
echo "  Producer2: $PRODUCER2_ADDR"
echo "  Producer3: $PRODUCER3_ADDR"
echo ""
echo "TOKENS DISPONIBLES:"
echo "  [1] Tomates 1000kg (Producer1)"
echo "  [2] Calabacines 1000kg (Producer1)"
echo "  [3] Cebollas 1000kg (Producer2)"
echo ""
echo "⚠️  IMPORTANTE:"
echo "  1. Limpia localStorage del navegador:"
echo "     F12 → Application → Local Storage → Clear"
echo "  2. Recarga la DApp: http://localhost:3000"
echo "  3. Conecta MetaMask"
echo ""
echo "✅ Sistema listo para usar!"
echo "=========================================="


