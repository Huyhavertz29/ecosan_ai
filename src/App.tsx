import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { WasteScanner } from './components/WasteScanner';
import { ClassificationResultCard } from './components/ClassificationResultCard';
import { WasteAnalyticsDashboard } from './components/WasteAnalyticsDashboard';
import { WasteGuidebook } from './components/WasteGuidebook';
import { AiAssistantModal } from './components/AiAssistantModal';
import { WasteClassificationResult, WasteLogRecord } from './types/waste';
import { X, Sparkles, Check, ArrowUpRight } from 'lucide-react';

const THEME_KEY = 'ecoscan_theme';

export default function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'analytics' | 'guide' | 'assistant'>('scanner');
  const [isDark, setIsDark] = useState<boolean>(() => localStorage.getItem(THEME_KEY) === 'dark');

  // State lấy dữ liệu từ API 
  const [records, setRecords] = useState<WasteLogRecord[]>([]);
  
  // SỬA ĐỔI: Dùng mảng (array) thay vì 1 object đơn lẻ
  const [currentResults, setCurrentResults] = useState<WasteClassificationResult[]>([]);
  
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [modalRecord, setModalRecord] = useState<WasteLogRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Fetch dữ liệu từ Server khi mở App
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('https://ecosan-ai.vercel.app/api/logs');
        if (res.ok) {
          const data = await res.json();
          setRecords(data);
          // Nếu có dữ liệu cũ, lấy cái mới nhất hiển thị lên màn hình chính
          if (data.length > 0) setCurrentResults([data[0]]); 
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
      }
    };
    fetchLogs();
  }, []);

  // 2. Xử lý Theme Sáng/Tối
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [isDark]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((curr) => (curr === msg ? null : curr)), 3000);
  };

  // 3. Hàm lưu xuống Database
  const saveToDB = async (record: WasteLogRecord) => {
    try {
      const res = await fetch('https://ecosan-ai.vercel.appx`/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      if (res.ok) {
        setRecords((prev) => [record, ...prev]);
      } else {
        showToast('Lỗi khi lưu vào cơ sở dữ liệu');
      }
    } catch (error) {
      console.error(error);
      showToast('Lỗi kết nối máy chủ');
    }
  };

  // 4. Xử lý khi AI phân loại xong (Chỉ 1 kết quả)
  const handleClassified = (result: WasteClassificationResult) => {
     setCurrentResults([result]);
     showToast(`Đã nhận diện: ${result.itemName}. Hãy kiểm tra và bấm Lưu!`);
  };

  // 4.1. Xử lý khi AI phân loại xong (Nhiều kết quả)
  const handleClassifiedMultiple = (results: WasteClassificationResult[]) => {
    setCurrentResults(results);
    showToast(`Đã nhận diện được ${results.length} món rác!`);
  };

  // 5. Lưu thủ công (nếu người dùng chỉnh sửa khối lượng)
  const handleSaveToLog = (result: WasteClassificationResult, customWeight?: number) => {
    const newLog: WasteLogRecord = {
      ...result,
      estimatedWeightGrams: customWeight || result.estimatedWeightGrams,
      loggedAt: new Date().toISOString(),
    };
    saveToDB(newLog);
    showToast('Đã lưu thành công vào dữ liệu thống kê!');
  };

  // 6. Xóa 1 record
  const handleDeleteRecord = async (id: string) => {
    try {
      const res = await fetch(`https://ecosan-ai.vercel.app/api/logs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
        showToast('Đã xóa khỏi nhật ký.');
      }
    } catch (error) {
      showToast('Lỗi khi xóa');
    }
  };

  // 7. Xóa toàn bộ
  const handleClearAllRecords = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu lịch sử không?')) {
      try {
        const res = await fetch('https://ecosan-ai.vercel.app/api/logs', { method: 'DELETE' });
        if (res.ok) {
          setRecords([]);
          showToast('Đã xóa toàn bộ dữ liệu.');
        }
      } catch (error) {
        showToast('Lỗi khi xóa');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        onQuickScanClick={() => {
          setActiveTab('scanner');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {activeTab === 'scanner' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-emerald-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
              <div className="relative z-10 space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-300">
                  <Sparkles className="w-4 h-4" />
                  <span></span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  Chụp Ảnh Rác — AI Phân Loại & Hướng Dẫn Tái Chế
                </h1>
                <p className="text-sm text-emerald-100 leading-relaxed">
                  Nhận diện chính xác từng lớp vật liệu polymer, kim loại, hữu cơ, chấm điểm mức độ tái chế
                  và quy định màu thùng rác chuẩn theo Luật Môi trường Việt Nam.
                </p>
              </div>

              <div className="relative z-10 flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Xem Thống Kê ({records.length} món)</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* TRUYỀN THÊM HÀM onClassifiedMultiple VÀO ĐÂY */}
            <WasteScanner
              onClassified={handleClassified}
              onClassifiedMultiple={handleClassifiedMultiple} 
              isScanning={isScanning}
              setIsScanning={setIsScanning}
            />

            {/* SỬA ĐỔI: Duyệt qua mảng currentResults để hiển thị nhiều thẻ */}
            {currentResults.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Kết Quả Phân Tích ({currentResults.length} món)
                </div>
                {currentResults.map((result, index) => (
                  <ClassificationResultCard
                    key={index}
                    result={result}
                    onSaveToLog={handleSaveToLog}
                    isSaved={records.some((r) => r.id === result.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <WasteAnalyticsDashboard
            records={records}
            onDeleteRecord={handleDeleteRecord}
            onClearAllRecords={handleClearAllRecords}
            onSelectRecordForDetail={(rec) => setModalRecord(rec)}
          />
        )}

        {activeTab === 'guide' && <WasteGuidebook />}
        {activeTab === 'assistant' && <AiAssistantModal />}
      </main>

      {modalRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl my-8">
            <button
              onClick={() => setModalRecord(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-slate-300 rounded-full bg-black/40 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <ClassificationResultCard
              result={modalRecord}
              onSaveToLog={() => setModalRecord(null)}
              isSaved={true}
            />
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-auto py-6 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">EcoScan AI</span>
            <span>·</span>
            <span>Ứng dụng phân loại rác thông minh & Kinh tế tuần hoàn</span>
          </div>
          <div>Theo quy chuẩn Luật Bảo vệ Môi trường Việt Nam</div>
        </div>
      </footer>
    </div>
  );
}