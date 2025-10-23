class Payment{
   constructor(id, invoiceId, paymentMethod, status, paymentDate) {
        this.id = id;
        this.invoiceId = invoiceId;
        this.paymentMethod = paymentMethod;
        this.status = status; // PENDING, SUCCESSFUL, FAILED
        this.paymentDate = paymentDate;
    }
}
module.exports = Payment;