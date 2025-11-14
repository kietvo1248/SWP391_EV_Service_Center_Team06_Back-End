// Tệp: src/domain/repositories/IPartRepository.js
class IPartRepository {
    async findById(id) { throw new Error("Not implemented"); }
    async findByIds(ids) { throw new Error("Not implemented"); }
    async findBySku(sku, tx) {
        throw new Error("Not implemented");
    }
    async create(partData, tx) {
        throw new Error("Not implemented");
    }
    async update(id, partData, tx) {
        throw new Error("Not implemented");
    }
}
module.exports = IPartRepository;