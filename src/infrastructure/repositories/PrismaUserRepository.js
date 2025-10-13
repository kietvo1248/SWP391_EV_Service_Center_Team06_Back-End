const { PrismaClient } = require('@prisma/client');
const IUserRepository = require('../../domain/repositories/IUserRepositoriy');
const prisma = new PrismaClient();

class PrismaUserRepository extends IUserRepository {
    async findByEmail(email) {
        return await prisma.user.findUnique({
            where: { email },
        });
    }

    async findById(id) {
        return await prisma.user.findUnique({
            where: { id },
        });
    }
    async findAll() {
        return await prisma.user.findMany();
    }

    async count() {
        return await prisma.user.count();
    }

    async delete(id) {
        return await prisma.user.delete({
            where: { id },
        });
    }

    async create(userData) {
        return await prisma.user.create({
            data: userData,
        });
    }

    // --- Triển khai phương thức mới ---
    async update(id, updateData) {
        return await prisma.user.update({
            where: { id: BigInt(id) },
            data: updateData,
        });
    }
}

module.exports = PrismaUserRepository;