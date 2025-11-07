class IStaffCertificationRepository {
    async assign(data) { throw new Error("Not implemented"); }
    async revoke(staffId, certificationId) { throw new Error("Not implemented"); }
    async findByCertificateNumber(number) { throw new Error("Not implemented"); }
}
module.exports = IStaffCertificationRepository;