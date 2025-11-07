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
        generateTechnicianPerformanceReportUseCase,
        processRestockRequestUseCase
    ) {
        this.listStationStaffUseCase = listStationStaffUseCase;
        this.updateStaffStatusUseCase = updateStaffStatusUseCase;
        this.listAllCertificationsUseCase = listAllCertificationsUseCase;
        this.assignCertificationUseCase = assignCertificationUseCase;
        this.revokeCertificationUseCase = revokeCertificationUseCase;
        this.updateTechnicianSpecificationUseCase = updateTechnicianSpecificationUseCase;
        this.generateStationRevenueReportUseCase = generateStationRevenueReportUseCase;
        this.generateTechnicianPerformanceReportUseCase = generateTechnicianPerformanceReportUseCase;
        this.processRestockRequestUseCase = processRestockRequestUseCase;
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
            const actor = req.user; // (STATION_ADMIN)
            
            // stationId từ URL dùng để định tuyến, nhưng logic nghiệp vụ
            // sẽ dùng stationId của actor (người đã đăng nhập) để bảo mật.
            const { stationId, technicianId } = req.params;
            
            const { specialization } = req.body;

            const updatedProfile = await this.updateTechnicianSpecificationUseCase.execute(
                actor, 
                technicianId, 
                specialization
            );

            res.status(200).json(updatedProfile);

        } catch (error) {
            console.error("Error in updateTechnicianSpecification:", error.message);
            if (error.message.includes("Forbidden")) {
                return res.status(403).json({ message: error.message });
            }
            if (error.message.includes("not found")) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes("cannot be empty")) {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: "Internal server error" });
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
    async approveRestockRequest(req, res) {
        try {
            const actor = req.user; // (STATION_ADMIN)
            const { id } = req.params; // (Restock Request ID)

            const updatedRequest = await this.processRestockRequestUseCase.execute(
                actor,
                id,
                RestockRequestStatus.APPROVED
            );
            
            res.status(200).json(updatedRequest);
        } catch (error) {
            console.error("Error approving restock request (Station):", error.message);
            if (error.message.includes("Forbidden")) {
                return res.status(403).json({ message: error.message });
            }
            if (error.message.includes("not found")) {
                return res.status(404).json({ message: error.message });
            }
            res.status(400).json({ message: error.message }); // Lỗi nghiệp vụ khác
        }
    }

    /**
     * Từ chối Yêu cầu Nhập hàng (Dành cho Station Admin)
     */
    async rejectRestockRequest(req, res) {
         try {
            const actor = req.user; // (STATION_ADMIN)
            const { id } = req.params; // (Restock Request ID)

            const updatedRequest = await this.processRestockRequestUseCase.execute(
                actor,
                id,
                RestockRequestStatus.REJECTED
            );
            
            res.status(200).json(updatedRequest);
        } catch (error) {
            console.error("Error rejecting restock request (Station):", error.message);
            if (error.message.includes("Forbidden")) {
                return res.status(403).json({ message: error.message });
            }
            if (error.message.includes("not found")) {
                return res.status(404).json({ message: error.message });
            }
            res.status(400).json({ message: error.message }); // Lỗi nghiệp vụ khác
        }
    }
}
module.exports = StationController;