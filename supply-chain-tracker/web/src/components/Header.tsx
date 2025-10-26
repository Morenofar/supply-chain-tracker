'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { shortenAddress, getUserStatusName, getUserStatusColor } from '@/lib/utils';
import { Wallet, LogOut, Package, ArrowLeftRight, Users, LayoutDashboard } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { walletState, disconnectWallet } = useWeb3();
  const { address, isConnected, isAdmin, user } = walletState;

  const handleDisconnect = async () => {
    await disconnectWallet();
    router.push('/');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, show: isConnected && user?.status === 1 },
    { name: 'Tokens', href: '/tokens', icon: Package, show: isConnected && user?.status === 1 },
    { name: 'Transferencias', href: '/transfers', icon: ArrowLeftRight, show: isConnected && user?.status === 1 },
    { name: 'Admin', href: '/admin', icon: Users, show: isAdmin },
  ];

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Package className="h-6 w-6" />
            <span className="text-xl font-bold">Supply Chain Tracker</span>
          </Link>

          {/* Navigation */}
          {isConnected && (
            <nav className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => {
                if (!item.show) return null;
                
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary ${
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Wallet Info */}
          <div className="flex items-center space-x-4">
            {isConnected && address ? (
              <>
                {/* User Status */}
                {user && (
                  <div className="hidden md:flex flex-col items-end text-sm">
                    <span className="text-muted-foreground">{user.role}</span>
                    <span className={getUserStatusColor(user.status)}>
                      {getUserStatusName(user.status)}
                    </span>
                  </div>
                )}

                {/* Address */}
                <div className="flex items-center space-x-2 px-3 py-2 rounded-md bg-secondary">
                  <Wallet className="h-4 w-4" />
                  <span className="text-sm font-mono">{shortenAddress(address)}</span>
                </div>

                {/* Disconnect */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  className="hidden md:flex"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Desconectar
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2 px-3 py-2 rounded-md bg-secondary text-muted-foreground">
                <Wallet className="h-4 w-4" />
                <span className="text-sm">No conectado</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isConnected && (
          <nav className="md:hidden mt-4 flex items-center space-x-4 overflow-x-auto">
            {navigation.map((item) => {
              if (!item.show) return null;
              
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 text-sm font-medium whitespace-nowrap px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            {/* Disconnect button for mobile */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              className="flex items-center space-x-2 whitespace-nowrap"
            >
              <LogOut className="h-4 w-4" />
              <span>Desconectar</span>
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}

