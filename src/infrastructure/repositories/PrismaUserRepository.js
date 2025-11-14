
const IUserRepository = require('../../domain/repositories/IUserRepository');
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

class PrismaUserRepository extends IUserRepository {
    constructor(PrismaClient) {
        super();
        this.prisma = PrismaClient;
    }
    async findByEmail(email) {
        return await this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findById(id) {
        return await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                employeeCode: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                role: true,
                serviceCenterId: true,
            }
        });
    }
    async findAll() {
        return await this.prisma.user.findMany({
            select: {
                id: true,
                employeeCode: true,
                fullName: true,
                email: true,
                role: true,
            }
        });
    }

    async count() {
        return await this.prisma.user.count();
    }

    async delete(id) {
        return await this.prisma.user.delete({
            where: { id },
        });
    }

    async create(userData) {
        return await this.prisma.user.create({
            data: userData,
        });
    }

    async update(id, updateData) {
        return await this.prisma.user.update({
            where: { id: id },
            data: updateData,
        });
    }
     async findByIdWithPassword(id) {
        return await this.prisma.user.findUnique({
            where: { id },
        });
    }
     async findByGoogleId(googleId) {
        try {
            return await this.prisma.user.findUnique({
                where: { googleId },
            });
        } catch (error) {
            console.error('Error finding user by Google ID:', error);
            throw error;
        }
    }

    async add(user) {
        try {
            const { id, employeeCode, fullName, email, passwordHash, role, phoneNumber, address, googleId } = user;
            return await this.prisma.user.create({
                data: {
                    fullName,
                    email,
                    passwordHash,
                    role: "CUSTOMER",
                    phoneNumber,
                    address,
                    googleId,
                },
            });
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async findTechniciansByCenter(serviceCenterId) {
        return this.prisma.user.findMany({
            where: {
                serviceCenterId: serviceCenterId,
                role: 'TECHNICIAN',
                isActive: true,
            },
            select: {
                id: true,
                fullName: true,
                employeeCode: true,
                email: true,
            }
        });
    }
    async findCustomerByPhone(phone) {
        return this.prisma.user.findMany({
            where: {
                role: 'CUSTOMER',
                phoneNumber: {
                    contains: phone, 
                }
            },
            select: { // trả về những gì cần thiết
                id: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                address: true
            }
        });
    }
    async findStaffByCenter(serviceCenterId) {
        return this.prisma.user.findMany({
            where: {
                serviceCenterId: serviceCenterId,
                role: {
                    not: 'CUSTOMER' // Lấy tất cả trừ CUSTOMER
                }
            },
            select: { 
                id: true, fullName: true, email: true,
                employeeCode: true, role: true, isActive: true, phoneNumber: true
            },
            orderBy: { role: 'asc' }
        });
    }
    
    async updateStatus(userId, isActive) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { isActive: isActive }
        });
    }
    async findStaffByIdAndCenter(staffId, serviceCenterId) {
        return this.prisma.user.findFirst({
            where: {
                id: staffId,
                serviceCenterId: serviceCenterId,
                role: {
                    not: 'CUSTOMER' // Không phải là khách hàng
                }
            },
            select: { 
                id: true, fullName: true, email: true,
                employeeCode: true, role: true, isActive: true, phoneNumber: true, address: true,
                technicianProfile: { // (THÊM) Tự động include chuyên môn
                    select: {
                        specialization: true
                    }
                },
                certifications: {
                    // Lấy thông tin từ bảng trung gian (StaffCertification)
                    select: {
                        certificateNumber: true,
                        issueDate: true,
                        // Lấy thông tin từ bảng gốc (Certification)
                        certification: {
                            select: {
                                id: true,
                                name: true,
                                issuingOrganization: true
                            }
                        }
                    }
                }
            }
        });
    }
}

module.exports = PrismaUserRepository;