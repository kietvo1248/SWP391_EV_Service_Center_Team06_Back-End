const User = require('../../domain/entities/User');


class ViewAccount {
    constructor(userRepository, serviceCenterRepository) {
        this.userRepository = userRepository;
        this.serviceCenterRepository = serviceCenterRepository;
    }

    async execute(userId) {
        // 1. Tìm người dùng bằng ID
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found.'); // Lỗi không tìm thấy người dùng
        }

        // 2. Create a safe User object
        const userProfile = new User(
            user.id,
            user.userCode,
            user.fullName,
            user.email,
            null, // passwordHash - không trả về
            user.role,
            user.phoneNumber,
            user.address,
            user.serviceCenterId
        );

        // 3. If the user is an employee (has a serviceCenterId), fetch and attach the service center details.
        if (user.serviceCenterId) {
            userProfile.serviceCenter = await this.serviceCenterRepository.getServiceCenterById(user.serviceCenterId);
        }

        return userProfile;
    }
}


module.exports = ViewAccount;