from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io

app = FastAPI()

# Cho phép React (cổng 3000) gọi sang Python (cổng 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ecosan-ai.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load mô hình đã train
model = YOLO("best.pt") 

# Từ điển chứa thông tin hướng dẫn dựa trên nhãn từ data.yaml
WASTE_INFO = {
    "ABS": {"nameVi": "Nhựa ABS", "binColor": "blue", "binName": "Thùng Xanh Dương (Rác tái chế)", "steps": ["Làm sạch", "Bỏ vào thùng"]},
    "Aluminium": {"nameVi": "Nhôm", "binColor": "blue", "binName": "Thùng Xanh Dương (Rác tái chế)", "steps": ["Súc sạch", "Ép dẹt", "Bỏ vào thùng"]},
    "Baterai": {"nameVi": "Pin (Rác nguy hại)", "binColor": "red", "binName": "Thùng Đỏ (Rác nguy hại)", "steps": ["Dán băng dính 2 đầu cực", "Bỏ vào hộp kín", "Mang đến điểm thu gom"]},
    "Besi": {"nameVi": "Sắt/Kim loại", "binColor": "blue", "binName": "Thùng Xanh Dương (Rác tái chế)", "steps": ["Bỏ vào thùng tái chế"]},
    "Fabris": {"nameVi": "Vải/Sợi vải", "binColor": "gray", "binName": "Thùng Xám (Rác còn lại)", "steps": ["Gói gọn", "Bỏ vào thùng"]},
    "HDPE": {"nameVi": "Nhựa HDPE", "binColor": "blue", "binName": "Thùng Xanh Dương (Rác tái chế)", "steps": ["Làm sạch", "Bỏ vào thùng"]},
    "Kabel": {"nameVi": "Dây cáp điện", "binColor": "yellow", "binName": "Thùng Vàng (Rác điện tử)", "steps": ["Cuộn gọn", "Bỏ vào thùng"]},
    "Kaca": {"nameVi": "Thủy tinh", "binColor": "blue", "binName": "Thùng Xanh Dương (Rác tái chế)", "steps": ["Bọc giấy báo", "Bỏ vào thùng"]},
    "Karet": {"nameVi": "Cao su", "binColor": "gray", "binName": "Thùng Xám (Rác còn lại)", "steps": ["Bỏ vào thùng"]},
    "Kayu": {"nameVi": "Gỗ", "binColor": "gray", "binName": "Thùng Xám (Rác còn lại)", "steps": ["Bẻ nhỏ", "Bỏ vào thùng"]},
    "Keramik": {"nameVi": "Gốm sứ", "binColor": "gray", "binName": "Thùng Xám (Rác còn lại)", "steps": ["Gói cẩn thận", "Bỏ vào thùng"]},
    "Kertas": {"nameVi": "Giấy", "binColor": "blue", "binName": "Thùng Xanh Dương (Rác tái chế)", "steps": ["Gấp gọn", "Giữ khô", "Bỏ vào thùng"]},
    "LDPE": {"nameVi": "Nhựa LDPE (Túi nilon)", "binColor": "blue", "binName": "Thùng Xanh Dương (Rác tái chế)", "steps": ["Làm sạch", "Bỏ vào thùng"]},
    "Organik": {"nameVi": "Rác hữu cơ", "binColor": "green", "binName": "Thùng Xanh Lá (Rác hữu cơ)", "steps": ["Để ráo nước", "Bỏ vào thùng ủ phân"]},
    "PCB": {"nameVi": "Bo mạch điện tử", "binColor": "yellow", "binName": "Thùng Vàng (Rác điện tử)", "steps": ["Mang đến điểm thu gom rác điện tử"]},
    "PET": {"nameVi": "Nhựa PET", "binColor": "blue", "binName": "Thùng Xanh Dương (Rác tái chế)", "steps": ["Làm sạch", "Bóp bẹp", "Bỏ vào thùng"]},
    "PP": {"nameVi": "Nhựa PP", "binColor": "blue", "binName": "Thùng Xanh Dương (Rác tái chế)", "steps": ["Làm sạch", "Bỏ vào thùng"]},
    "PS": {"nameVi": "Nhựa PS (Xốp)", "binColor": "gray", "binName": "Thùng Xám (Rác còn lại)", "steps": ["Bóp nhỏ", "Bỏ vào thùng"]},
    "PVC": {"nameVi": "Nhựa PVC", "binColor": "blue", "binName": "Thùng Xanh Dương (Rác tái chế)", "steps": ["Bỏ vào thùng tái chế"]},
    "SAN": {"nameVi": "Nhựa SAN", "binColor": "blue", "binName": "Thùng Xanh Dương (Rác tái chế)", "steps": ["Làm sạch", "Bỏ vào thùng"]}
}



@app.post("/api/predict")
async def predict(file: UploadFile = File(...)):
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data))
    
    results = model(image)
    boxes = results[0].boxes
    
    detected_items = [] # Mảng chứa nhiều kết quả
    
    if len(boxes) > 0:
        for box in boxes:
            confidence = float(box.conf[0])
            if confidence < 0.5: # Bỏ qua nếu AI đoán mò (độ tin cậy < 50%)
                continue
                
            class_id = int(box.cls[0])
            class_name = model.names[class_id]
            
            info = WASTE_INFO.get(class_name, {})
            
            detected_items.append({
                "itemName": class_name.capitalize(),
                "category": class_name,
                "categoryNameVi": info.get("nameVi", class_name),
                "confidence": round(confidence, 2),
                "binColor": info.get("binColor", "gray"),
                "binNameVi": info.get("binName", "Thùng rác"),
                "disposalSteps": info.get("steps", []),
            })
    
    if len(detected_items) == 0:
        return {"error": "Không tìm thấy vật thể nào rõ ràng trong ảnh"}

    # Trả về danh sách các vật thể tìm thấy
    return {
        "count": len(detected_items),
        "items": detected_items
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)