import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  SwitchCamera,
  X,
  FileImage,
} from 'lucide-react';
import { WasteClassificationResult } from '../types/waste';

interface Props {
  onClassified: (result: WasteClassificationResult, previewUrl?: string) => void;
  onClassifiedMultiple: (results: WasteClassificationResult[]) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
}

interface SampleItem {
  id: string;
  name: string;
  categoryName: string;
  type: string;
  imageUrl?: string;
  hint: string;
}

const SAMPLE_ITEMS: SampleItem[] = [
  {
    id: 's_bottle',
    name: 'Chai nước khoáng PET',
    categoryName: 'Rác Tái Chế',
    type: 'recyclable',
    imageUrl: '/src/assets/images/sample_plastic_bottle_1794417877390.jpg',
    hint: 'Chai nhựa nước khoáng PET trong suốt có nắp xanh',
  },
  {
    id: 's_can',
    name: 'Lon nhôm nước ngọt',
    categoryName: 'Rác Tái Chế',
    type: 'recyclable',
    imageUrl: '/src/assets/images/sample_aluminum_can_1794417878023.jpg',
    hint: 'Lon nhôm đồ uống Fresh Fizz đã sử dụng',
  },
  {
    id: 's_carton',
    name: 'Vỏ hộp sữa Tetra Pak',
    categoryName: 'Rác Tái Chế',
    type: 'recyclable',
    imageUrl: '/src/assets/images/sample_milk_carton_1794417878436.jpg',
    hint: 'Hộp sữa giấy 6 lớp Tetra Pak gấp phẳng',
  },
  {
    id: 's_battery',
    name: 'Chai thủy tinh',
    categoryName: 'Rác tái chế',
    type: 'recyclable',
    hint: 'Chai đựng chất lỏng sau khi đã sử dụng',
    imageUrl: '/src/assets/images/Screenshot 2026-11-12 153050.png',
  },
  {
    id: 's_banana',
    name: 'Vỏ chuối hữu cơ',
    categoryName: 'Rác Hữu Cơ',
    type: 'organic',
    hint: 'Vỏ chuối chín vàng thức ăn thừa hữu cơ',
  },
  {
    id: 's_styro',
    name: 'Hộp xốp dính dầu mỡ',
    categoryName: 'Rác Còn Lại',
    type: 'residual',
    hint: 'Hộp xốp đựng cơm văn phòng dính mỡ dầu bẩn',
  },
];

export const WasteScanner: React.FC<Props> = ({
  onClassified,
  onClassifiedMultiple,
  isScanning,
  setIsScanning,
}) => {
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [customHint, setCustomHint] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      setCameraError('Không thể mở camera. Bạn có thể tải ảnh lên hoặc chọn mẫu thử nghiệm bên dưới.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (mode === 'camera') startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [mode, facingMode]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPreviewImage(dataUrl);
    analyzeImage(dataUrl, 'image/jpeg');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreviewImage(result);
      analyzeImage(result, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64Data?: string, mimeType?: string, hint?: string) => {
    if (!base64Data && !hint) return;
    setIsScanning(true);
    try {
      if (base64Data) {
        const blob = await (await fetch(base64Data)).blob();
        const formData = new FormData();
        formData.append("file", blob, "image.jpg");

        const res = await fetch('http://localhost:8000/api/predict', {
          method: 'POST',
          body: formData,
        });
        
        if (!res.ok) throw new Error('Lỗi máy chủ AI');
        const data = await res.json();
        
        if (data.error) {
          alert(data.error);
          setPreviewImage(null);
          return;
        }

        // --- BẢNG MAP 20 NHÃN MỚI ---
        const categoryMap: Record<string, string> = {
          'ABS': 'recyclable', 'Aluminium': 'recyclable', 'Baterai': 'hazardous',
          'Besi': 'recyclable', 'Fabris': 'residual', 'HDPE': 'recyclable',
          'Kabel': 'electronic', 'Kaca': 'recyclable', 'Karet': 'residual',
          'Kayu': 'residual', 'Keramik': 'residual', 'Kertas': 'recyclable',
          'LDPE': 'recyclable', 'Organik': 'organic', 'PCB': 'electronic',
          'PET': 'recyclable', 'PP': 'recyclable', 'PS': 'residual',
          'PVC': 'recyclable', 'SAN': 'recyclable'
        };

        const vnNameMap: Record<string, string> = {
          'ABS': 'Nhựa ABS', 'Aluminium': 'Nhôm', 'Baterai': 'Pin',
          'Besi': 'Sắt/Kim loại', 'Fabris': 'Vải/Sợi vải', 'HDPE': 'Nhựa HDPE',
          'Kabel': 'Dây cáp điện', 'Kaca': 'Thủy tinh', 'Karet': 'Cao su',
          'Kayu': 'Gỗ', 'Keramik': 'Gốm sứ', 'Kertas': 'Giấy',
          'LDPE': 'Nhựa LDPE', 'Organik': 'Rác hữu cơ', 'PCB': 'Bo mạch điện tử',
          'PET': 'Nhựa PET', 'PP': 'Nhựa PP', 'PS': 'Nhựa PS',
          'PVC': 'Nhựa PVC', 'SAN': 'Nhựa SAN'
        };

        if (data.items && Array.isArray(data.items)) {
          const formattedResults: WasteClassificationResult[] = data.items.map((item: any) => {
            const rawClass = item.category; // Giữ nguyên chữ hoa/ thường
            const mappedCategory = categoryMap[rawClass] || 'residual';

            return {
              ...item,
              id: 'scan_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
              timestamp: new Date().toISOString(),
              imageUrl: base64Data,
              category: mappedCategory as any,
              categoryNameVi: item.categoryNameVi || vnNameMap[rawClass] || rawClass,
              primaryMaterial: vnNameMap[rawClass] || rawClass,
              materials: [{ name: vnNameMap[rawClass] || rawClass, percentage: 100, recyclability: 'high', notes: 'Nhận diện bởi YOLOv8' }],
              recyclabilityScore: mappedCategory === 'recyclable' ? 80 : 30,
              recyclabilityExplanation: 'Kết quả từ mô hình YOLOv8 tự huấn luyện.',
              decompositionTime: mappedCategory === 'recyclable' ? 'Hàng trăm năm' : 'Vài tuần',
              doNotDo: ['Không vứt bừa bãi'],
              upcyclingIdeas: ['Tái chế thành vật dụng mới'],
            };
          });
          onClassifiedMultiple(formattedResults);
        } 
        else {
          const rawClass = data.category;
          const mappedCategory = categoryMap[rawClass] || 'residual';

          const formattedData: WasteClassificationResult = {
            ...data,
            id: 'scan_' + Date.now(),
            timestamp: new Date().toISOString(),
            imageUrl: base64Data,
            category: mappedCategory as any,
            categoryNameVi: data.categoryNameVi || vnNameMap[rawClass] || rawClass,
            primaryMaterial: vnNameMap[rawClass] || rawClass,
            materials: [{ name: vnNameMap[rawClass] || rawClass, percentage: 100, recyclability: 'high', notes: 'Nhận diện bởi YOLOv8' }],
            recyclabilityScore: mappedCategory === 'recyclable' ? 80 : 30,
            recyclabilityExplanation: 'Kết quả từ mô hình YOLOv8 tự huấn luyện.',
            decompositionTime: mappedCategory === 'recyclable' ? 'Hàng trăm năm' : 'Vài tuần',
            doNotDo: ['Không vứt bừa bãi'],
            upcyclingIdeas: ['Tái chế thành vật dụng mới'],
          };
          onClassified(formattedData);
        }
      } else {
         alert("Chức năng nhận diện bằng text chưa được hỗ trợ khi dùng YOLO. Vui lòng tải ảnh lên!");
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi khi kết nối với Server AI. Hãy chắc chắn Server Python đang chạy ở cổng 8000!');
      setPreviewImage(null);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSampleClick = async (sample: SampleItem) => {
    setPreviewImage(sample.imageUrl || null);
    setCustomHint(sample.hint);
    if (sample.imageUrl) {
      try {
        const resp = await fetch(sample.imageUrl);
        const blob = await resp.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          analyzeImage(base64data, 'image/jpeg', sample.hint);
        };
        reader.readAsDataURL(blob);
      } catch (e) {
        alert("Không thể tải ảnh mẫu này!");
      }
    } else {
      alert("Mẫu này không có ảnh, YOLO không thể nhận diện. Vui lòng tải ảnh lên!");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button onClick={() => setMode('camera')} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${mode === 'camera' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}>Camera Trực Tiếp</button>
          <button onClick={() => setMode('upload')} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${mode === 'upload' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}>Tải Ảnh Lên</button>
        </div>
      </div>

      <div className="relative bg-slate-950 aspect-4/3 sm:aspect-16/9 max-h-[480px] w-full flex items-center justify-center overflow-hidden">
        {mode === 'camera' ? (
          <>
            {cameraActive ? (
              <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
            ) : (
              <div className="p-8 text-center text-slate-300 max-w-md">
                <Camera className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                <p className="text-sm text-slate-300 mb-4">{cameraError || 'Đang khởi động camera...'}</p>
                <button onClick={startCamera} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors">Thử Lại Camera</button>
              </div>
            )}
            {cameraActive && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8">
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 border-2 border-dashed border-emerald-400/70 rounded-2xl flex items-center justify-center">
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                  <span className="text-[11px] font-medium text-emerald-200 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">Đặt rác vào giữa khung hình</span>
                </div>
              </div>
            )}
            {cameraActive && (
              <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-6 px-4">
                <button onClick={toggleFacingMode} className="p-3 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors"><SwitchCamera className="w-5 h-5" /></button>
                <button onClick={captureSnapshot} disabled={isScanning} className="w-16 h-16 rounded-full bg-white hover:bg-slate-100 text-slate-900 flex items-center justify-center shadow-lg active:scale-95 transition-all p-1.5 ring-4 ring-white/30"><div className="w-full h-full rounded-full border-2 border-slate-900 flex items-center justify-center"><div className="w-6 h-6 rounded-full bg-emerald-600" /></div></button>
                <button onClick={() => setMode('upload')} className="p-3 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors"><Upload className="w-5 h-5" /></button>
              </div>
            )}
          </>
        ) : (
          <div onClick={() => fileInputRef.current?.click()} className="w-full h-full flex flex-col items-center justify-center p-8 text-center cursor-pointer border-2 border-dashed border-slate-700 hover:border-emerald-500 transition-colors">
            {previewImage ? (
              <div className="relative max-h-full max-w-full">
                <img src={previewImage} alt="Ảnh rác cần phân loại" referrerPolicy="no-referrer" className="max-h-[380px] object-contain rounded-lg shadow-md" />
                <button onClick={(e) => { e.stopPropagation(); setPreviewImage(null); }} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-full bg-slate-800 text-emerald-400 mx-auto flex items-center justify-center"><FileImage className="w-7 h-7" /></div>
                <div className="text-sm font-semibold text-white">Nhấp để tải ảnh rác hoặc kéo thả vào đây</div>
                <div className="text-xs text-slate-400">Hỗ trợ định dạng JPG, PNG, WEBP (tối đa 20MB)</div>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
          </div>
        )}

        {isScanning && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center z-20">
            <div className="relative w-20 h-20 flex items-center justify-center mb-4">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping" />
              <div className="absolute inset-2 rounded-full border-2 border-emerald-400 animate-spin" />
              <Sparkles className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="text-base font-bold text-white mb-1">AI Đang Phân Tích Hình Ảnh...</div>
            <div className="text-xs text-slate-400">YOLOv8 đang nhận diện vật thể</div>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">Hoặc chọn mẫu rác kiểm thử nhanh:</div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {SAMPLE_ITEMS.map((item) => (
            <button key={item.id} onClick={() => handleSampleClick(item)} disabled={isScanning} className="group p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left hover:border-emerald-500 dark:hover:border-emerald-500 transition-all shadow-xs flex flex-col justify-between">
              {item.imageUrl ? (
                <div className="w-full aspect-4/3 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 mb-2"><img src={item.imageUrl} alt={item.name} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" /></div>
              ) : (
                <div className="w-full aspect-4/3 rounded-lg bg-slate-100 dark:bg-slate-700 mb-2 flex items-center justify-center text-slate-400"><Sparkles className="w-5 h-5 text-emerald-500" /></div>
              )}
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{item.categoryName}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};