const { PrismaClient } = require('@prisma/client');
const IUserRepository = require('../../domain/repositories/IUserRepository');
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
            select: {
                id: true,
                userCode: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                role: true,
                serviceCenterId: true,
            }
        });
    }
    async findAll() {
        return await prisma.user.findMany({
            select: {
                id: true,
                userCode: true,
                fullName: true,
                email: true,
                role: true,
            }
        });
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

    async update(id, updateData) {
        return await prisma.user.update({
            where: { id: id },
            data: updateData,
        });
    }
     async findByIdWithPassword(id) {
        return await prisma.user.findUnique({
            where: { id },
        });
    }
     async findByGoogleId(googleId) {
        return await prisma.user.findUnique({
            where: { googleId },
        });
    }

    async add(user) {
        const { id, userCode, fullName, email, passwordHash, role, phoneNumber, address, googleId } = user;
        return await prisma.user.create({
            data: {
                fullName,
                email,
                passwordHash,
                role,
                phoneNumber,
                address,
                googleId,
            },
        });
    }
}

module.exports = PrismaUserRepository;