// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/SupplyChain.sol";

/**
 * @title DeployAndSetup
 * @dev Script para desplegar el contrato y registrar usuarios de prueba
 * 
 * USO:
 * forge script script/DeployAndSetup.s.sol:DeployAndSetup --rpc-url http://127.0.0.1:8545 --broadcast
 * 
 * Este script:
 * 1. Despliega el contrato SupplyChain
 * 2. Registra 8 usuarios con diferentes roles
 * 3. Aprueba automáticamente a todos los usuarios
 * 
 * USUARIOS REGISTRADOS:
 * - Admin (deployer): 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
 * - Producer1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
 * - Factory1: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
 * - Retailer: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
 * - Consumer1: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
 * - Producer2: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
 * - Factory2: 0x976EA74026E726554dB657fA54763abd0C3a0aa9
 * - Producer3: 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955
 */
contract DeployAndSetup is Script {
    // Direcciones de cuentas de Anvil
    address constant ADMIN = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    address constant PRODUCER1 = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    address constant FACTORY1 = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
    address constant RETAILER = 0x90F79bf6EB2c4f870365E785982E1f101E93b906;
    address constant CONSUMER1 = 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65;
    address constant PRODUCER2 = 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc;
    address constant FACTORY2 = 0x976EA74026E726554dB657fA54763abd0C3a0aa9;
    address constant PRODUCER3 = 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955;

    SupplyChain public tracker;

    function run() external {
        // El admin (cuenta 0) despliega el contrato
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        
        console.log("==============================================");
        console.log("DESPLEGANDO CONTRATO SUPPLYCHAIN");
        console.log("==============================================");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Desplegar contrato
        tracker = new SupplyChain();
        console.log("Contrato desplegado en:", address(tracker));
        console.log("Admin (owner):", tracker.owner());
        console.log("");
        
        vm.stopBroadcast();
        
        // 2. Registrar usuarios
        console.log("==============================================");
        console.log("REGISTRANDO USUARIOS");
        console.log("==============================================");
        
        registerUser(
            0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d,
            PRODUCER1,
            "Producer"
        );
        
        registerUser(
            0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a,
            FACTORY1,
            "Factory"
        );
        
        registerUser(
            0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6,
            RETAILER,
            "Retailer"
        );
        
        registerUser(
            0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a,
            CONSUMER1,
            "Consumer"
        );
        
        registerUser(
            0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba,
            PRODUCER2,
            "Producer"
        );
        
        registerUser(
            0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e,
            FACTORY2,
            "Factory"
        );
        
        registerUser(
            0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356,
            PRODUCER3,
            "Producer"
        );
        
        console.log("");
        
        // 3. Aprobar todos los usuarios
        console.log("==============================================");
        console.log("APROBANDO USUARIOS");
        console.log("==============================================");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Aprobar Producer1
        tracker.changeStatusUser(PRODUCER1, SupplyChain.UserStatus.Approved);
        console.log("Producer1 aprobado:", PRODUCER1);
        
        // Aprobar Factory1
        tracker.changeStatusUser(FACTORY1, SupplyChain.UserStatus.Approved);
        console.log("Factory1 aprobado:", FACTORY1);
        
        // Aprobar Retailer
        tracker.changeStatusUser(RETAILER, SupplyChain.UserStatus.Approved);
        console.log("Retailer aprobado:", RETAILER);
        
        // Aprobar Consumer1
        tracker.changeStatusUser(CONSUMER1, SupplyChain.UserStatus.Approved);
        console.log("Consumer1 aprobado:", CONSUMER1);
        
        // Aprobar Producer2
        tracker.changeStatusUser(PRODUCER2, SupplyChain.UserStatus.Approved);
        console.log("Producer2 aprobado:", PRODUCER2);
        
        // Aprobar Factory2
        tracker.changeStatusUser(FACTORY2, SupplyChain.UserStatus.Approved);
        console.log("Factory2 aprobado:", FACTORY2);
        
        // Aprobar Producer3
        tracker.changeStatusUser(PRODUCER3, SupplyChain.UserStatus.Approved);
        console.log("Producer3 aprobado:", PRODUCER3);
        
        vm.stopBroadcast();
        
        console.log("");
        console.log("==============================================");
        console.log("CREANDO TOKENS DE PRUEBA");
        console.log("==============================================");
        
        // Arrays vacíos para materias primas (sin padres)
        uint256[] memory emptyParentIds = new uint256[](0);
        uint256[] memory emptyParentAmounts = new uint256[](0);
        
        // Token 1: Tomates (Producer1)
        vm.startBroadcast(0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d);
        tracker.createToken(
            "LOTE-TOMATES-1000KG-AAAA0001",
            1000,
            '{ "identificador_lote": "LOTE-HOMOGENEO-1000KG-001", "peso_total_kg": 1000, "fecha_cosecha_estimada": "2025-10-25", "nombre_variedad_predominante": "Tomate Redondo Liso (Tipo Ensalada)", "caracteristicas_generales": { "color": "Rojo brillante y uniforme", "forma": "Esferica (redonda)", "descripcion": "Lote de tomate fresco de maduracion completa, ideal para consumo en crudo. Piel fina y pulpa jugosa.", "sabor_perfil": "Fresco, jugoso, con un equilibrio entre dulzor y ligera acidez.", "uso_culinario_principal": "Ensaladas, sandwiches y guarniciones.", "peso_promedio_unidad_g": 160, "firmeza": "Alta (para buena conservacion)", "diametro_promedio_cm": 7.5 }, "informacion_nutricional_por_100g": { "energia_kcal": 18, "agua_g": 94, "vitamina_C_mg": 13, "licopeno": "Alto contenido" }, "certificacion": "Producto de Categoria I" }',
            emptyParentIds,
            emptyParentAmounts
        );
        console.log("Token 1 creado: LOTE-TOMATES-1000KG-AAAA0001 (Producer1)");
        console.log("  ID: 1");
        console.log("  Balance: 1000 kg");
        
        // Token 2: Calabacines (Producer1)
        tracker.createToken(
            "LOTE-CALABACINES-1000KG-AAAA0002",
            1000,
            '{ "identificador_lote": "CBZ-MIL-KG-001", "peso_total_kg": 1000, "fecha_cosecha_estimada": "2025-10-25", "origen_geografico": "Huerta (Simulada)", "nombre_variedad_predominante": "Calabacin Verde Claro (Zucchini)", "caracteristicas_generales": { "color": "Verde claro a medio, uniforme", "forma": "Cilindrica, ligeramente abultada en el centro", "descripcion": "Calabacin de piel tierna y brillante. Pulpa firme, blanca y alta en contenido de agua.", "sabor_perfil": "Suave, ligeramente dulce y neutro.", "uso_culinario_principal": "Salteados, cremas, rellenos, coccion a la plancha.", "peso_promedio_unidad_g": 300, "longitud_promedio_cm": 20, "firmeza": "Alta" }, "informacion_nutricional_por_100g": { "energia_kcal": 17, "agua_g": 95, "fibra_g": 1.1, "potasio_mg": 261, "vitamina_C_mg": 17 }, "certificacion": "Producto de Categoria I" }',
            emptyParentIds,
            emptyParentAmounts
        );
        console.log("Token 2 creado: LOTE-CALABACINES-1000KG-AAAA0002 (Producer1)");
        console.log("  ID: 2");
        console.log("  Balance: 1000 kg");
        vm.stopBroadcast();
        
        // Token 3: Cebollas (Producer2)
        vm.startBroadcast(0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba);
        tracker.createToken(
            "LOTE-CEBOLLAS-1000KG-AAAA0003",
            1000,
            '{ "lote_cebollas": { "identificador_lote": "CBL-MIL-KG-002", "peso_total_kg": 1000, "fecha_cosecha_estimada": "2025-10-20", "origen_geografico": "Almacen (Simulado)", "nombre_variedad_predominante": "Cebolla Amarilla (Clasica)", "caracteristicas_generales": { "color": "Piel exterior dorada/amarilla, carne blanca", "forma": "Bulbo esferico u ovalado", "descripcion": "Cebolla con alto contenido de solidos, lo que la hace ideal para cocinar. Buen almacenamiento.", "sabor_perfil": "Intenso, picante y fuerte cuando esta cruda, se vuelve dulce al cocinar.", "uso_culinario_principal": "Sofritos, guisos, caramelizado, coccion en general.", "peso_promedio_unidad_g": 180, "diametro_promedio_cm": 8, "dureza": "Muy alta" }, "informacion_nutricional_por_100g": { "energia_kcal": 40, "carbohidratos_g": 9.3, "azucares_g": 4.2, "fibra_g": 1.7, "vitamina_C_mg": 7.4 }, "certificacion": "Producto de Categoria I" } }',
            emptyParentIds,
            emptyParentAmounts
        );
        console.log("Token 3 creado: LOTE-CEBOLLAS-1000KG-AAAA0003 (Producer2)");
        console.log("  ID: 3");
        console.log("  Balance: 1000 kg");
        vm.stopBroadcast();
        
        console.log("");
        console.log("==============================================");
        console.log("SETUP COMPLETADO");
        console.log("==============================================");
        console.log("Contrato:", address(tracker));
        console.log("Usuarios registrados y aprobados: 7");
        console.log("Tokens creados: 3");
        console.log("Admin: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
        console.log("");
        console.log("TOKENS DISPONIBLES:");
        console.log("  [1] Tomates 1000kg (Producer1)");
        console.log("  [2] Calabacines 1000kg (Producer1)");
        console.log("  [3] Cebollas 1000kg (Producer2)");
        console.log("");
        console.log("FLUJOS DE TRANSFERENCIA PERMITIDOS:");
        console.log("  - Producer -> Producer (redistribucion)");
        console.log("  - Producer -> Factory (suministro)");
        console.log("  - Factory -> Factory (componentes)");
        console.log("  - Factory -> Retailer (productos terminados)");
        console.log("  - Retailer -> Retailer (redistribucion)");
        console.log("  - Retailer -> Consumer (venta final)");
        console.log("==============================================");
    }
    
    function registerUser(uint256 privateKey, address userAddress, string memory role) internal {
        vm.startBroadcast(privateKey);
        tracker.requestUserRole(role);
        console.log("Usuario registrado:");
        console.log("  Direccion:", userAddress);
        console.log("  Rol:", role);
        console.log("  Estado: Pending");
        vm.stopBroadcast();
    }
}

