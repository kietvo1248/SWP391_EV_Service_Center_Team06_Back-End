const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../../domain/entities/User');
const GoogleOAuthCallbackUseCase = require('../../application/authorization/googleSignIn');
const jwt = require('jsonwebtoken');

function initializePassport(passport, userRepository) {
    const googleOAuthCallbackUseCase = new GoogleOAuthCallbackUseCase(userRepository);
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            console.log('Google OAuth profile received:', {
                id: profile.id,
                displayName: profile.displayName,
                emails: profile.emails
            });

            const user = await googleOAuthCallbackUseCase.execute(profile);
            
            if (!user) {
                console.error('User not found or created');
                return done(new Error('User authentication failed'), null);
            }

            console.log('User found/created:', { id: user.id, email: user.email });

            // Tạo JWT token tại đây
            const payload = {
                user: {
                    id: user.id,
                    role: user.role
                }
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
            
            console.log('JWT token created successfully');
            
            // Gửi cả user và token đi tiếp
            return done(null, { user, token });
        } catch (error) {
            console.error('Google OAuth error:', error);
            return done(error, null);
        }
    }));
    passport.serializeUser((data, done) => {
        done(null, data);
    });
    passport.deserializeUser((data, done) => {
        done(null, data);
    });
}

module.exports = initializePassport;