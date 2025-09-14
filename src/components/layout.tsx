/**
 * Modern layout component with dark mode support
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { 
  Shield, 
  FileText, 
  Key, 
  Play, 
  Layers, 
  BarChart3,
  Menu,
  X,
  Sun,
  Moon,
  Zap
} from 'lucide-react';
import { useTheme } from './theme-provider';

const navigation = [
  { name: 'File Vault', href: '/', icon: FileText, description: 'Encrypt files with drag & drop' },
  { name: 'Password Manager', href: '/password-manager', icon: Key, description: 'Secure password storage' },
  { name: 'Crypto Playground', href: '/playground', icon: Play, description: 'Interactive learning' },
  { name: 'Hybrid Demo', href: '/hybrid', icon: Layers, description: 'Multi-layer encryption' },
  { name: 'Performance', href: '/performance', icon: BarChart3, description: 'Benchmark analysis' },
];

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Mobile sidebar */}
      <div className={clsx(
        'fixed inset-0 z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-600/80 backdrop-blur-sm dark:bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-gray-900 dark:text-gray-100" />
            </button>
          </div>
          <div className="flex h-0 flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Quantum Cryption</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Educational Demo</p>
                </div>
              </div>
            </div>
            <nav className="mt-8 flex-1 space-y-2 px-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      'group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className={clsx(
                      'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                      isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-accent-foreground'
                    )} />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs opacity-75">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-card border-r border-border">
          <div className="flex flex-1 flex-col overflow-y-auto pt-6 pb-4">
            <div className="flex flex-shrink-0 items-center px-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary rounded-xl shadow-lg">
                  <Shield className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-foreground">Quantum Cryption</span>
                  <p className="text-sm text-muted-foreground">Educational Crypto Demo</p>
                </div>
              </div>
            </div>
            <nav className="mt-8 flex-1 space-y-2 px-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg transform scale-105'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground hover:transform hover:scale-105'
                    )}
                  >
                    <Icon className={clsx(
                      'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                      isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-accent-foreground'
                    )} />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs opacity-75">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-card/80 backdrop-blur-md border-b border-border lg:hidden">
          <button
            type="button"
            className="border-r border-border px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-ring lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-center px-4 sm:px-6 lg:px-8">
            <div className="flex flex-shrink-0 items-center">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-primary rounded-lg">
                  <Shield className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">Quantum Cryption</span>
              </div>
            </div>
          </div>
          <div className="flex items-center px-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-accent transition-colors duration-200"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Desktop top bar */}
        <div className="hidden lg:flex h-16 flex-shrink-0 bg-card/80 backdrop-blur-md border-b border-border items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Experimental QES-512 Demo</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-accent transition-all duration-200 transform hover:scale-105"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Warning banner */}
              <div className="mb-8 rounded-xl bg-warning-50 border border-warning-200 p-6 dark:bg-warning-900/20 dark:border-warning-800 animate-slide-up">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Shield className="h-6 w-6 text-warning-600 dark:text-warning-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-warning-800 dark:text-warning-200">
                      ⚠️ Educational Use Only
                    </h3>
                    <div className="mt-2 text-sm text-warning-700 dark:text-warning-300">
                      <p>
                        This application demonstrates experimental QES (Quantum Encryption Standard) 
                        for research and educational purposes only. QES is not an officially recognized 
                        cryptographic standard. Do not use for production or real-world sensitive data.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="animate-fade-in">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
