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
        getStaffDetailsUseCase,     
        createCertificationUseCase, 
        updateCertificationUseCase, 
        deleteCertificationUseCase
    ) {
        this.listStationStaffUseCase = listStationStaffUseCase;
        this.updateStaffStatusUseCase = updateStaffStatusUseCase;
        this.listAllCertificationsUseCase = listAllCertificationsUseCase;
        this.assignCertificationUseCase = assignCertificationUseCase;
        this.revokeCertificationUseCase = revokeCertificationUseCase;
        this.updateTechnicianSpecificationUseCase = updateTechnicianSpecificationUseCase;
        this.generateStationRevenueReportUseCase = generateStationRevenueReportUseCase;
        this.generateTechnicianPerformanceReportUseCase = generateTechnicianPerformanceReportUseCase;
        this.getStaffDetailsUseCase = getStaffDetailsUseCase;
        this.createCertificationUseCase = createCertificationUseCase;
        this.updateCertificationUseCase = updateCertificationUseCase;
        this.deleteCertificationUseCase = deleteCertificationUseCase;
    }

    async listStaff(req, res) {
        try {
            // (SỬA) Không cần stationId, Use Case tự lấy từ actor
            const staff = await this.listStationStaffUseCase.execute(req.user);
            res.status(200).json(staff);
        } catch (error) { res.status(400).json({ message: error.message }); }
    }
    
    // (THÊM MỚI) Xem chi tiết 1 nhân viên
    async getStaffDetails(req, res) {
        try {
            const { staffId } = req.params;
            const staff = await this.getStaffDetailsUseCase.execute(req.user, staffId);
            res.status(200).json(staff);
        } catch (error) { 
            if (error.message.includes('not found')) return res.status(404).json({ message: error.message });
            res.status(400).json({ message: error.message }); 
        }
    }

    async updateStaffStatus(req, res) {
        try {
            const { staffId } = req.params; // (SỬA) Bỏ stationId
            const { isActive } = req.body;
            const staff = await this.updateStaffStatusUseCase.execute(staffId, isActive, req.user);
            res.status(200).json(staff);
        } catch (error) { res.status(400).json({ message: error.message }); }
    }

    async updateTechnicianSpecification(req, res) {
        try {
            const actor = req.user; 
            const { technicianId } = req.params; // (SỬA) Bỏ stationId
            const { specialization } = req.body;

            const updatedProfile = await this.updateTechnicianSpecificationUseCase.execute(
                actor, 
                technicianId, 
                specialization
            );
            res.status(200).json(updatedProfile);
        } catch (error) {
            // ... (Error handling giữ nguyên)
            res.status(500).json({ message: "Internal server error" });
        }
    }

    // --- 2. Quản lý Chứng chỉ ---

    async listAllCerts(req, res) {
        try {
            const certs = await this.listAllCertificationsUseCase.execute();
            res.status(200).json(certs);
        } catch (error) { res.status(400).json({ message: error.message }); }
    }
    
    // (THÊM MỚI) Tạo Chứng chỉ
    async createCertification(req, res) {
        try {
            const cert = await this.createCertificationUseCase.execute(req.user, req.body);
            res.status(201).json(cert);
        } catch (error) { res.status(400).json({ message: error.message }); }
    }
    
    // (THÊM MỚI) Cập nhật Chứng chỉ
    async updateCertification(req, res) {
        try {
            const { id } = req.params;
            const cert = await this.updateCertificationUseCase.execute(req.user, id, req.body);
            res.status(200).json(cert);
        } catch (error) { res.status(400).json({ message: error.message }); }
    }
    
    // (THÊM MỚI) Xóa Chứng chỉ
    async deleteCertification(req, res) {
        try {
            const { id } = req.params;
            await this.deleteCertificationUseCase.execute(req.user, id);
            res.status(204).send();
        } catch (error) { res.status(400).json({ message: error.message }); }
    }

    async assignCert(req, res) {
        try {
            const { technicianId } = req.params; // (SỬA) đổi staffId -> technicianId cho rõ
            const { certificationId, certificateNumber } = req.body;
            const assignment = await this.assignCertificationUseCase.execute(technicianId, certificationId, certificateNumber, req.user);
            res.status(201).json(assignment);
        } catch (error) { res.status(400).json({ message: error.message }); }
    }

    async revokeCert(req, res) {
        try {
            const { technicianId, certificationId } = req.params; // (SỬA)
            await this.revokeCertificationUseCase.execute(technicianId, certificationId, req.user);
            res.status(204).send();
        } catch (error) { res.status(400).json({ message: error.message }); }
    }

    // --- 3. Báo cáo (Reporting) ---

    async getRevenueReport(req, res) {
        try {
            const { fromDate, toDate } = req.query; // (SỬA) Đổi tên cho chuẩn
            // (SỬA) Use case tự lấy stationId từ actor
            const report = await this.generateStationRevenueReportUseCase.execute(req.user, { startDate: fromDate, endDate: toDate });
            res.status(200).json(report);
        } catch (error) { res.status(400).json({ message: error.message }); }
    }

    async getPerformanceReport(req, res) {
        try {
            const { fromDate, toDate } = req.query; // (SỬA)
            // (SỬA) Use case tự lấy stationId từ actor
            const report = await this.generateTechnicianPerformanceReportUseCase.execute(req.user, { startDate: fromDate, endDate: toDate });
            res.status(200).json(report);
        } catch (error) { res.status(400).json({ message: error.message }); }
    }
    // async approveRestockRequest(req, res) {
    //     try {
    //         const actor = req.user; // (STATION_ADMIN)
    //         const { id } = req.params; // (Restock Request ID)

    //         const updatedRequest = await this.processRestockRequestUseCase.execute(
    //             actor,
    //             id,
    //             RestockRequestStatus.APPROVED
    //         );
            
    //         res.status(200).json(updatedRequest);
    //     } catch (error) {
    //         console.error("Error approving restock request (Station):", error.message);
    //         if (error.message.includes("Forbidden")) {
    //             return res.status(403).json({ message: error.message });
    //         }
    //         if (error.message.includes("not found")) {
    //             return res.status(404).json({ message: error.message });
    //         }
    //         res.status(400).json({ message: error.message }); // Lỗi nghiệp vụ khác
    //     }
    // }

    // /**
    //  * Từ chối Yêu cầu Nhập hàng (Dành cho Station Admin)
    //  */
    // async rejectRestockRequest(req, res) {
    //      try {
    //         const actor = req.user; // (STATION_ADMIN)
    //         const { id } = req.params; // (Restock Request ID)

    //         const updatedRequest = await this.processRestockRequestUseCase.execute(
    //             actor,
    //             id,
    //             RestockRequestStatus.REJECTED
    //         );
            
    //         res.status(200).json(updatedRequest);
    //     } catch (error) {
    //         console.error("Error rejecting restock request (Station):", error.message);
    //         if (error.message.includes("Forbidden")) {
    //             return res.status(403).json({ message: error.message });
    //         }
    //         if (error.message.includes("not found")) {
    //             return res.status(404).json({ message: error.message });
    //         }
    //         res.status(400).json({ message: error.message }); // Lỗi nghiệp vụ khác
    //     }
    // }
}
module.exports = StationController;