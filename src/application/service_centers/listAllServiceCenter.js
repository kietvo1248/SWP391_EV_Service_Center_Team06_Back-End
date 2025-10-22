class ListAllServiceCenters {
    constructor(serviceCenterRepository) {
        this.serviceCenterRepository = serviceCenterRepository;
    }
    async execute() {
        // logic phức tạp hơn (ví dụ: lọc, sắp xếp) sẽ thêm ở đây.
        return this.serviceCenterRepository.getAllServiceCenters();
    }
}

module.exports = ListAllServiceCenters;