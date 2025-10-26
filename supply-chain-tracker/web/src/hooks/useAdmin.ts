import { useState, useEffect } from 'react';
import { web3Service } from '@/lib/web3';
import type { User } from '@/types';

// Lista de direcciones conocidas de Anvil para escanear
const ANVIL_ADDRESSES = [
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Account #0
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Account #1
  '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', // Account #2
  '0x90F79bf6EB2c4f870365E785982E1f101E93b906', // Account #3
  '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', // Account #4
  '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc', // Account #5
  '0x976EA74026E726554dB657fA54763abd0C3a0aa9', // Account #6
  '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955', // Account #7
  '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f', // Account #8
  '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720', // Account #9
];

export function useAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los usuarios
  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const loadedUsers: User[] = [];

      // Escanear todas las direcciones conocidas
      for (const address of ANVIL_ADDRESSES) {
        try {
          const user = await web3Service.getUserInfo(address);
          if (user && user.exists) {
            loadedUsers.push(user);
          }
        } catch (err) {
          // Usuario no existe, continuar
          continue;
        }
      }

      // Ordenar usuarios: Pending primero, luego Approved, luego el resto
      loadedUsers.sort((a, b) => {
        // Orden de prioridad: Pending (0) > Approved (1) > Rejected (2) > Canceled (3)
        const statusOrder = [0, 1, 2, 3]; // Pending, Approved, Rejected, Canceled
        return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      });

      setUsers(loadedUsers);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cambiar estado de usuario
  const changeUserStatus = async (userAddress: string, newStatus: number) => {
    setIsLoading(true);
    setError(null);

    try {
      await web3Service.changeUserStatus(userAddress, newStatus);
      // Recargar usuarios después del cambio
      await loadUsers();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);

  // Estadísticas de usuarios
  const stats = {
    total: users.length,
    pending: users.filter((u) => u.status === 0).length,
    approved: users.filter((u) => u.status === 1).length,
    rejected: users.filter((u) => u.status === 2).length,
    canceled: users.filter((u) => u.status === 3).length,
  };

  return {
    users,
    stats,
    isLoading,
    error,
    loadUsers,
    changeUserStatus,
  };
}


