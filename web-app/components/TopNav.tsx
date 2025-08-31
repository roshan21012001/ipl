'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useYear } from '@/contexts/YearContext';
import { IPL_YEARS } from '@/utils/gradients';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  hasYearDropdown?: boolean; // New property to indicate if this nav item should have year functionality
}

const navigation: NavItem[] = [
  {
    name: 'Points Table',
    href: '/',
    icon: '🏆',
    hasYearDropdown: true
  },
  {
    name: 'Schedule',
    href: '/schedule',
    icon: '📅',
    hasYearDropdown: true
  },
  {
    name: 'Teams',
    href: '/teams',
    icon: '🏏',
    hasYearDropdown: false
  },
  {
    name: 'News',
    href: '/news',
    icon: '📰',
    hasYearDropdown: false
  }
];


export default function TopNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedYear, setSelectedYear } = useYear();
  const pathname = usePathname();
  const router = useRouter();

  const handleYearSelection = (year: number, targetPage: string) => {
    setSelectedYear(year);
    router.push(targetPage);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🏏</div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">IPL Dashboard</h2>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <div key={item.name} className="relative group">
                    <Link
                      href={item.href}
                      className={`
                        px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 relative flex items-center
                        ${isActive 
                          ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                      {item.hasYearDropdown && (
                        <svg className="ml-1 w-3 h-3 opacity-60" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </Link>
                    
                    {/* Dropdown menu - only show for items with year functionality */}
                    {item.hasYearDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="p-4">
                          <div className="text-sm text-gray-600 mb-3 border-b pb-2">
                            {item.name} - IPL {selectedYear}
                          </div>
                          
                          {/* Status indicators */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-xs text-gray-500">
                              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                              Live data updates
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                              Real-time scraping
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                              Official IPL source
                            </div>
                          </div>
                          
                          {/* Years selector */}
                          <div className="border-t pt-3">
                            <div className="text-xs text-gray-600 mb-2">Switch Year:</div>
                            <div className="grid grid-cols-6 gap-1 max-h-32 overflow-y-auto">
                              {IPL_YEARS.map((year) => (
                                <button
                                  key={year}
                                  onClick={() => handleYearSelection(year, item.href)}
                                  className={`
                                    px-2 py-1 rounded text-xs font-medium transition-all duration-200 hover:scale-105
                                    ${ selectedYear === year
                                      ? 'bg-orange-500 text-white shadow-sm'
                                      : 'text-gray-600 hover:bg-orange-50 hover:text-orange-700 border border-gray-200'
                                    }
                                  `}
                                >
                                  {year}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Year Selection Dropdown */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              >
                {IPL_YEARS.map((year) => (
                  <option key={year} value={year}>
                    IPL {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-gray-100 p-2 rounded-md text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      block px-3 py-2 rounded-md text-base font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name} {item.hasYearDropdown ? selectedYear : ''}
                  </Link>
                );
              })}
              
              {/* Mobile Year Dropdown */}
              <div className="pt-4 border-t border-gray-200 mt-4">
                <div className="px-3 py-2">
                  <label className="block text-sm text-gray-600 mb-2">Select Year:</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(Number(e.target.value));
                      setIsOpen(false);
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {IPL_YEARS.map((year) => (
                      <option key={year} value={year}>
                        IPL {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}