class Vehicle {
    constructor({ id, make, model, year, vin, license_plate, current_mileage, last_service_date}) {
        this.id = id;
        this.make = make;
        this.model = model;
        this.year = year;
        this.vin = vin;
        this.license_plate = license_plate;
        this.current_mileage = current_mileage;
        this.last_service_date = last_service_date;
        }
}

module.exports = Vehicle;