// Tệp: src/domain/entities/Vehicle.js

class Vehicle {
    constructor(data) {
        if (!data) {
             throw new Error("Vehicle data cannot be empty");
        }
        this.id = data.id;
        this.brand = data.brand;
        this.model = data.model;
        this.color = data.color;
        this.year = data.year;
        this.vin = data.vin;
        this.licensePlate = data.licensePlate;

        // --- SỬA ĐỔI Ở ĐÂY ---
        // Đảm bảo currentMileage là số, mặc định là 0
        let mileageInput = data.currentMileage;
        let parsedMileage = mileageInput !== undefined && mileageInput !== null
                           ? parseInt(mileageInput, 10)
                           : 0;
        this.currentMileage = isNaN(parsedMileage) ? 0 : parsedMileage;
        this.lastServiceDate = data.lastServiceDate ?? null;
        this.ownerId = data.ownerId;
        if (data.vehicleModel) {
            this.brand = data.vehicleModel.brand;
            this.model = data.vehicleModel.name;
        }
        
        if (data.battery) {
            this.batteryName = data.battery.name;
            this.batteryCapacity = data.battery.capacityKwh;
        }

        // Validations
        if (!this.vin) throw new Error("Vehicle VIN is required.");
        // ... (các validation khác giữ nguyên)
         if (!this.brand) throw new Error("Vehicle brand is required.");
        if (!this.model) throw new Error("Vehicle model is required.");
        if (!this.color) throw new Error("Vehicle color is required.");
        if (!this.year || typeof this.year !== 'number') throw new Error("Vehicle year must be a number.");
        if (!this.licensePlate) throw new Error("Vehicle license plate is required.");
        if (!this.ownerId) throw new Error("Vehicle ownerId is required.");
    }
}

module.exports = Vehicle;