const { Decimal } = require('@prisma/client/runtime/library');

class Invoice {
    /**
     * @param {string} id - UUID của hóa đơn
     * @param {string} serviceRecordId - ID của ServiceRecord liên quan
     * @param {Decimal} totalAmount - Tổng số tiền cần thanh toán
     * @param {string} status - Trạng thái hóa đơn (UNPAID, PAID, OVERDUE)
     * @param {Date} issueDate - Ngày phát hành hóa đơn
     * @param {Date} dueDate - Ngày hết hạn thanh toán
     */
    constructor(id, serviceRecordId, totalAmount, status, issueDate, dueDate) {
        this.id = id;
        this.serviceRecordId = serviceRecordId;
        this.totalAmount = totalAmount;
        this.status = status; // UNPAID, PAID, OVERDUE
        this.issueDate = issueDate;
        this.dueDate = dueDate;

        if (this.totalAmount && this.totalAmount.lessThan(0)) {
            throw new Error('Total amount cannot be negative.');
        }
        if (this.dueDate && this.issueDate && this.dueDate < this.issueDate) {
            throw new Error('Due date cannot be before issue date.');
        }
    }

}

module.exports = Invoice;