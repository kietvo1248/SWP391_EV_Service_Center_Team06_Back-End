class ServiceType{
    constructor(id, name, description, price) {
        this.id = id;
        this.name = name;
        this.description = description;
        //this.price = price;

        //validation
        if (!this.id || typeof this.id !== 'string') {
            throw new Error('ServiceType ID must be a non-empty string.');
        }
        if (!this.name || typeof this.name !== 'string') {
            throw new Error('ServiceType Name must be a non-empty string.');
        }
    }
    
}
module.exports = ServiceType;