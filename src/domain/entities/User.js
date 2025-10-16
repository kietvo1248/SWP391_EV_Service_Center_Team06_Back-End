class User {
    constructor(id,userCode, fullName, email, role, phoneNumber, serviceCenterId ) {
        this.id = id;
        this.userCode = userCode;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.phoneNumber = phoneNumber;
        this.serviceCenterId = serviceCenterId;
    }
}

module.exports = User