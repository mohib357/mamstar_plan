import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊', current: true },
    { name: 'Order Management', href: '/orders', icon: '📦', current: false },
    { name: 'Products', href: '/products', icon: '🛍️', current: false },
    { name: 'Customers', href: '/customers', icon: '👥', current: false },
    { name: 'Coupons', href: '/coupons', icon: '🎫', current: false },
    { name: 'SMS Promotion', href: '/sms', icon: '💬', current: false },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block md:w-64 bg-gray-800`}>
        <div className="flex items-center justify-center h-16 bg-gray-900">
          <span className="text-white text-xl font-bold">Admin Panel</span>
        </div>
        <nav className="mt-5 px-2 space-y-1">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`${
                item.current
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </a>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="sr-only">Open sidebar</span>
              ☰
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Welcome, <span className="font-medium text-gray-900">{user?.username}</span>
              </div>
              <button
                onClick={logout}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;