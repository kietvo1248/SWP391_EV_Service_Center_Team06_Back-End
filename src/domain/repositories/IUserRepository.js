// Interface này định nghĩa các phương thức mà tầng Application cần để thao tác với User
class IUserRepository {
    async findByEmail(email) {
        throw new Error('Method not implemented');
    }

    async create(user) {
        throw new Error('Method not implemented');
    }
    async count() {
        throw new Error('Method not implemented');
    }
    async update(id, updateFields) {
        throw new Error('Method not implemented');
    }
    async findById(id) {
        throw new Error('Method not implemented');
    }
    async findAll() {
        throw new Error('Method not implemented');
    }
    async findByIdWithPassword(id) {
        throw new Error('Method not implemented');
    }
    async delete(id) {
        throw new Error('Method not implemented');
    }
}

module.exports = IUserRepository;