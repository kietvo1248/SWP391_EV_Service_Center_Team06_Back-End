class IRestockRequestRepository {
    async create(data) { throw new Error("Not implemented"); }
    async findByCenter(serviceCenterId, status) { throw new Error("Not implemented"); }
    async findById(id) { throw new Error("Not implemented"); }
    async update(id, data, tx) { throw new Error("Not implemented"); }
    async findActiveByPartAndCenter(partId, serviceCenterId) { 
        throw new Error("Not implemented"); 
    }
}
module.exports = IRestockRequestRepository;