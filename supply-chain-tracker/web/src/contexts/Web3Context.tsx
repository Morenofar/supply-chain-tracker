'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { web3Service } from '@/lib/web3';
import type { WalletState, User, DeployInfo } from '@/types';
import { UserStatus } from '@/types';

interface Web3ContextType {
  walletState: WalletState;
  isLoading: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;  // Ahora es async para revocar permisos de MetaMask
  deployContract: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  contractAddress: string | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

const STORAGE_KEYS = {
  WALLET_ADDRESS: 'wallet_address',
  DEPLOY_INFO: 'deployInfo',
};

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnected: false,
    isAdmin: false,
    user: null,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(null);

  // Inicializar desde localStorage
  useEffect(() => {
    const initializeFromStorage = async () => {
      if (typeof window === 'undefined') return;

      const deployInfo = localStorage.getItem(STORAGE_KEYS.DEPLOY_INFO);

      if (deployInfo) {
        const { contractAddress: savedContractAddress } = JSON.parse(deployInfo) as DeployInfo;
        console.log('📦 Dirección de contrato encontrada en localStorage:', savedContractAddress);
        setContractAddress(savedContractAddress);
        
        // NO intentar inicializar el contrato aquí
        // El contrato se inicializará cuando el usuario conecte MetaMask
        console.log('✅ Contrato cargado desde localStorage (pendiente de conexión)');
      }
    };

    initializeFromStorage();
  }, []);

  // Reconectar wallet
  const reconnectWallet = async () => {
    try {
      const address = await web3Service.connectWallet();
      
      if (contractAddress) {
        await web3Service.initializeContract(contractAddress);
        await updateWalletState(address);
      }
    } catch (error: any) {
      console.error('Error reconectando wallet:', error);
      throw error;
    }
  };

  // Actualizar estado de la wallet
  const updateWalletState = async (address: string) => {
    try {
      const isAdmin = await web3Service.isAdmin(address);
      let user: User | null = null;

      try {
        user = await web3Service.getUserInfo(address);
      } catch (error) {
        // Usuario no registrado
        user = null;
      }

      setWalletState({
        address,
        chainId: '0x7a69', // Anvil
        isConnected: true,
        isAdmin,
        user,
      });

      // Guardar en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, address);
      }
    } catch (error: any) {
      console.error('Error actualizando wallet state:', error);
      throw error;
    }
  };

  // Conectar wallet
  const connectWallet = async () => {
    console.log('🚀 Web3Context: Iniciando conexión...');
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔌 Web3Context: Llamando a web3Service.connectWallet()');
      const address = await web3Service.connectWallet();
      console.log('✅ Web3Context: Dirección obtenida:', address);
      
      // Verificar si hay un contrato desplegado
      const deployInfo = localStorage.getItem(STORAGE_KEYS.DEPLOY_INFO);
      
      if (deployInfo) {
        const { contractAddress } = JSON.parse(deployInfo) as DeployInfo;
        setContractAddress(contractAddress);
        await web3Service.initializeContract(contractAddress);
        await updateWalletState(address);
      } else {
        // Si no hay contrato desplegado, solo actualizar dirección
        setWalletState({
          address,
          chainId: '0x7a69',
          isConnected: true,
          isAdmin: false,
          user: null,
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, address);
        }
      }
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Desconectar wallet
  const disconnectWallet = async () => {
    try {
      console.log('🔌 Desconectando wallet y revocando permisos...');
      
      // Desconectar y revocar permisos en MetaMask
      await web3Service.disconnect();
      
      // Limpiar datos almacenados
      clearStoredData();
      
      // Resetear estado
      setWalletState({
        address: null,
        chainId: null,
        isConnected: false,
        isAdmin: false,
        user: null,
      });
      
      setContractAddress(null);
      setError(null);
      
      console.log('✅ Desconexión completa - MetaMask pedirá cuenta al reconectar');
    } catch (error) {
      console.error('Error al desconectar:', error);
      // Limpiar estado local aunque falle la revocación de MetaMask
      clearStoredData();
      setWalletState({
        address: null,
        chainId: null,
        isConnected: false,
        isAdmin: false,
        user: null,
      });
      setContractAddress(null);
    }
  };

  // Limpiar datos almacenados
  const clearStoredData = () => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
    // NO eliminar DEPLOY_INFO para mantener referencia al contrato
  };

  // Desplegar contrato
  const deployContract = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const deployInfo = await web3Service.deployContract();
      setContractAddress(deployInfo.contractAddress);
      
      // Actualizar estado con el nuevo admin
      if (walletState.address) {
        await updateWalletState(walletState.address);
      }
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Refrescar datos del usuario
  const refreshUserData = async () => {
    if (!walletState.address) return;

    try {
      const user = await web3Service.getUserInfo(walletState.address);
      const isAdmin = await web3Service.isAdmin(walletState.address);

      setWalletState(prev => ({
        ...prev,
        user,
        isAdmin,
      }));
    } catch (error) {
      console.error('Error refrescando datos de usuario:', error);
    }
  };

  // Escuchar eventos de MetaMask
  useEffect(() => {
    if (!web3Service.isMetaMaskInstalled() || typeof window === 'undefined') return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        // Usuario desconectó MetaMask
        disconnectWallet();
      } else if (accounts[0] !== walletState.address) {
        // Usuario cambió de cuenta
        console.log('Cuenta cambiada, reconectando...');
        try {
          if (contractAddress) {
            await web3Service.initializeContract(contractAddress);
            await updateWalletState(accounts[0]);
          }
        } catch (error) {
          console.error('Error al cambiar de cuenta:', error);
          disconnectWallet();
        }
      }
    };

    const handleChainChanged = () => {
      // Recargar página cuando cambia la red
      window.location.reload();
    };

    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    window.ethereum?.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [walletState.address, contractAddress]);

  const value: Web3ContextType = {
    walletState,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    deployContract,
    refreshUserData,
    contractAddress,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

// Hook personalizado para usar el contexto
export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 debe ser usado dentro de un Web3Provider');
  }
  return context;
}

