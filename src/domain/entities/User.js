const { Role } = require('@prisma/client');

class User {
    constructor(id, employeeCode, fullName, email, passwordHash, role, phoneNumber, address, serviceCenterId, googleId, isActive) {
        this.id = id;
        this.employeeCode = employeeCode;
        this.fullName = fullName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role || Role.CUSTOMER;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.serviceCenterId = serviceCenterId;
        this.googleId = googleId;
        this.isActive = isActive;

        // Chỉ nhân viên mới có employeeCode
        if (this.role === Role.CUSTOMER && this.employeeCode) {
            this.employeeCode = null;
        }
    }
}

module.exports = User;