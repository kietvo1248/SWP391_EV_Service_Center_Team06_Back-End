class ListServiceTypes {
    constructor(serviceTypeRepository) {
        this.serviceTypeRepository = serviceTypeRepository;
    }

    async execute() {
        return this.serviceTypeRepository.findAll();
    }
}

module.exports = ListServiceTypes;