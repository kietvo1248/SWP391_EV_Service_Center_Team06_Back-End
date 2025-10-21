const User = require('../../domain/entities/User');

class GoogleOAuthCallbackUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(profile) {
        const { id: googleId, displayName: fullName, emails } = profile;
        const email = emails && emails.length > 0 ? emails[0].value : null;

        if (!email) {
            throw new Error('Google profile did not return an email.');
        }

        // 1. Tìm user bằng googleId
        let user = await this.userRepository.findByGoogleId(googleId);
        if (user) {
            return user;
        }

        // 2. Nếu không có, tìm bằng email
        user = await this.userRepository.findByEmail(email);
        if (user) {
            // User đã tồn tại (đăng ký bằng form), liên kết tài khoản Google
            return this.userRepository.update(user.id, { googleId });
        }

        // 3. Nếu không có, tạo user mới
        const newUser = new User(
            null,       // id
            null,       // userCode
            fullName,
            email,
            null,       // passwordHash
            'CUSTOMER', // role
            null,       // phoneNumber
            null,       // address
            null,       // serviceCenterId
            googleId
        );
        return this.userRepository.add(newUser);
    }
}

module.exports = GoogleOAuthCallbackUseCase;

