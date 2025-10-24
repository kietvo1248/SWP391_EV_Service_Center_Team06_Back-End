// Tệp: src/domain/entities/Quotation.js
const { Decimal } = require('@prisma/client/runtime/library'); // Sử dụng Decimal của Prisma để đảm bảo kiểu dữ liệu

class Quotation {
    /**
     * @param {string} id - UUID của báo giá
     * @param {string} serviceRecordId - ID của ServiceRecord liên quan
     * @param {Decimal} estimatedCost - Chi phí dự kiến
     * @param {Date} creationDate - Ngày tạo báo giá
     */
    constructor(id, serviceRecordId, estimatedCost, creationDate) {
        this.id = id;
        this.serviceRecordId = serviceRecordId;
        this.estimatedCost = estimatedCost; 
        this.creationDate = creationDate;

        if (this.estimatedCost && this.estimatedCost.lessThan(0)) {
            throw new Error('Estimated cost cannot be negative.');
        }
    }
}

module.exports = Quotation;