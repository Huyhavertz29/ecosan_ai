import React from 'react';
import { Camera, BarChart3, BookOpen, MessageSquareText, Leaf, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  activeTab: 'scanner' | 'analytics' | 'guide' | 'assistant';
  onSelectTab: (tab: 'scanner' | 'analytics' | 'guide' | 'assistant') => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onQuickScanClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  isDark,
  onToggleTheme,
  onQuickScanClick,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <button
            onClick={() => onSelectTab('scanner')}
            className="flex items-center gap-2.5 text-left focus:outline-none group shrink-0"
            aria-label="Trang chủ EcoScan AI"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm group-hover:bg-emerald-700 transition-colors">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap block">
                EcoScan AI
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Phân Loại Rác Thông Minh
              </span>
            </div>
          </button>

          {/* Zone 2: 4 clean single-line navigation links */}
          <nav className="flex items-center gap-1 sm:gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => onSelectTab('scanner')}
              className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'scanner'
                  ? 'text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Quét & Nhận Diện</span>
            </button>

            <button
              onClick={() => onSelectTab('analytics')}
              className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'analytics'
                  ? 'text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Thống Kê Xu Hướng</span>
            </button>

            <button
              onClick={() => onSelectTab('guide')}
              className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'guide'
                  ? 'text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline">Quy Chuẩn Thùng Rác</span>
              <span className="md:hidden">Quy Chuẩn</span>
            </button>

            <button
              onClick={() => onSelectTab('assistant')}
              className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'assistant'
                  ? 'text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquareText className="w-4 h-4" />
              <span className="hidden sm:inline">Hỏi Đáp AI</span>
              <span className="sm:hidden">Hỏi AI</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action & Theme toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onToggleTheme}
              aria-label={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onQuickScanClick}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 active:scale-95 transition-all shadow-sm whitespace-nowrap shrink-0"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Chụp Ảnh Ngay</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
