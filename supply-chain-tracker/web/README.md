# Supply Chain Tracker - Frontend DApp

Frontend Web3 para el sistema de trazabilidad blockchain basado en ERC-1155.

## 🚀 Stack Tecnológico

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Ethers.js v6** - Interacción con blockchain
- **Tailwind CSS** - Estilos
- **Shadcn UI** - Componentes UI
- **MetaMask** - Wallet Web3

## 📋 Prerrequisitos

1. **Node.js 18+** instalado
2. **Anvil** corriendo en `http://localhost:8545`
3. **MetaMask** instalado en el navegador
4. **Contrato compilado** en `../sc/out/`

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🔧 Configuración de MetaMask

### Agregar Red Anvil

1. Abrir MetaMask
2. Ir a Configuración → Redes → Agregar red
3. Configurar:
   - **Nombre de la red**: Anvil Local
   - **URL RPC**: `http://127.0.0.1:8545`
   - **ID de cadena**: `31337`
   - **Símbolo de moneda**: `ETH`

### Importar Cuenta de Prueba

Para desarrollo, puedes importar una de las cuentas de Anvil:

**Cuenta Admin (Account #0)**:
```
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

## 📱 Flujo de Uso

### Primera Vez (Deploy del Contrato)

1. Conectar MetaMask
2. La DApp detectará que no hay contrato desplegado
3. Click en "Desplegar Contrato"
4. Confirmar transacción en MetaMask
5. ¡El usuario que despliega se convierte en Admin!

### Usuario Nuevo

1. Conectar MetaMask con una cuenta diferente
2. Seleccionar rol (Producer, Factory, Retailer, Consumer)
3. Enviar solicitud
4. Esperar aprobación del Admin

### Administrador

1. Ir a `/admin`
2. Ver lista de usuarios pendientes
3. Aprobar/Rechazar usuarios
4. Gestionar estados de usuarios

## 🏗️ Estructura de Archivos

```
web/
├── src/
│   ├── app/                    # Páginas (App Router)
│   │   ├── layout.tsx         # Layout principal
│   │   ├── page.tsx           # Página principal (login)
│   │   ├── dashboard/         # Dashboard
│   │   ├── tokens/            # Gestión de tokens
│   │   ├── transfers/         # Transferencias
│   │   └── admin/             # Panel admin
│   ├── components/            # Componentes React
│   │   ├── ui/                # Componentes UI base
│   │   └── Header.tsx         # Header de navegación
│   ├── contexts/              # React Contexts
│   │   └── Web3Context.tsx    # Estado global Web3
│   ├── hooks/                 # Custom hooks
│   │   └── useContract.ts     # Hook del contrato
│   ├── lib/                   # Librerías
│   │   ├── web3.ts            # Servicio Web3
│   │   └── utils.ts           # Utilidades
│   ├── contracts/             # Configuración del contrato
│   │   ├── SupplyChain.abi.json
│   │   └── config.ts
│   └── types/                 # Tipos TypeScript
│       └── index.ts
├── public/
│   └── contracts/             # Bytecode del contrato
│       └── SupplyChain.bytecode.json
└── package.json
```

## 🔑 Funcionalidades Implementadas

### ✅ Autenticación Web3
- Conexión con MetaMask
- Persistencia en localStorage
- Reconexión automática
- Detección de cambios de cuenta

### ✅ Deploy Automático
- Deploy del contrato desde la DApp
- Primer usuario = Admin automático
- Almacenamiento de dirección del contrato

### ✅ Gestión de Usuarios
- Solicitud de rol
- Sistema de estados (Pending, Approved, Rejected, Canceled)
- Solo Admin puede cambiar estados

### ⏳ En Desarrollo
- Panel de administración completo
- Gestión de tokens
- Sistema de transferencias
- Dashboard personalizado

## 🐛 Troubleshooting

### MetaMask no detectado
- Asegúrate de tener MetaMask instalado
- Recarga la página

### Wrong network
- Verifica que estés en la red Anvil (Chain ID: 31337)
- La DApp cambiará automáticamente

### Contrato no encontrado
- Verifica que Anvil esté corriendo
- Compila el contrato: `cd ../sc && forge build`

### Transaction reverted
- Verifica que tu usuario esté Approved
- Verifica que tengas suficiente ETH

## 📝 Próximos Pasos

1. Implementar panel de administración completo
2. Crear páginas de gestión de tokens
3. Implementar sistema de transferencias
4. Dashboard con estadísticas
5. Tests E2E

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📄 Licencia

MIT


