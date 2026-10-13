import React from 'react';
import { LayoutDashboard, Package, ArrowDownToLine, ArrowUpFromLine, BarChart3, Users } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lowStockCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  lowStockCount
}) => {
  const tabs = [
    {
      id: 'dashboard',
      label: 'ภาพรวม',
      icon: LayoutDashboard,
      badge: lowStockCount > 0 ? lowStockCount : null
    },
    {
      id: 'stock',
      label: 'สต็อก',
      icon: Package
    },
    {
      id: 'in',
      label: 'รับเข้า',
      icon: ArrowDownToLine
    },
    {
      id: 'out',
      label: 'เบิกจ่าย',
      icon: ArrowUpFromLine
    },
    {
      id: 'partners',
      label: 'คู่ค้า',
      icon: Users
    },
    {
      id: 'reports',
      label: 'รายงาน',
      icon: BarChart3
    }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe transition-colors">
      <div className="grid grid-cols-6 items-center h-16 max-w-lg mx-auto px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center min-h-[44px] py-1 transition-all ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium tracking-tight ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
