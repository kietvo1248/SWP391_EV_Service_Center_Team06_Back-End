// Tệp: src/interfaces/controllers/stationController.js
class StationController {
    constructor(
        listStationStaffUseCase,
        updateStaffStatusUseCase,
        listAllCertificationsUseCase,
        assignCertificationUseCase,
        revokeCertificationUseCase,
        updateTechnicianSpecificationUseCase, // cập nhật chuyên môn
        generateStationRevenueReportUseCase,
        generateTechnicianPerformanceReportUseCase
    ) {
        this.listStationStaffUseCase = listStationStaffUseCase;
        this.updateStaffStatusUseCase = updateStaffStatusUseCase;
        this.listAllCertificationsUseCase = listAllCertificationsUseCase;
        this.assignCertificationUseCase = assignCertificationUseCase;
        this.revokeCertificationUseCase = revokeCertificationUseCase;
        this.updateTechnicianSpecificationUseCase = updateTechnicianSpecificationUseCase;
        this.generateStationRevenueReportUseCase = generateStationRevenueReportUseCase;
        this.generateTechnicianPerformanceReportUseCase = generateTechnicianPerformanceReportUseCase;
    }

    async listStaff(req, res) {
        try {
            const staff = await this.listStationStaffUseCase.execute(req.user);
            res.status(200).json(staff);
        } catch (error) { res.status(400).json({ message: error.message }); }
    }

    async updateStaffStatus(req, res) {
        try {
            const { staffId } = req.params;
            const { isActive } = req.body;
            const staff = await this.updateStaffStatusUseCase.execute(staffId, isActive, req.user);
            res.status(200).json(staff);
        } catch (error) { res.status(400).json({ message: error.message }); }
    }

    async updateTechnicianSpecification(req, res) {
        try {
            // Lấy cả hai ID từ URL
            const { stationId, technicianId } = req.params;
            const { specialization } = req.body;

            // 1. Kiểm tra dữ liệu đầu vào
            if (typeof specialization === 'undefined') {
                return res.status(400).json({ error: 'Dữ liệu chuyên môn là bắt buộc.' });
            }

            /* *
             * Kiểm tra xem kỹ thuật viên này có thực sự thuộc trạm này không.
             * (Giả định model Staff/User của bạn có một trường 'stationId')
             */
            const technician = await this.prisma.staff.findFirst({
                where: {
                    id: technicianId,
                    stationId: stationId, // Phải khớp với trạm
                    role: 'TECHNICIAN'  // Phải là Kỹ thuật viên
                }
            });

            // Nếu không tìm thấy, có nghĩa là Kỹ thuật viên này không tồn tại,
            // không phải là Technician, hoặc không thuộc Trạm này.
            if (!technician) {
                return res.status(404).json({
                    error: 'Không tìm thấy kỹ thuật viên này tại trạm được chỉ định.'
                });
            }

            // 3. Tiến hành cập nhật
            // Vì đã xác minh ở bước 2, chúng ta chỉ cần cập nhật bằng technicianId
            const updatedTechnician = await this.prisma.staff.update({
                where: {
                    id: technicianId,
                },
                data: {
                    specialization: specialization,
                },
            });

            // 4. Trả về kết quả thành công
            res.status(200).json(updatedTechnician);

        } catch (e) {
            // Xử lý lỗi (ví dụ: P2025 nếu technicianId không tồn tại ngay từ đầu)
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
                return res.status(404).json({ error: 'ID Kỹ thuật viên không tồn tại.' });
            }

            console.error(e);
            res.status(500).json({ error: 'Lỗi máy chủ nội bộ.' });
        }
    }

    async listAllCerts(req, res) {
        try {
            const certs = await this.listAllCertificationsUseCase.execute();
            res.status(200).json(certs);
        } catch (error) { res.status(400).json({ message: error.message }); }
    }

    async assignCert(req, res) {
        try {
            const { staffId } = req.params;
            const { certificationId, certificateNumber } = req.body; // Thêm certificateNumber
            const assignment = await this.assignCertificationUseCase.execute(staffId, certificationId, certificateNumber, req.user);
            res.status(201).json(assignment);
        } catch (error) { res.status(400).json({ message: error.message }); }
    }

    async revokeCert(req, res) {
        try {
            const { staffId, certificationId } = req.params;
            await this.revokeCertificationUseCase.execute(staffId, certificationId, req.user);
            res.status(204).send();
        } catch (error) { res.status(400).json({ message: error.message }); }
    }

    async getRevenueReport(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const report = await this.generateStationRevenueReportUseCase.execute(req.user, { startDate, endDate });
            res.status(200).json(report);
        } catch (error) { res.status(400).json({ message: error.message }); }
    }

    async getPerformanceReport(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const report = await this.generateTechnicianPerformanceReportUseCase.execute(req.user, { startDate, endDate });
            res.status(200).json(report);
        } catch (error) { res.status(400).json({ message: error.message }); }
    }
}
module.exports = StationController;