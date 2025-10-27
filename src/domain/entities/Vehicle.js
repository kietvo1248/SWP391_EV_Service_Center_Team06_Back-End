// Tệp: src/domain/entities/Vehicle.js

class Vehicle {
    constructor(data) {
        if (!data) {
             throw new Error("Vehicle data cannot be empty");
        }
        this.id = data.id;
        this.make = data.make;
        this.model = data.model;
        this.year = data.year;
        this.vin = data.vin;
        this.licensePlate = data.licensePlate ?? null;

        // --- SỬA ĐỔI Ở ĐÂY ---
        // Đảm bảo currentMileage là số, mặc định là 0
        let mileageInput = data.currentMileage;
        let parsedMileage = mileageInput !== undefined && mileageInput !== null
                           ? parseInt(mileageInput, 10)
                           : 0;
        this.currentMileage = isNaN(parsedMileage) ? 0 : parsedMileage;
        this.lastServiceDate = data.lastServiceDate ?? null;
        this.ownerId = data.ownerId;

        // Validations
        if (!this.vin) throw new Error("Vehicle VIN is required.");
        // ... (các validation khác giữ nguyên)
         if (!this.make) throw new Error("Vehicle make is required.");
        if (!this.model) throw new Error("Vehicle model is required.");
        if (!this.year || typeof this.year !== 'number') throw new Error("Vehicle year must be a number.");
        if (!this.ownerId) throw new Error("Vehicle ownerId is required.");
    }
}

module.exports = Vehicle;