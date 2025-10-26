import { BrowserProvider, Contract, ContractFactory, JsonRpcSigner, Eip1193Provider } from 'ethers';
import { ANVIL_NETWORK, getABI, getBytecode } from '@/contracts/config';
import type { User, Token, Transfer, DeployInfo } from '@/types';

declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

class Web3Service {
  private provider: BrowserProvider | null = null;
  private signer: JsonRpcSigner | null = null;
  private contract: Contract | null = null;
  private contractAddress: string | null = null;

  // Verificar si MetaMask está instalado
  isMetaMaskInstalled(): boolean {
    const isInstalled = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
    console.log('🦊 MetaMask instalado?', isInstalled);
    return isInstalled;
  }

  // Conectar con MetaMask
  async connectWallet(): Promise<string> {
    console.log('🔗 web3Service.connectWallet() llamado');
    
    if (!this.isMetaMaskInstalled()) {
      const error = 'MetaMask no está instalado. Por favor, instala MetaMask para continuar.';
      console.error('❌', error);
      throw new Error(error);
    }

    try {
      console.log('📝 Solicitando cuentas a MetaMask...');
      // Solicitar cuentas
      const accounts = await window.ethereum!.request({
        method: 'eth_requestAccounts',
      });
      console.log('✅ Cuentas recibidas:', accounts);

      if (!accounts || accounts.length === 0) {
        throw new Error('No se encontraron cuentas en MetaMask');
      }

      // Verificar/cambiar a red Anvil
      await this.switchToAnvilNetwork();

      // Inicializar provider y signer
      this.provider = new BrowserProvider(window.ethereum!);
      this.signer = await this.provider.getSigner();

      return accounts[0];
    } catch (error: any) {
      console.error('Error conectando wallet:', error);
      throw new Error(`Error al conectar: ${error.message}`);
    }
  }

  // Cambiar a la red Anvil
  async switchToAnvilNetwork(): Promise<void> {
    try {
      await window.ethereum!.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ANVIL_NETWORK.chainId }],
      });
    } catch (error: any) {
      // Si la red no existe, agregarla
      if (error.code === 4902) {
        await window.ethereum!.request({
          method: 'wallet_addEthereumChain',
          params: [ANVIL_NETWORK],
        });
      } else {
        throw error;
      }
    }
  }

  // Desconectar wallet y revocar permisos en MetaMask
  async disconnect(): Promise<void> {
    try {
      // Intentar revocar permisos en MetaMask (EIP-2255)
      // Esto fuerza que MetaMask pida seleccionar cuenta la próxima vez
      if (window.ethereum) {
        try {
          // Método moderno (MetaMask v10.18.0+)
          await window.ethereum.request({
            method: 'wallet_revokePermissions',
            params: [{
              eth_accounts: {}
            }]
          });
          console.log('✅ Permisos de MetaMask revocados');
        } catch (error: any) {
          // Si wallet_revokePermissions no está disponible, intentar método alternativo
          console.log('⚠️ wallet_revokePermissions no disponible, usando método alternativo');
          
          // Método alternativo: solicitar cuentas vacías (desconecta en algunas versiones)
          try {
            await window.ethereum.request({
              method: 'wallet_requestPermissions',
              params: [{
                eth_accounts: {}
              }]
            });
          } catch (e) {
            console.log('ℹ️ Desconexión local (MetaMask puede seguir conectado)');
          }
        }
      }
    } catch (error) {
      console.error('Error al revocar permisos de MetaMask:', error);
    } finally {
      // Limpiar estado local siempre
      this.provider = null;
      this.signer = null;
      this.contract = null;
      this.contractAddress = null;
      console.log('🔌 Desconectado del servicio Web3');
    }
  }

  // Obtener dirección actual
  async getCurrentAddress(): Promise<string | null> {
    if (!this.signer) return null;
    return await this.signer.getAddress();
  }

  // Verificar si el contrato está desplegado
  async isContractDeployed(address: string): Promise<boolean> {
    if (!this.provider) return false;
    
    try {
      const code = await this.provider.getCode(address);
      return code !== '0x';
    } catch {
      return false;
    }
  }

  // Desplegar el contrato (solo la primera vez)
  async deployContract(): Promise<DeployInfo> {
    if (!this.signer) {
      throw new Error('Wallet no conectada');
    }

    try {
      console.log('🚀 Desplegando contrato SupplyChain...');

      // Cargar ABI y Bytecode
      const [abi, bytecode] = await Promise.all([getABI(), getBytecode()]);
      
      if (!abi || abi.length === 0) {
        throw new Error('No se pudo cargar el ABI del contrato');
      }
      
      if (!bytecode) {
        throw new Error('No se pudo cargar el bytecode del contrato');
      }

      // Crear factory y desplegar con gas limit fijo
      const factory = new ContractFactory(abi, bytecode, this.signer);
      
      console.log('⛽ Desplegando con gas limit: 8,000,000');
      
      // Desplegar con gas limit fijo alto (8M - necesario para contrato grande)
      const contract = await factory.deploy({
        gasLimit: 8000000
      });
      
      console.log('⏳ Esperando confirmación del deploy...');
      await contract.waitForDeployment();
      
      const contractAddress = await contract.getAddress();
      const adminAddress = await this.signer.getAddress();

      console.log('✅ Contrato desplegado exitosamente!');
      console.log('📝 Dirección del contrato:', contractAddress);
      console.log('👤 Dirección del admin:', adminAddress);

      // Guardar información del deploy
      const deployInfo: DeployInfo = {
        contractAddress,
        adminAddress,
        deployedAt: Date.now(),
      };

      // Guardar en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('deployInfo', JSON.stringify(deployInfo));
      }

      this.contractAddress = contractAddress;
      this.contract = contract as unknown as Contract;

      return deployInfo;
    } catch (error: any) {
      console.error('Error desplegando contrato:', error);
      throw new Error(`Error al desplegar contrato: ${error.message}`);
    }
  }

  // Inicializar contrato con dirección existente
  async initializeContract(address: string): Promise<void> {
    if (!this.signer) {
      throw new Error('Wallet no conectada');
    }

    try {
      // Cargar ABI
      const abi = await getABI();
      
      if (!abi || abi.length === 0) {
        throw new Error('No se pudo cargar el ABI del contrato');
      }

      // Verificar que el contrato existe (solo advertencia, no bloquear)
      try {
        const code = await this.provider!.getCode(address);
        if (code === '0x') {
          console.warn('⚠️ Contrato no encontrado en:', address);
          console.warn('⚠️ Esto puede ser normal si aún no conectaste MetaMask a Anvil');
          // NO limpiar localStorage, solo advertir
        } else {
          console.log('✅ Contrato verificado - código encontrado en blockchain');
        }
      } catch (error) {
        console.warn('⚠️ No se pudo verificar código del contrato, continuando de todos modos...', error);
      }

      this.contract = new Contract(address, abi, this.signer);
      this.contractAddress = address;

      console.log('✅ Contrato inicializado:', address);
    } catch (error: any) {
      console.error('Error inicializando contrato:', error);
      throw new Error(`Error al inicializar contrato: ${error.message}`);
    }
  }

  // Verificar si una dirección es admin
  async isAdmin(address: string): Promise<boolean> {
    if (!this.contract) return false;
    
    try {
      return await this.contract.isAdmin(address);
    } catch (error) {
      console.error('Error verificando admin:', error);
      return false;
    }
  }

  // ==================== FUNCIONES DE USUARIO ====================

  // Obtener información de usuario
  async getUserInfo(address: string): Promise<User | null> {
    if (!this.contract) throw new Error('Contrato no inicializado');

    try {
      const user = await this.contract.getUserInfo(address);
      return {
        id: user.id,
        userAddress: user.userAddress,
        role: user.role,
        status: Number(user.status),
        exists: user.exists,
      };
    } catch (error: any) {
      // Si el usuario no existe (custom error 0x2163950f = UserNotRegistered), retornar null
      const errorData = error?.data?.data || error?.error?.data?.data || error?.data;
      if (
        errorData === '0x2163950f' || 
        error.message?.includes('UserNotRegistered') ||
        error.message?.includes('0x2163950f')
      ) {
        console.log('👤 Usuario no registrado (esto es normal para admin)');
        return null;
      }
      console.error('❌ Error inesperado en getUserInfo:', error);
      throw error;
    }
  }

  // Solicitar rol de usuario
  async requestUserRole(role: string): Promise<void> {
    if (!this.contract) throw new Error('Contrato no inicializado');

    try {
      // ethers.js estima el gas automáticamente si no se especifica
      const tx = await this.contract.requestUserRole(role);
      await tx.wait();
      console.log('✅ Rol solicitado exitosamente');
    } catch (error: any) {
      console.error('Error solicitando rol:', error);
      throw new Error(`Error al solicitar rol: ${error.message}`);
    }
  }

  // Cambiar estado de usuario (solo admin)
  async changeUserStatus(userAddress: string, newStatus: number): Promise<void> {
    if (!this.contract) throw new Error('Contrato no inicializado');

    try {
      const tx = await this.contract.changeStatusUser(userAddress, newStatus);
      await tx.wait();
      console.log('✅ Estado de usuario cambiado exitosamente');
    } catch (error: any) {
      console.error('Error cambiando estado de usuario:', error);
      throw new Error(`Error al cambiar estado: ${error.message}`);
    }
  }

  // ==================== FUNCIONES DE TOKENS ====================

  // Crear token
  async createToken(
    name: string,
    totalSupply: bigint,
    features: string,
    parentIds: bigint[],
    parentAmounts: bigint[]
  ): Promise<void> {
    if (!this.contract) throw new Error('Contrato no inicializado');

    try {
      const tx = await this.contract.createToken(
        name,
        totalSupply,
        features,
        parentIds,
        parentAmounts
      );
      await tx.wait();
      console.log('✅ Token creado exitosamente');
    } catch (error: any) {
      console.error('Error creando token:', error);
      throw new Error(`Error al crear token: ${error.message}`);
    }
  }

  // Obtener información de un token
  async getToken(tokenId: bigint): Promise<Token> {
    if (!this.contract) throw new Error('Contrato no inicializado');

    try {
      const token = await this.contract.getToken(tokenId);
      return {
        id: token.id,
        creator: token.creator,
        name: token.name,
        totalSupply: token.totalSupply,
        features: token.features,
        parentIds: token.parentIds,
        parentAmounts: token.parentAmounts,
        dateCreated: token.dateCreated,
        exists: token.exists,
      };
    } catch (error: any) {
      console.error('Error obteniendo token:', error);
      throw new Error(`Error al obtener token: ${error.message}`);
    }
  }

  // Obtener tokens de un usuario
  async getUserTokens(address: string): Promise<bigint[]> {
    if (!this.contract) throw new Error('Contrato no inicializado');

    try {
      return await this.contract.getUserTokens(address);
    } catch (error: any) {
      console.error('Error obteniendo tokens de usuario:', error);
      throw new Error(`Error al obtener tokens: ${error.message}`);
    }
  }

  // Obtener balance de un token
  async getTokenBalance(tokenId: bigint, address: string): Promise<bigint> {
    if (!this.contract) throw new Error('Contrato no inicializado');

    try {
      return await this.contract.balanceOf(address, tokenId);
    } catch (error: any) {
      console.error('Error obteniendo balance:', error);
      return 0n;
    }
  }

  // Trazar token hasta el origen
  async traceTokenToOrigin(tokenId: bigint): Promise<{ origins: bigint[]; amounts: bigint[] }> {
    if (!this.contract) throw new Error('Contrato no inicializado');

    try {
      const [origins, amounts] = await this.contract.traceTokenToOrigin(tokenId);
      return { origins, amounts };
    } catch (error: any) {
      console.error('Error trazando token:', error);
      throw new Error(`Error al trazar token: ${error.message}`);
    }
  }

  // ==================== FUNCIONES DE TRANSFERENCIAS ====================

  // Crear transferencia
  async transfer(to: string, tokenId: bigint, amount: bigint): Promise<void> {
    if (!this.contract) throw new Error('Contrato no inicializado');

    try {
      const tx = await this.contract.transfer(to, tokenId, amount);
      await tx.wait();
      console.log('✅ Transferencia creada exitosamente');
    } catch (error: any) {
      console.error('Error creando transferencia:', error);
      throw new Error(`Error al crear transferencia: ${error.message}`);
    }
  }

  // Aceptar transferencia
  async acceptTransfer(transferId: bigint): Promise<void> {
    if (!this.contract) throw new Error('Contrato no inicializado');

    try {
      const tx = await this.contract.acceptTransfer(transferId);
      await tx.wait();
      console.log('✅ Transferencia aceptada exitosamente');
    } catch (error: any) {
      console.error('Error aceptando transferencia:', error);
      throw new Error(`Error al aceptar transferencia: ${error.message}`);
    }
  }

  // Rechazar transferencia
  async rejectTransfer(transferId: bigint): Promise<void> {
    if (!this.contract) throw new Error('Contrato no inicializado');

    try {
      const tx = await this.contract.rejectTransfer(transferId);
      await tx.wait();
      console.log('✅ Transferencia rechazada exitosamente');
    } catch (error: any) {
      console.error('Error rechazando transferencia:', error);
      throw new Error(`Error al rechazar transferencia: ${error.message}`);
    }
  }

  // Cancelar transferencia
  async cancelTransfer(transferId: bigint): Promise<void> {
    if (!this.contract) throw new Error('Contrato no inicializado');

    try {
      const tx = await this.contract.cancelTransfer(transferId);
      await tx.wait();
      console.log('✅ Transferencia cancelada exitosamente');
    } catch (error: any) {
      console.error('Error cancelando transferencia:', error);
      throw new Error(`Error al cancelar transferencia: ${error.message}`);
    }
  }

  // Obtener información de transferencia
  async getTransfer(transferId: bigint): Promise<Transfer> {
    if (!this.contract) throw new Error('Contrato no inicializado');

    try {
      const transfer = await this.contract.getTransfer(transferId);
      return {
        id: transfer.id,
        from: transfer.from,
        to: transfer.to,
        tokenId: transfer.tokenId,
        dateCreated: transfer.dateCreated,
        amount: transfer.amount,
        status: Number(transfer.status),
        exists: transfer.exists,
      };
    } catch (error: any) {
      console.error('Error obteniendo transferencia:', error);
      throw new Error(`Error al obtener transferencia: ${error.message}`);
    }
  }

  // Obtener transferencias de un usuario
  async getUserTransfers(address: string): Promise<bigint[]> {
    if (!this.contract) throw new Error('Contrato no inicializado');

    try {
      return await this.contract.getUserTransfers(address);
    } catch (error: any) {
      console.error('Error obteniendo transferencias:', error);
      throw new Error(`Error al obtener transferencias: ${error.message}`);
    }
  }
}

// Exportar instancia única
export const web3Service = new Web3Service();

// ==================== FUNCIONES DE AYUDA EXPORTADAS ====================

/**
 * Obtener tokens de un usuario
 */
export async function getUserTokens(address: string): Promise<number[]> {
  const tokens = await web3Service.getUserTokens(address);
  return tokens.map(id => Number(id));
}

/**
 * Obtener balance de un token específico
 */
export async function getTokenBalance(tokenId: number, address: string): Promise<number> {
  const balance = await web3Service.getTokenBalance(BigInt(tokenId), address);
  return Number(balance);
}

/**
 * Obtener información de un token
 */
export async function getToken(tokenId: number) {
  return await web3Service.getToken(tokenId);
}

/**
 * Obtener transferencias de un usuario
 */
export async function getUserTransfers(address: string): Promise<number[]> {
  const transfers = await web3Service.getUserTransfers(address);
  return transfers.map(id => Number(id));
}

/**
 * Obtener información de una transferencia
 */
export async function getTransfer(transferId: number) {
  return await web3Service.getTransfer(transferId);
}

