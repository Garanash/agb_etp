'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  FileText, 
  ClipboardList, 
  HelpCircle,
  BarChart3
} from 'lucide-react';

interface SupplierNavigationProps {
  className?: string;
}

export default function SupplierNavigation({ className = '' }: SupplierNavigationProps) {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Тендеры для участия',
      href: '/supplier/tenders',
      icon: Building2,
      description: 'Просмотр и подача заявок на тендеры'
    },
    {
      name: 'Мои предложения',
      href: '/supplier/proposals',
      icon: FileText,
      description: 'Управление отправленными предложениями'
    },
    {
      name: 'Как подать заявку',
      href: '/supplier/application-guide',
      icon: HelpCircle,
      description: 'Пошаговое руководство'
    }
  ];

  return (
    <nav className={`bg-white shadow-sm border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className={`mr-2 h-4 w-4 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                <div>
                  <div>{item.name}</div>
                  <div className="text-xs text-gray-400 group-hover:text-gray-500">
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
