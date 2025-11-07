class ListAllCertifications {
    constructor(certificationRepository) {
        this.certificationRepo = certificationRepository;
    }
    async execute() {
        return this.certificationRepo.findAll();
    }
}
module.exports = ListAllCertifications;