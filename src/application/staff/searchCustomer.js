class SearchCustomer {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(phone) {
        if (!phone) {
            throw new Error('Phone number is required for search.');
        }
        return this.userRepository.findCustomerByPhone(phone);
    }
}
module.exports = SearchCustomer;