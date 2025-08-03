"use strict";
// src/modules/parcel/parcel.controller.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelController = void 0;
const parcel_service_1 = require("./parcel.service");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_interface_1 = require("../user/user.interface"); // Import the Role enum
const createParcel = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, role } = req.user; // Assuming req.user is populated by auth middleware
    const parcelData = req.body;
    // We enforce that only a sender can create a parcel.
    if (role !== 'SENDER') {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, 'Only senders can create parcels.');
    }
    const result = yield parcel_service_1.ParcelService.createParcel(parcelData, userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: 'Parcel created successfully!',
        data: result,
    });
}));
const getMyParcels = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const filterOptions = req.query; // e.g., { status: 'delivered', deliveryTime: '2025-08-01' }
    const result = yield parcel_service_1.ParcelService.getMyParcels(userId, filterOptions);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: 'My parcels retrieved successfully.',
        data: result,
    });
}));
const getSingleParcel = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { role, userId } = req.user;
    const { id } = req.params;
    // Determine the query parameters to pass to the service
    let queryOptions = {};
    if (role === user_interface_1.Role.SENDER || role === user_interface_1.Role.RECEIVER) {
        // For non-admin users, restrict the query by their user ID
        queryOptions = { userId: userId };
    }
    else if (role === user_interface_1.Role.ADMIN || role === user_interface_1.Role.SUPER_ADMIN) {
        // Admins can see any parcel, so no user ID is needed in the query.
        queryOptions = {};
    }
    else {
        // Handle other roles or unauthorized access
        // This is a good place to throw a 403 Forbidden error
        // For now, we'll let the service handle it based on null queryOptions.
    }
    const result = yield parcel_service_1.ParcelService.getSingleParcel(id, queryOptions);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: 'Parcel retrieved successfully!',
        data: result,
    });
}));
const getAllParcels = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield parcel_service_1.ParcelService.getAllParcelsForAdmin();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: 'All parcels retrieved successfully!',
        data: result,
    });
}));
const cancelParcel = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { id } = req.params;
    const result = yield parcel_service_1.ParcelService.cancelParcel(id, userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: 'Parcel canceled successfully!',
        data: result,
    });
}));
const confirmDelivery = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { id } = req.params;
    const result = yield parcel_service_1.ParcelService.confirmDelivery(id, userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: 'Delivery confirmed successfully!',
        data: result,
    });
}));
const updateParcelStatus = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { id } = req.params;
    const { status, note } = req.body;
    const result = yield parcel_service_1.ParcelService.updateParcelStatus(id, status, userId, note);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: 'Parcel status updated successfully!',
        data: result,
    });
}));
const blockParcel = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { id } = req.params;
    const result = yield parcel_service_1.ParcelService.blockParcel(id, userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: 'Parcel blocked successfully!',
        data: result,
    });
}));
exports.ParcelController = {
    createParcel,
    getMyParcels,
    getSingleParcel,
    getAllParcels,
    cancelParcel,
    confirmDelivery,
    updateParcelStatus,
    blockParcel,
};
