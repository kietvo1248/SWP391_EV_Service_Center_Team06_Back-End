class StaffCertification {
    constructor(data) {
        this.staffId = data.staffId;
        this.certificationId = data.certificationId;
        this.certificateNumber = data.certificateNumber; // Thêm
        this.issueDate = data.issueDate; // Thêm
        this.certification = data.certification ? new Certification(data.certification) : null; // (Optional)
    }
}
module.exports = StaffCertification;