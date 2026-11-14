import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Trash2,
  Recycle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface LookupItem {
  name: string;
  category: string;
  binColor: string;
  binName: string;
  canRecycle: boolean;
  instruction: string;
}

const COMMON_LOOKUP_ITEMS: LookupItem[] = [
  {
    name: 'Chai nước ngọt bằng nhựa PET',
    category: 'Nhựa Tái Chế',
    binColor: 'bg-blue-600',
    binName: 'Thùng Xanh Dương / Trắng',
    canRecycle: true,
    instruction: 'Đổ hết nước, súc sơ, bóc nhãn và bóp bẹp thân chai trước khi bỏ vào thùng.',
  },
  {
    name: 'Can nhựa đựng nước giặt, dầu ăn (HDPE)',
    category: 'Nhựa Tái Chế',
    binColor: 'bg-blue-600',
    binName: 'Thùng Xanh Dương / Trắng',
    canRecycle: true,
    instruction: 'Súc sạch dầu mỡ bên trong, để khô và bỏ vào thùng tái chế.',
  },
  {
    name: 'Hộp nhựa đựng thực phẩm (PP)',
    category: 'Nhựa Tái Chế',
    binColor: 'bg-blue-600',
    binName: 'Thùng Xanh Dương / Trắng',
    canRecycle: true,
    instruction: 'Rửa sạch thức ăn thừa, tháo rời nắp và bỏ vào thùng.',
  },
  {
    name: 'Vỏ lon bia, nước ngọt bằng nhôm',
    category: 'Kim Loại',
    binColor: 'bg-blue-600',
    binName: 'Thùng Xanh Dương / Trắng',
    canRecycle: true,
    instruction: 'Dẫm bẹp để tiết kiệm diện tích. Nhôm tái chế được vô hạn lần.',
  },
  {
    name: 'Hộp bánh pizza dính nhiều dầu mỡ',
    category: 'Rác Còn Lại',
    binColor: 'bg-slate-700',
    binName: 'Thùng Xám / Đen',
    canRecycle: false,
    instruction: 'Dầu mỡ làm hỏng máy nghiền bột giấy. Nếu nắp hộp sạch, có thể cắt nắp làm rác tái chế, phần dính dầu mỡ bỏ rác còn lại.',
  },
  {
    name: 'Pin tiểu, pin đồng hồ, ắc quy cũ (Baterai)',
    category: 'Rác Nguy Hại',
    binColor: 'bg-rose-600',
    binName: 'Thùng Đỏ / Điểm Thu Gom Pin',
    canRecycle: false,
    instruction: 'Dán băng keo 2 đầu cực, đựng vào hũ kín và mang đến siêu thị hoặc trạm thu pin. Tuyệt đối không vứt chung rác sinh hoạt.',
  },
  {
    name: 'Dây cáp điện, dây sạc hỏng (Kabel)',
    category: 'Rác Điện Tử',
    binColor: 'bg-yellow-500',
    binName: 'Thùng Vàng / Điểm Thu Gom Điện Tử',
    canRecycle: true,
    instruction: 'Cuộn gọn gàng, cột chặt và mang đến các điểm thu gom rác điện tử (như Việt Nam Tái Chế).',
  },
  {
    name: 'Bo mạch máy tính, điện thoại (PCB)',
    category: 'Rác Điện Tử',
    binColor: 'bg-yellow-500',
    binName: 'Thùng Vàng / Điểm Thu Gom Điện Tử',
    canRecycle: true,
    instruction: 'Chứa kim loại quý và chất độc hại. Không bẻ gãy, mang đến trạm thu gom chuyên dụng.',
  },
  {
    name: 'Vỏ chuối, cuống rau, thức ăn thừa (Organik)',
    category: 'Rác Thực Phẩm / Hữu Cơ',
    binColor: 'bg-emerald-600',
    binName: 'Thùng Xanh Lá',
    canRecycle: true,
    instruction: 'Để ráo nước, không đựng trong bọc nilon khó phân hủy. Dùng ủ phân compost bón cây.',
  },
  {
    name: 'Hộp xốp đựng cơm (PS)',
    category: 'Rác Còn Lại',
    binColor: 'bg-slate-700',
    binName: 'Thùng Xám / Đen',
    canRecycle: false,
    instruction: 'Xốp bẩn dính dầu mỡ rất khó tái chế. Bóp nhỏ và bỏ vào thùng rác còn lại.',
  },
  {
    name: 'Bóng đèn huỳnh quang, compact hư',
    category: 'Rác Nguy Hại',
    binColor: 'bg-rose-600',
    binName: 'Thùng Đỏ / Điểm Nguy Hại',
    canRecycle: false,
    instruction: 'Chứa hơi thủy ngân độc hại. Tuyệt đối bọc giấy chống vỡ và chuyển cho trạm rác nguy hại chuyên trách.',
  },
  {
    name: 'Mảnh bát đĩa gốm sứ vỡ (Keramik)',
    category: 'Rác Còn Lại',
    binColor: 'bg-slate-700',
    binName: 'Thùng Xám / Đen',
    canRecycle: false,
    instruction: 'Gốm sứ nung ở nhiệt độ cao không tan chảy. Gói kỹ bằng giấy báo trước khi vứt để bảo vệ nhân viên vệ sinh.',
  },
  {
    name: 'Túi ni-lông mỏng bẩn, khăn ướt, tã em bé',
    category: 'Rác Còn Lại',
    binColor: 'bg-slate-700',
    binName: 'Thùng Xám / Đen',
    canRecycle: false,
    instruction: 'Không thể tái chế kinh tế, bỏ vào thùng rác chuyển đi bãi chôn lấp hoặc nhà máy đốt phát điện.',
  },
];

export const WasteGuidebook: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = COMMON_LOOKUP_ITEMS.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.instruction.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Introduction Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          <BookOpen className="w-4 h-4" />
          <span>Quy Định Pháp Luật & Hướng Dẫn Kỹ Thuật</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Sổ Tay Quy Chuẩn Phân Loại Rác Tại Nguồn Việt Nam
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          Theo Điều 75 và Điều 79 Luật Bảo vệ Môi trường 2020 (có hiệu lực triển khai đồng bộ từ 2024 - 2025),
          chất thải rắn sinh hoạt từ hộ gia đình và cá nhân bắt buộc phải được phân loại thành 3 nhóm cơ bản
          kèm theo nhóm rác nguy hại và rác cồng kềnh.
        </p>
      </div>

      {/* 4 Standard Bins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Bin 1: Recyclables */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="p-5 bg-blue-600 text-white">
            <div className="text-xs font-semibold uppercase tracking-wider opacity-85">
              Nhóm 1
            </div>
            <div className="text-xl font-bold mt-1">Rác Tái Chế</div>
            <div className="text-xs opacity-90 mt-1">Thùng Xanh Dương hoặc Trắng</div>
          </div>
          <div className="p-5 space-y-3 text-xs text-slate-600 dark:text-slate-300 flex-1">
            <div className="font-semibold text-slate-900 dark:text-white">Bao gồm:</div>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Giấy báo, thùng carton, sách vở sạch</li>
              <li>Chai nhựa PET, can nhựa HDPE, hộp nhựa PP</li>
              <li>Vỏ lon nhôm, hộp thiếc kim loại, sắt vụn</li>
              <li>Chai lọ thủy tinh nguyên vẹn</li>
            </ul>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-blue-700 dark:text-blue-400 font-medium">
              Yêu cầu: Làm sạch cặn bẩn, phơi khô, bóp bẹp.
            </div>
          </div>
        </div>

        {/* Bin 2: Organic */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="p-5 bg-emerald-600 text-white">
            <div className="text-xs font-semibold uppercase tracking-wider opacity-85">
              Nhóm 2
            </div>
            <div className="text-xl font-bold mt-1">Rác Thực Phẩm / Hữu Cơ</div>
            <div className="text-xs opacity-90 mt-1">Thùng Xanh Lá Cây</div>
          </div>
          <div className="p-5 space-y-3 text-xs text-slate-600 dark:text-slate-300 flex-1">
            <div className="font-semibold text-slate-900 dark:text-white">Bao gồm:</div>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Thức ăn thừa, cơm, bún, bánh mì</li>
              <li>Rau củ quả, vỏ hoa quả, cuống lá (Organik)</li>
              <li>Bã trà, bã cà phê, vỏ trứng</li>
              <li>Xương nhỏ của cá, gia cầm</li>
            </ul>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              Yêu cầu: Để ráo nước, không bọc túi nilon thường.
            </div>
          </div>
        </div>

        {/* Bin 3: Residual */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="p-5 bg-slate-700 text-white">
            <div className="text-xs font-semibold uppercase tracking-wider opacity-85">
              Nhóm 3
            </div>
            <div className="text-xl font-bold mt-1">Rác Còn Lại / Vô Cơ</div>
            <div className="text-xs opacity-90 mt-1">Thùng Xám hoặc Đen</div>
          </div>
          <div className="p-5 space-y-3 text-xs text-slate-600 dark:text-slate-300 flex-1">
            <div className="font-semibold text-slate-900 dark:text-white">Bao gồm:</div>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Túi ni-lông mỏng bẩn, màng bọc thực phẩm</li>
              <li>Hộp xốp đựng cơm dính dầu mỡ (PS)</li>
              <li>Tã giấy bỉm, băng vệ sinh, khăn ướt</li>
              <li>Mảnh sành sứ (Keramik), cao su (Karet), tàn thuốc lá</li>
            </ul>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 font-medium">
              Chuyển đi chôn lấp hợp vệ sinh hoặc thiêu đốt.
            </div>
          </div>
        </div>

        {/* Bin 4: Hazardous & Electronic */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between">
          <div className="p-5 bg-rose-600 text-white">
            <div className="text-xs font-semibold uppercase tracking-wider opacity-85">
              Nhóm 4
            </div>
            <div className="text-xl font-bold mt-1">Nguy Hại & Điện Tử</div>
            <div className="text-xs opacity-90 mt-1">Thùng Đỏ / Vàng / Trạm Thu Gom</div>
          </div>
          <div className="p-5 space-y-3 text-xs text-slate-600 dark:text-slate-300 flex-1">
            <div className="font-semibold text-slate-900 dark:text-white">Bao gồm:</div>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Pin tiểu, ắc quy xe máy, pin lithium (Baterai)</li>
              <li>Bóng đèn huỳnh quang, nhiệt kế thủy ngân</li>
              <li>Dây cáp điện (Kabel), bo mạch (PCB)</li>
              <li>Chai xịt muỗi, vỏ thuốc trừ sâu, sơn</li>
            </ul>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-rose-700 dark:text-rose-400 font-medium">
              Tuyệt đối không vứt chung rác sinh hoạt!
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Quick Lookup Tool */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Tra Cứu Nhanh Món Đồ Gia Dụng Thường Gặp
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gõ tên bất kỳ đồ vật nào để biết ngay màu thùng rác và hướng dẫn xử lý
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ví dụ: vỏ hộp pizza, pin, bát vỡ..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredItems.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-3.5"
            >
              <div
                className={`w-3 h-3 rounded-full shrink-0 mt-1.5 ${item.binColor}`}
              />
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-xs text-slate-900 dark:text-white">
                    {item.name}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.canRecycle
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {item.canRecycle ? 'Tái chế được' : 'Không tái chế'}
                  </span>
                </div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {item.binName} · {item.category}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                  {item.instruction}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};