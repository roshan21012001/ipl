'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  description: string;
}

const navigation: NavItem[] = [
  {
    name: 'Points Table',
    href: '/points-table',
    icon: '🏆',
    description: 'Team standings and rankings'
  },
  {
    name: 'Schedule',
    href: '/schedule',
    icon: '📅',
    description: 'Upcoming and completed matches'
  },
  {
    name: 'Dashboard',
    href: '/',
    icon: '📊',
    description: 'Overview and API endpoints'
  }
];

export default function SideNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white p-2 rounded-md shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <span className="sr-only">Open sidebar</span>
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-white shadow-xl border-r border-gray-200 z-50
          transform transition-transform duration-300 ease-in-out
          w-64
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🏏</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">IPL 2025</h2>
              <p className="text-sm text-gray-500">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Live IPL Data
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Real-time updates
            </p>
          </div>
        </div>
      </div>

      {/* Content spacer for desktop */}
      <div className="hidden lg:block w-64 flex-shrink-0"></div>
    </>
  );
}