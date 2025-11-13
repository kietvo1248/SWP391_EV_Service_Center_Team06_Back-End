// Tệp: src/domain/entities/Vehicle.js

class Vehicle {
    constructor(data) {
        if (!data) {
             throw new Error("Vehicle data cannot be empty");
        }
        
        // Dữ liệu cấp 1
        this.id = data.id;
        this.vin = data.vin;
        this.year = data.year;
        this.licensePlate = data.licensePlate;
        this.color = data.color;
        this.ownerId = data.ownerId;
        this.currentMileage = data.currentMileage || 0;
        this.isDeleted = data.isDeleted;
        
        // --- SỬA LỖI: Đọc dữ liệu lồng nhau ---
        if (data.vehicleModel) {
            this.brand = data.vehicleModel.brand;
            this.model = data.vehicleModel.name;
        }
        
        if (data.battery) {
            this.batteryName = data.battery.name;
            this.batteryCapacity = data.battery.capacityKwh;
        }
        // --- KẾT THÚC SỬA LỖI ---

        // Validations (Cập nhật)
        if (!this.vin) throw new Error("Vehicle VIN is required.");
        if (!this.ownerId) throw new Error("Vehicle ownerId is required.");
        
        // (SỬA) Bỏ validation không còn đúng
        // if (!this.brand) throw new Error("Vehicle brand is required."); // 'brand' đã được gán ở trên
        // if (!this.model) throw new Error("Vehicle model is required."); // 'model' đã được gán ở trên
        
        // (SỬA) Bỏ validation cho các trường optional (color, licensePlate)
        // if (!this.color) throw new Error("Vehicle color is required.");
        // if (!this.licensePlate) throw new Error("Vehicle license plate is required."); 
    }
}

module.exports = Vehicle;