"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audit_controller_1 = require("../controllers/audit.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.post('/check-in', auth_1.protect, (0, auth_1.restrictTo)('TECHNICIAN', 'ADMIN'), audit_controller_1.validateCheckIn);
router.get('/sla/:providerId', auth_1.protect, (0, auth_1.restrictTo)('ADMIN', 'AUDITOR'), audit_controller_1.getProviderSLA);
exports.default = router;
