class User {
    // Added passwordHash (and set to null), address, and googleId for consistency
    constructor(id, userCode, fullName, email, passwordHash, role, phoneNumber, address, serviceCenterId, googleId) {
        this.id = id;
        this.userCode = userCode;
        this.fullName = fullName;
        this.email = email;
        // passwordHash is not returned in responses, but is part of the domain model
        this.role = role;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.serviceCenterId = serviceCenterId;
        // googleId is also part of the model for auth purposes
        // This will hold the full service center object for employees
        this.serviceCenter = null; 
    }
}

module.exports = User;