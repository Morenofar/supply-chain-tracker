import { useState } from 'react';
import { web3Service } from '@/lib/web3';
import type { Token, Transfer } from '@/types';

export function useContract() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==================== USUARIOS ====================

  const requestUserRole = async (role: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await web3Service.requestUserRole(role);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const changeUserStatus = async (userAddress: string, newStatus: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await web3Service.changeUserStatus(userAddress, newStatus);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserInfo = async (address: string) => {
    setIsLoading(true);
    setError(null);
    try {
      return await web3Service.getUserInfo(address);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== TOKENS ====================

  const createToken = async (
    name: string,
    totalSupply: number,
    features: string,
    parentIds: number[] = [],
    parentAmounts: number[] = []
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      // Convertir a bigint para el contrato
      await web3Service.createToken(
        name,
        BigInt(totalSupply),
        features,
        parentIds.map(id => BigInt(id)),
        parentAmounts.map(amount => BigInt(amount))
      );
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getToken = async (tokenId: bigint): Promise<Token> => {
    setIsLoading(true);
    setError(null);
    try {
      return await web3Service.getToken(tokenId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserTokens = async (address: string): Promise<bigint[]> => {
    setIsLoading(true);
    setError(null);
    try {
      return await web3Service.getUserTokens(address);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getTokenBalance = async (tokenId: bigint, address: string): Promise<bigint> => {
    setIsLoading(true);
    setError(null);
    try {
      return await web3Service.getTokenBalance(tokenId, address);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const traceTokenToOrigin = async (tokenId: bigint) => {
    setIsLoading(true);
    setError(null);
    try {
      return await web3Service.traceTokenToOrigin(tokenId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== TRANSFERENCIAS ====================

  const transfer = async (to: string, tokenId: number, amount: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await web3Service.transfer(to, BigInt(tokenId), BigInt(amount));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const acceptTransfer = async (transferId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await web3Service.acceptTransfer(BigInt(transferId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectTransfer = async (transferId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await web3Service.rejectTransfer(BigInt(transferId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelTransfer = async (transferId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await web3Service.cancelTransfer(BigInt(transferId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getTransfer = async (transferId: bigint): Promise<Transfer> => {
    setIsLoading(true);
    setError(null);
    try {
      return await web3Service.getTransfer(transferId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserTransfers = async (address: string): Promise<bigint[]> => {
    setIsLoading(true);
    setError(null);
    try {
      return await web3Service.getUserTransfers(address);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    // Usuarios
    requestUserRole,
    changeUserStatus,
    getUserInfo,
    // Tokens
    createToken,
    getToken,
    getUserTokens,
    getTokenBalance,
    traceTokenToOrigin,
    // Transferencias
    transfer,
    acceptTransfer,
    rejectTransfer,
    cancelTransfer,
    getTransfer,
    getUserTransfers,
  };
}

