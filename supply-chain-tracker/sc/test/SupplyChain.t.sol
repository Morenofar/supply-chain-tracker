// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/SupplyChain.sol";

contract SupplyChainTest is Test {
    SupplyChain public tracker;
    
    // Direcciones de prueba
    address public admin = address(0x1);
    address public producer = address(0x2);
    address public factory = address(0x3);
    address public retailer = address(0x4);
    address public consumer = address(0x5);
    address public unauthorized = address(0x6);
    
    // Arrays vacíos reutilizables para optimización de gas
    uint256[] private emptyArray;
    uint256[] private emptyAmounts;
    
    function setUp() public {
        vm.prank(admin);
        tracker = new SupplyChain();
    }
    
    // ============ TESTS DE DEPLOYMENT ============
    
    function testDeployment() public {
        assertEq(tracker.admin(), admin);
        assertTrue(tracker.isAdmin(admin));
        assertFalse(tracker.isAdmin(producer));
    }
    
    // ============ TESTS DE GESTIÓN DE USUARIOS ============
    
    function testRequestUserRole() public {
        vm.prank(producer);
        tracker.requestUserRole("Producer");
        
        SupplyChain.User memory user = tracker.getUserInfo(producer);
        assertEq(user.userAddress, producer);
        assertEq(user.role, "Producer");
        assertTrue(uint(user.status) == uint(SupplyChain.UserStatus.Pending));
        assertTrue(user.exists);
    }
    
    function testRequestUserRoleInvalidRole() public {
        vm.prank(producer);
        vm.expectRevert(SupplyChain.InvalidRole.selector);
        tracker.requestUserRole("InvalidRole");
    }
    
    function testRequestUserRoleAlreadyRegistered() public {
        vm.startPrank(producer);
        tracker.requestUserRole("Producer");
        vm.expectRevert(SupplyChain.UserAlreadyRegistered.selector);
        tracker.requestUserRole("Factory");
        vm.stopPrank();
    }
    
    function testChangeStatusUser() public {
        // Registrar usuario
        vm.prank(producer);
        tracker.requestUserRole("Producer");
        
        // Admin cambia status
        vm.prank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        
        SupplyChain.User memory user = tracker.getUserInfo(producer);
        assertTrue(uint(user.status) == uint(SupplyChain.UserStatus.Approved));
    }
    
    function testChangeStatusUserOnlyAdmin() public {
        vm.prank(producer);
        tracker.requestUserRole("Producer");
        
        vm.prank(producer);
        vm.expectRevert(SupplyChain.UnauthorizedAdmin.selector);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
    }
    
    function testCanceledUserCanReapply() public {
        // Registrar producer
        vm.prank(producer);
        tracker.requestUserRole("Producer");
        
        // Admin cancela al usuario
        vm.prank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Canceled);
        
        // Verificar que está cancelado
        SupplyChain.User memory userCanceled = tracker.getUserInfo(producer);
        assertTrue(uint(userCanceled.status) == uint(SupplyChain.UserStatus.Canceled));
        assertEq(userCanceled.role, "Producer");
        
        // Usuario cancelado puede volver a solicitar acceso (mismo rol)
        vm.prank(producer);
        tracker.requestUserRole("Producer");
        
        // Verificar que ahora está Pending
        SupplyChain.User memory userPending = tracker.getUserInfo(producer);
        assertTrue(uint(userPending.status) == uint(SupplyChain.UserStatus.Pending));
        assertEq(userPending.role, "Producer");
        
        // Mismo ID de usuario (no se crea uno nuevo)
        assertEq(userPending.id, userCanceled.id);
    }
    
    function testCanceledUserCanChangeRole() public {
        // Registrar producer
        vm.prank(producer);
        tracker.requestUserRole("Producer");
        
        // Admin cancela al usuario
        vm.prank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Canceled);
        
        // Usuario cancelado puede solicitar acceso con DIFERENTE rol
        vm.prank(producer);
        tracker.requestUserRole("Factory");
        
        // Verificar que cambió de rol y está Pending
        SupplyChain.User memory user = tracker.getUserInfo(producer);
        assertTrue(uint(user.status) == uint(SupplyChain.UserStatus.Pending));
        assertEq(user.role, "Factory");  // Cambió de Producer a Factory
    }
    
    function testApprovedUserCannotReapply() public {
        // Registrar y aprobar producer
        vm.prank(producer);
        tracker.requestUserRole("Producer");
        
        vm.prank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        
        // Usuario aprobado NO puede volver a solicitar
        vm.prank(producer);
        vm.expectRevert(SupplyChain.UserAlreadyRegistered.selector);
        tracker.requestUserRole("Factory");
    }
    
    function testRejectedUserCannotReapply() public {
        // Registrar usuario
        vm.prank(producer);
        tracker.requestUserRole("Producer");
        
        // Admin rechaza al usuario
        vm.prank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Rejected);
        
        // Usuario rechazado NO puede volver a solicitar
        vm.prank(producer);
        vm.expectRevert(SupplyChain.UserAlreadyRegistered.selector);
        tracker.requestUserRole("Producer");
    }
    
    function testPendingUserCannotReapply() public {
        // Registrar usuario
        vm.prank(producer);
        tracker.requestUserRole("Producer");
        
        // Usuario pendiente NO puede volver a solicitar
        vm.prank(producer);
        vm.expectRevert(SupplyChain.UserAlreadyRegistered.selector);
        tracker.requestUserRole("Factory");
    }
    
    // ============ TESTS DE CREACIÓN DE TOKENS ============
    
    function testCreateTokenMateriaPrima() public {
        // Registrar y aprobar producer
        vm.startPrank(producer);
        tracker.requestUserRole("Producer");
        vm.stopPrank();
        
        vm.prank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        
        // Crear materia prima
        vm.prank(producer);
        tracker.createToken("Tomates", 1000, "{\"tipo\":\"vegetal\",\"calidad\":\"A\"}", emptyArray, emptyAmounts);
        
        SupplyChain.Token memory token = tracker.getToken(1);
        assertEq(token.name, "Tomates");
        assertEq(token.totalSupply, 1000);
        assertEq(token.creator, producer);
        assertEq(token.parentIds.length, 0);
        assertTrue(token.exists);
        
        assertEq(tracker.balanceOf(producer, 1), 1000);
    }
    
    function testCreateTokenOnlyProducer() public {
        // Registrar y aprobar factory
        vm.startPrank(factory);
        tracker.requestUserRole("Factory");
        vm.stopPrank();
        
        vm.prank(admin);
        tracker.changeStatusUser(factory, SupplyChain.UserStatus.Approved);
        
        // Factory no puede crear materia prima
        vm.prank(factory);
        vm.expectRevert(SupplyChain.OnlyProducerCanCreateRawMaterials.selector);
        tracker.createToken("Tomates", 1000, "{}", emptyArray, emptyAmounts);
    }
    
    function testCreateTokenManufacturado() public {
        // Registrar y aprobar producer
        vm.startPrank(producer);
        tracker.requestUserRole("Producer");
        vm.stopPrank();
        
        vm.prank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        
        // Crear materia prima
        vm.prank(producer);
        tracker.createToken("Tomates", 1000, "{}", emptyArray, emptyAmounts);
        
        // Registrar y aprobar factory
        vm.startPrank(factory);
        tracker.requestUserRole("Factory");
        vm.stopPrank();
        
        vm.prank(admin);
        tracker.changeStatusUser(factory, SupplyChain.UserStatus.Approved);
        
        // Transferir tomates a factory
        vm.prank(producer);
        tracker.transfer(factory, 1, 500);
        
        vm.prank(factory);
        tracker.acceptTransfer(1);
        
        // Factory crea producto manufacturado
        uint256[] memory parentIds = new uint256[](1);
        uint256[] memory parentAmounts = new uint256[](1);
        parentIds[0] = 1;
        parentAmounts[0] = 500;
        
        vm.prank(factory);
        tracker.createToken("Salsa de Tomate", 100, "{}", parentIds, parentAmounts);
        
        SupplyChain.Token memory token = tracker.getToken(2);
        assertEq(token.name, "Salsa de Tomate");
        assertEq(token.parentIds.length, 1);
        assertEq(token.parentIds[0], 1);
        assertEq(token.parentAmounts[0], 500);
        
        // Verificar que se quemaron los tomates
        assertEq(tracker.balanceOf(factory, 1), 0);
        assertEq(tracker.balanceOf(factory, 2), 100);
    }
    
    function testCreateTokenInsufficientBalance() public {
        // Registrar y aprobar producer
        vm.startPrank(producer);
        tracker.requestUserRole("Producer");
        vm.stopPrank();
        
        vm.prank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        
        // Crear materia prima
        vm.prank(producer);
        tracker.createToken("Tomates", 1000, "{}", emptyArray, emptyAmounts);
        
        // Registrar y aprobar factory
        vm.startPrank(factory);
        tracker.requestUserRole("Factory");
        vm.stopPrank();
        
        vm.prank(admin);
        tracker.changeStatusUser(factory, SupplyChain.UserStatus.Approved);
        
        // Factory intenta crear producto sin tener los tokens padre
        uint256[] memory parentIds = new uint256[](1);
        uint256[] memory parentAmounts = new uint256[](1);
        parentIds[0] = 1;
        parentAmounts[0] = 500;
        
        vm.prank(factory);
        vm.expectRevert(SupplyChain.InsufficientParentBalance.selector);
        tracker.createToken("Salsa de Tomate", 100, "{}", parentIds, parentAmounts);
    }
    
    // ============ TESTS DE TRANSFERENCIAS ============
    
    function testTransferFlow() public {
        // Registrar y aprobar todos los usuarios
        vm.startPrank(producer);
        tracker.requestUserRole("Producer");
        vm.stopPrank();
        
        vm.startPrank(factory);
        tracker.requestUserRole("Factory");
        vm.stopPrank();
        
        vm.startPrank(retailer);
        tracker.requestUserRole("Retailer");
        vm.stopPrank();
        
        vm.startPrank(consumer);
        tracker.requestUserRole("Consumer");
        vm.stopPrank();
        
        vm.startPrank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        tracker.changeStatusUser(factory, SupplyChain.UserStatus.Approved);
        tracker.changeStatusUser(retailer, SupplyChain.UserStatus.Approved);
        tracker.changeStatusUser(consumer, SupplyChain.UserStatus.Approved);
        vm.stopPrank();
        
        // Crear materia prima
        vm.prank(producer);
        tracker.createToken("Tomates", 1000, "{}", emptyArray, emptyAmounts);
        
        // Producer -> Factory
        vm.prank(producer);
        tracker.transfer(factory, 1, 500);
        
        SupplyChain.Transfer memory transfer = tracker.getTransfer(1);
        assertEq(transfer.from, producer);
        assertEq(transfer.to, factory);
        assertEq(transfer.tokenId, 1);
        assertEq(transfer.amount, 500);
        assertTrue(uint(transfer.status) == uint(SupplyChain.TransferStatus.Pending));
        
        // Factory acepta
        vm.prank(factory);
        tracker.acceptTransfer(1);
        
        transfer = tracker.getTransfer(1);
        assertTrue(uint(transfer.status) == uint(SupplyChain.TransferStatus.Accepted));
        assertEq(tracker.balanceOf(factory, 1), 500);
        assertEq(tracker.balanceOf(producer, 1), 500);
        
        // Factory crea producto manufacturado
        uint256[] memory parentIds = new uint256[](1);
        uint256[] memory parentAmounts = new uint256[](1);
        parentIds[0] = 1;
        parentAmounts[0] = 500;
        
        vm.prank(factory);
        tracker.createToken("Salsa de Tomate", 100, "{}", parentIds, parentAmounts);
        
        // Factory -> Retailer
        vm.prank(factory);
        tracker.transfer(retailer, 2, 50);
        
        vm.prank(retailer);
        tracker.acceptTransfer(2);
        
        // Retailer -> Consumer
        vm.prank(retailer);
        tracker.transfer(consumer, 2, 25);
        
        vm.prank(consumer);
        tracker.acceptTransfer(3);
        
        assertEq(tracker.balanceOf(consumer, 2), 25);
    }
    
    function testTransferInvalidFlow() public {
        // Registrar y aprobar usuarios
        vm.startPrank(producer);
        tracker.requestUserRole("Producer");
        vm.stopPrank();
        
        vm.startPrank(consumer);
        tracker.requestUserRole("Consumer");
        vm.stopPrank();
        
        vm.startPrank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        tracker.changeStatusUser(consumer, SupplyChain.UserStatus.Approved);
        vm.stopPrank();
        
        // Crear materia prima
        vm.prank(producer);
        tracker.createToken("Tomates", 1000, "{}", emptyArray, emptyAmounts);
        
        // Producer no puede enviar directamente a Consumer
        vm.prank(producer);
        vm.expectRevert(SupplyChain.InvalidTransferFlow.selector);
        tracker.transfer(consumer, 1, 500);
    }
    
    function testTransferReject() public {
        // Registrar y aprobar usuarios
        vm.startPrank(producer);
        tracker.requestUserRole("Producer");
        vm.stopPrank();
        
        vm.startPrank(factory);
        tracker.requestUserRole("Factory");
        vm.stopPrank();
        
        vm.startPrank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        tracker.changeStatusUser(factory, SupplyChain.UserStatus.Approved);
        vm.stopPrank();
        
        // Crear materia prima
        vm.prank(producer);
        tracker.createToken("Tomates", 1000, "{}", emptyArray, emptyAmounts);
        
        // Producer envía a Factory
        vm.prank(producer);
        tracker.transfer(factory, 1, 500);
        
        // Factory rechaza
        vm.prank(factory);
        tracker.rejectTransfer(1);
        
        SupplyChain.Transfer memory transfer = tracker.getTransfer(1);
        assertTrue(uint(transfer.status) == uint(SupplyChain.TransferStatus.Rejected));
        
        // Balance no cambió
        assertEq(tracker.balanceOf(producer, 1), 1000);
        assertEq(tracker.balanceOf(factory, 1), 0);
    }
    
    function testTransferCancel() public {
        // Registrar y aprobar usuarios
        vm.startPrank(producer);
        tracker.requestUserRole("Producer");
        vm.stopPrank();
        
        vm.startPrank(factory);
        tracker.requestUserRole("Factory");
        vm.stopPrank();
        
        vm.startPrank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        tracker.changeStatusUser(factory, SupplyChain.UserStatus.Approved);
        vm.stopPrank();
        
        // Crear materia prima
        vm.prank(producer);
        tracker.createToken("Tomates", 1000, "{}", emptyArray, emptyAmounts);
        
        // Producer envía a Factory
        vm.prank(producer);
        tracker.transfer(factory, 1, 500);
        
        // Producer cancela
        vm.prank(producer);
        tracker.cancelTransfer(1);
        
        SupplyChain.Transfer memory transfer = tracker.getTransfer(1);
        assertTrue(uint(transfer.status) == uint(SupplyChain.TransferStatus.Canceled));
    }
    
    // ============ TESTS DE FUNCIONES AUXILIARES ============
    
    function testGetUserTokens() public {
        // Registrar y aprobar producer
        vm.startPrank(producer);
        tracker.requestUserRole("Producer");
        vm.stopPrank();
        
        vm.prank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        
        // Crear tokens
        vm.prank(producer);
        tracker.createToken("Tomates", 1000, "{}", emptyArray, emptyAmounts);
        
        vm.prank(producer);
        tracker.createToken("Cebollas", 500, "{}", emptyArray, emptyAmounts);
        
        uint256[] memory userTokens = tracker.getUserTokens(producer);
        assertEq(userTokens.length, 2);
        assertEq(userTokens[0], 1);
        assertEq(userTokens[1], 2);
    }
    
    function testTraceTokenToOrigin() public {
        // Registrar y aprobar usuarios
        vm.startPrank(producer);
        tracker.requestUserRole("Producer");
        vm.stopPrank();
        
        vm.startPrank(factory);
        tracker.requestUserRole("Factory");
        vm.stopPrank();
        
        vm.startPrank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        tracker.changeStatusUser(factory, SupplyChain.UserStatus.Approved);
        vm.stopPrank();
        
        // Crear materias primas
        vm.prank(producer);
        tracker.createToken("Tomates", 1000, "{}", emptyArray, emptyAmounts);
        
        vm.prank(producer);
        tracker.createToken("Cebollas", 500, "{}", emptyArray, emptyAmounts);
        
        // Transferir a factory
        vm.startPrank(producer);
        tracker.transfer(factory, 1, 500);
        tracker.transfer(factory, 2, 200);
        vm.stopPrank();
        
        vm.startPrank(factory);
        tracker.acceptTransfer(1);
        tracker.acceptTransfer(2);
        vm.stopPrank();
        
        // Factory crea producto con múltiples ingredientes
        uint256[] memory parentIds = new uint256[](2);
        uint256[] memory parentAmounts = new uint256[](2);
        parentIds[0] = 1;
        parentIds[1] = 2;
        parentAmounts[0] = 500;
        parentAmounts[1] = 200;
        
        vm.prank(factory);
        tracker.createToken("Salsa", 100, "{}", parentIds, parentAmounts);
        
        // Trazar origen
        (uint256[] memory origins, uint256[] memory amounts) = tracker.traceTokenToOrigin(3);
        
        // Debería encontrar las materias primas originales
        assertTrue(origins.length > 0);
        assertTrue(amounts.length > 0);
    }
    
    // ============ TESTS DE ERC-1155 ============
    
    function testERC1155BalanceOf() public {
        // Registrar y aprobar producer
        vm.startPrank(producer);
        tracker.requestUserRole("Producer");
        vm.stopPrank();
        
        vm.prank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        
        // Crear token
        vm.prank(producer);
        tracker.createToken("Tomates", 1000, "{}", emptyArray, emptyAmounts);
        
        assertEq(tracker.balanceOf(producer, 1), 1000);
        assertEq(tracker.balanceOf(factory, 1), 0);
    }
    
    function testERC1155BalanceOfBatch() public {
        // Registrar y aprobar producer
        vm.startPrank(producer);
        tracker.requestUserRole("Producer");
        vm.stopPrank();
        
        vm.prank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        
        // Crear tokens
        vm.startPrank(producer);
        tracker.createToken("Tomates", 1000, "{}", emptyArray, emptyAmounts);
        tracker.createToken("Cebollas", 500, "{}", emptyArray, emptyAmounts);
        vm.stopPrank();
        
        address[] memory accounts = new address[](2);
        uint256[] memory ids = new uint256[](2);
        accounts[0] = producer;
        accounts[1] = producer;
        ids[0] = 1;
        ids[1] = 2;
        
        uint256[] memory balances = tracker.balanceOfBatch(accounts, ids);
        assertEq(balances[0], 1000);
        assertEq(balances[1], 500);
    }
    
    function testERC1155SetApprovalForAll() public {
        // Registrar y aprobar usuarios
        vm.startPrank(producer);
        tracker.requestUserRole("Producer");
        vm.stopPrank();
        
        vm.startPrank(factory);
        tracker.requestUserRole("Factory");
        vm.stopPrank();
        
        vm.startPrank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        tracker.changeStatusUser(factory, SupplyChain.UserStatus.Approved);
        vm.stopPrank();
        
        // Producer aprueba a Factory
        vm.prank(producer);
        tracker.setApprovalForAll(factory, true);
        
        assertTrue(tracker.isApprovedForAll(producer, factory));
        assertFalse(tracker.isApprovedForAll(producer, retailer));
    }
    
    // ============ TESTS DE CASOS EDGE ============
    
    function testUserPendingCannotOperate() public {
        // Registrar producer pero no aprobar
        vm.prank(producer);
        tracker.requestUserRole("Producer");
        
        // Producer no puede crear tokens
        vm.prank(producer);
        vm.expectRevert(SupplyChain.UserNotApproved.selector);
        tracker.createToken("Tomates", 1000, "{}", emptyArray, emptyAmounts);
    }
    
    function testUserRejectedCannotOperate() public {
        // Registrar producer
        vm.prank(producer);
        tracker.requestUserRole("Producer");
        
        // Admin rechaza al usuario
        vm.prank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Rejected);
        
        // Producer rechazado no puede crear tokens
        vm.prank(producer);
        vm.expectRevert(SupplyChain.UserNotApproved.selector);
        tracker.createToken("Tomates", 1000, "{}", emptyArray, emptyAmounts);
        
        // Producer rechazado no puede hacer transferencias
        vm.prank(producer);
        vm.expectRevert(SupplyChain.UserNotApproved.selector);
        tracker.transfer(factory, 1, 100);
    }
    
    function testUserCanceledCannotOperate() public {
        // Registrar producer
        vm.prank(producer);
        tracker.requestUserRole("Producer");
        
        // Admin cancela al usuario
        vm.prank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Canceled);
        
        // Producer cancelado no puede crear tokens
        vm.prank(producer);
        vm.expectRevert(SupplyChain.UserNotApproved.selector);
        tracker.createToken("Tomates", 1000, "{}", emptyArray, emptyAmounts);
        
        // Producer cancelado no puede hacer transferencias
        vm.prank(producer);
        vm.expectRevert(SupplyChain.UserNotApproved.selector);
        tracker.transfer(factory, 1, 100);
    }
    
    function testUserStatusTransitions() public {
        // Registrar producer
        vm.prank(producer);
        tracker.requestUserRole("Producer");
        
        // Cache de estados para optimización
        uint256 pendingStatus = uint(SupplyChain.UserStatus.Pending);
        uint256 approvedStatus = uint(SupplyChain.UserStatus.Approved);
        uint256 rejectedStatus = uint(SupplyChain.UserStatus.Rejected);
        uint256 canceledStatus = uint(SupplyChain.UserStatus.Canceled);
        
        // Verificar estado inicial: Pending
        SupplyChain.User memory user = tracker.getUserInfo(producer);
        assertTrue(uint(user.status) == pendingStatus);
        
        // Admin aprueba al usuario
        vm.prank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        
        user = tracker.getUserInfo(producer);
        assertTrue(uint(user.status) == approvedStatus);
        
        // Usuario aprobado puede crear tokens
        vm.prank(producer);
        tracker.createToken("Tomates", 1000, "{}", emptyArray, emptyAmounts);
        
        // Admin rechaza al usuario
        vm.prank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Rejected);
        
        user = tracker.getUserInfo(producer);
        assertTrue(uint(user.status) == rejectedStatus);
        
        // Usuario rechazado no puede crear más tokens
        vm.prank(producer);
        vm.expectRevert(SupplyChain.UserNotApproved.selector);
        tracker.createToken("Cebollas", 500, "{}", emptyArray, emptyAmounts);
        
        // Admin cancela al usuario
        vm.prank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Canceled);
        
        user = tracker.getUserInfo(producer);
        assertTrue(uint(user.status) == canceledStatus);
        
        // Usuario cancelado no puede crear tokens
        vm.prank(producer);
        vm.expectRevert(SupplyChain.UserNotApproved.selector);
        tracker.createToken("Ajos", 200, "{}", emptyArray, emptyAmounts);
    }
    
    function testOnlyAdminCanChangeUserStatus() public {
        // Registrar producer
        vm.prank(producer);
        tracker.requestUserRole("Producer");
        
        // Registrar factory
        vm.prank(factory);
        tracker.requestUserRole("Factory");
        
        // Aprobar factory
        vm.prank(admin);
        tracker.changeStatusUser(factory, SupplyChain.UserStatus.Approved);
        
        // Factory no puede cambiar status de producer (solo admin puede)
        vm.prank(factory);
        vm.expectRevert(SupplyChain.UnauthorizedAdmin.selector);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        
        // Producer no puede cambiar su propio status
        vm.prank(producer);
        vm.expectRevert(SupplyChain.UnauthorizedAdmin.selector);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        
        // Solo admin puede cambiar status
        vm.prank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        
        // Verificar que el cambio se aplicó
        SupplyChain.User memory user = tracker.getUserInfo(producer);
        assertTrue(uint(user.status) == uint(SupplyChain.UserStatus.Approved));
    }
    
    function testTransferOnlyParticipantCanAct() public {
        // Registrar y aprobar usuarios
        vm.startPrank(producer);
        tracker.requestUserRole("Producer");
        vm.stopPrank();
        
        vm.startPrank(factory);
        tracker.requestUserRole("Factory");
        vm.stopPrank();
        
        vm.startPrank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        tracker.changeStatusUser(factory, SupplyChain.UserStatus.Approved);
        vm.stopPrank();
        
        // Crear materia prima
        vm.prank(producer);
        tracker.createToken("Tomates", 1000, "{}", emptyArray, emptyAmounts);
        
        // Producer envía a Factory
        vm.prank(producer);
        tracker.transfer(factory, 1, 500);
        
        // Unauthorized no puede aceptar
        vm.prank(unauthorized);
        vm.expectRevert(SupplyChain.NotTransferParticipant.selector);
        tracker.acceptTransfer(1);
    }
    
    function testTransferFinalStatesCannotChange() public {
        // Registrar y aprobar usuarios
        vm.startPrank(producer);
        tracker.requestUserRole("Producer");
        vm.stopPrank();
        
        vm.startPrank(factory);
        tracker.requestUserRole("Factory");
        vm.stopPrank();
        
        vm.startPrank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        tracker.changeStatusUser(factory, SupplyChain.UserStatus.Approved);
        vm.stopPrank();
        
        // Crear materia prima
        vm.prank(producer);
        tracker.createToken("Tomates", 1000, "{}", emptyArray, emptyAmounts);
        
        // Producer envía a Factory
        vm.prank(producer);
        tracker.transfer(factory, 1, 500);
        
        // Factory acepta
        vm.prank(factory);
        tracker.acceptTransfer(1);
        
        // No se puede cambiar estado final
        vm.prank(factory);
        vm.expectRevert(SupplyChain.TransferNotPending.selector);
        tracker.rejectTransfer(1);
    }
    
    // ============ TESTS DE NUEVOS FLUJOS DE TRANSFERENCIA ============
    
    function testProducerToProducerFlow() public {
        // Registrar y aprobar dos productores
        vm.prank(producer);
        tracker.requestUserRole("Producer");
        
        address producer2 = address(0x888);
        vm.prank(producer2);
        tracker.requestUserRole("Producer");
        
        vm.startPrank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        tracker.changeStatusUser(producer2, SupplyChain.UserStatus.Approved);
        vm.stopPrank();
        
        // Producer1 crea materia prima
        vm.prank(producer);
        tracker.createToken("Trigo", 1000, "{tipo: 'grano'}", emptyArray, emptyAmounts);
        
        // Producer1 transfiere a Producer2 (redistribución)
        vm.prank(producer);
        tracker.transfer(producer2, 1, 300);
        
        // Verificar transferencia creada
        SupplyChain.Transfer memory t = tracker.getTransfer(1);
        assertEq(t.from, producer);
        assertEq(t.to, producer2);
        assertEq(t.tokenId, 1);
        assertEq(t.amount, 300);
        assertTrue(uint(t.status) == uint(SupplyChain.TransferStatus.Pending));
        
        // Producer2 acepta
        vm.prank(producer2);
        tracker.acceptTransfer(1);
        
        // Verificar balances
        assertEq(tracker.getTokenBalance(1, producer), 700);
        assertEq(tracker.getTokenBalance(1, producer2), 300);
    }
    
    function testFactoryToFactoryFlow() public {
        // Registrar y aprobar producer y dos factories
        vm.prank(producer);
        tracker.requestUserRole("Producer");
        
        vm.prank(factory);
        tracker.requestUserRole("Factory");
        
        address factory2 = address(0x777);
        vm.prank(factory2);
        tracker.requestUserRole("Factory");
        
        vm.startPrank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        tracker.changeStatusUser(factory, SupplyChain.UserStatus.Approved);
        tracker.changeStatusUser(factory2, SupplyChain.UserStatus.Approved);
        vm.stopPrank();
        
        // Producer crea y transfiere componentes a Factory1
        vm.prank(producer);
        tracker.createToken("Circuitos", 500, "{tipo: 'electronica'}", emptyArray, emptyAmounts);
        
        vm.prank(producer);
        tracker.transfer(factory, 1, 500);
        
        vm.prank(factory);
        tracker.acceptTransfer(1);
        
        // Factory1 crea producto intermedio
        uint256[] memory parentIds = new uint256[](1);
        parentIds[0] = 1;
        uint256[] memory parentAmounts = new uint256[](1);
        parentAmounts[0] = 200;
        
        vm.prank(factory);
        tracker.createToken("Modulo Electronico", 100, "{ensamblado: true}", parentIds, parentAmounts);
        
        // Factory1 transfiere módulos a Factory2 para ensamblaje final
        vm.prank(factory);
        tracker.transfer(factory2, 2, 50);
        
        // Verificar transferencia
        SupplyChain.Transfer memory t = tracker.getTransfer(2);
        assertEq(t.from, factory);
        assertEq(t.to, factory2);
        assertEq(t.tokenId, 2);
        assertEq(t.amount, 50);
        
        // Factory2 acepta
        vm.prank(factory2);
        tracker.acceptTransfer(2);
        
        // Verificar balances
        assertEq(tracker.getTokenBalance(2, factory), 50);
        assertEq(tracker.getTokenBalance(2, factory2), 50);
    }
    
    function testRetailerToRetailerFlow() public {
        // Setup completo de la cadena
        vm.prank(producer);
        tracker.requestUserRole("Producer");
        
        vm.prank(factory);
        tracker.requestUserRole("Factory");
        
        vm.prank(retailer);
        tracker.requestUserRole("Retailer");
        
        address retailer2 = address(0x666);
        vm.prank(retailer2);
        tracker.requestUserRole("Retailer");
        
        vm.startPrank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        tracker.changeStatusUser(factory, SupplyChain.UserStatus.Approved);
        tracker.changeStatusUser(retailer, SupplyChain.UserStatus.Approved);
        tracker.changeStatusUser(retailer2, SupplyChain.UserStatus.Approved);
        vm.stopPrank();
        
        // Producer -> Factory
        vm.prank(producer);
        tracker.createToken("Ingredientes", 1000, "{}", emptyArray, emptyAmounts);
        
        vm.prank(producer);
        tracker.transfer(factory, 1, 1000);
        
        vm.prank(factory);
        tracker.acceptTransfer(1);
        
        // Factory crea producto
        uint256[] memory parentIds = new uint256[](1);
        parentIds[0] = 1;
        uint256[] memory parentAmounts = new uint256[](1);
        parentAmounts[0] = 1000;
        
        vm.prank(factory);
        tracker.createToken("Producto Terminado", 500, "{}", parentIds, parentAmounts);
        
        // Factory -> Retailer1
        vm.prank(factory);
        tracker.transfer(retailer, 2, 500);
        
        vm.prank(retailer);
        tracker.acceptTransfer(2);
        
        // Retailer1 redistribuye a Retailer2
        vm.prank(retailer);
        tracker.transfer(retailer2, 2, 200);
        
        // Verificar transferencia
        SupplyChain.Transfer memory t = tracker.getTransfer(3);
        assertEq(t.from, retailer);
        assertEq(t.to, retailer2);
        assertEq(t.tokenId, 2);
        assertEq(t.amount, 200);
        
        // Retailer2 acepta
        vm.prank(retailer2);
        tracker.acceptTransfer(3);
        
        // Verificar balances
        assertEq(tracker.getTokenBalance(2, retailer), 300);
        assertEq(tracker.getTokenBalance(2, retailer2), 200);
    }
    
    function testInvalidFlowsStillBlocked() public {
        // Verificar que flujos no permitidos sigan bloqueados
        vm.prank(producer);
        tracker.requestUserRole("Producer");
        
        vm.prank(factory);
        tracker.requestUserRole("Factory");
        
        vm.prank(retailer);
        tracker.requestUserRole("Retailer");
        
        vm.prank(consumer);
        tracker.requestUserRole("Consumer");
        
        vm.startPrank(admin);
        tracker.changeStatusUser(producer, SupplyChain.UserStatus.Approved);
        tracker.changeStatusUser(factory, SupplyChain.UserStatus.Approved);
        tracker.changeStatusUser(retailer, SupplyChain.UserStatus.Approved);
        tracker.changeStatusUser(consumer, SupplyChain.UserStatus.Approved);
        vm.stopPrank();
        
        // Producer crea token
        vm.prank(producer);
        tracker.createToken("Material", 1000, "{}", emptyArray, emptyAmounts);
        
        // Producer NO puede enviar directamente a Retailer (debe ir a Factory primero)
        vm.prank(producer);
        vm.expectRevert(SupplyChain.InvalidTransferFlow.selector);
        tracker.transfer(retailer, 1, 100);
        
        // Producer NO puede enviar directamente a Consumer
        vm.prank(producer);
        vm.expectRevert(SupplyChain.InvalidTransferFlow.selector);
        tracker.transfer(consumer, 1, 100);
        
        // Dar tokens a Factory para probar flujos inversos
        vm.prank(producer);
        tracker.transfer(factory, 1, 300);
        vm.prank(factory);
        tracker.acceptTransfer(1);
        
        // Factory NO puede enviar a Producer (flujo inverso no permitido)
        vm.prank(factory);
        vm.expectRevert(SupplyChain.InvalidTransferFlow.selector);
        tracker.transfer(producer, 1, 100);
        
        // Factory NO puede enviar a Consumer (debe ir por Retailer)
        vm.prank(factory);
        vm.expectRevert(SupplyChain.InvalidTransferFlow.selector);
        tracker.transfer(consumer, 1, 100);
        
        // Dar tokens a Retailer para probar sus flujos inversos
        vm.prank(factory);
        tracker.transfer(retailer, 1, 200);
        vm.prank(retailer);
        tracker.acceptTransfer(2);
        
        // Retailer NO puede enviar a Producer (flujo inverso no permitido)
        vm.prank(retailer);
        vm.expectRevert(SupplyChain.InvalidTransferFlow.selector);
        tracker.transfer(producer, 1, 100);
        
        // Retailer NO puede enviar a Factory (flujo inverso no permitido)
        vm.prank(retailer);
        vm.expectRevert(SupplyChain.InvalidTransferFlow.selector);
        tracker.transfer(factory, 1, 100);
    }
}