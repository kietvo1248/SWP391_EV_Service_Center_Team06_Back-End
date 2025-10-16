class UpdateProfile {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(userId, updateData) {
        // Chỉ cho phép cập nhật các trường cụ thể để đảm bảo an toàn
        const allowedUpdates = {
            fullName: updateData.fullName,
            phoneNumber: updateData.phoneNumber,
            address: updateData.address,
        };

        // Loại bỏ các trường không được cung cấp (undefined) để không ghi đè giá trị null vào DB
        Object.keys(allowedUpdates).forEach(key => allowedUpdates[key] === undefined && delete allowedUpdates[key]);

        if (Object.keys(allowedUpdates).length === 0) {
            throw new Error('No valid fields provided for update.');
        }

        await this.userRepository.update(userId, allowedUpdates);

        // Trả về thông tin người dùng mới nhất, an toàn (không có mật khẩu)
        const updatedUser = await this.userRepository.findById(userId);
        return updatedUser;
    }
}

module.exports = UpdateProfile;