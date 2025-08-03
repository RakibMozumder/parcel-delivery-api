"use strict";
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
exports.ParcelService = void 0;
const parcel_model_1 = require("./parcel.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
// src/modules/parcel/parcel.service.ts
const user_model_1 = require("../user/user.model"); // Assuming you have a User model to fetch user details.
// Fee Calculation Constants
const BASE_RATE = 100; // Flat fee
const RATE_PER_KG = 50; // Cost per kilogram
// Helper function to calculate the fee
const calculateFee = (weight) => {
    return BASE_RATE + (weight * RATE_PER_KG);
};
const createParcel = (parcelData, senderId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the senderId from the request matches the senderId in the data.
    if (parcelData.senderId.toString() !== senderId.toString()) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, 'You are not authorized to create a parcel for another user.');
    }
    // Fetch sender and receiver details from the User model.
    const sender = yield user_model_1.User.findById(parcelData.senderId);
    const receiver = yield user_model_1.User.findById(parcelData.receiverId);
    if (!sender || !receiver) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Sender or Receiver not found!');
    }
    // Check if sender has required contact information
    if (!sender.phone || !sender.address) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Sender must have a phone number and address in their profile to create a parcel.');
    }
    // Check if receiver has required contact information
    if (!receiver.phone || !receiver.address) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Receiver must have a phone number and address in their profile to receive a parcel.');
    }
    // Populate senderInfo and receiverInfo from the fetched user data.
    const senderInfo = {
        name: sender.name,
        address: sender.address,
        phone: sender.phone,
    };
    const receiverInfo = {
        name: receiver.name,
        address: receiver.address,
        phone: receiver.phone,
    };
    // Calculate the fee based on parcel weight
    const fee = calculateFee(parcelData.parcelDetails.weight);
    const initialTrackingEvent = {
        status: 'requested',
        timestamp: new Date(),
        updatedBy: senderId,
        note: 'Parcel creation requested by sender.',
    };
    const result = yield parcel_model_1.Parcel.create(Object.assign(Object.assign({}, parcelData), { senderInfo,
        receiverInfo,
        fee, status: 'requested', trackingEvents: [initialTrackingEvent] }));
    return result;
});
// const createParcel = async (
//   parcelData: Omit<IParcel, 'trackingId' | 'status' | 'trackingEvents' | 'isCanceled' | 'isBlocked' | 'isConfirmed' | 'senderInfo' | 'receiverInfo'>,
//   senderId: Types.ObjectId,
// ): Promise<IParcel | null> => {
//   // Check if the senderId from the request matches the senderId in the data.
//   if (parcelData.senderId.toString() !== senderId.toString()) {
//     throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to create a parcel for another user.');
//   }
//   // Fetch sender and receiver details from the User model.
//   const sender = await User.findById(parcelData.senderId);
//   const receiver = await User.findById(parcelData.receiverId);
//   if (!sender || !receiver) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Sender or Receiver not found!');
//   }
//   // Check if sender has required contact information
//   if (!sender.phone || !sender.address) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Sender must have a phone number and address in their profile to create a parcel.');
//   }
//   // Check if receiver has required contact information
//   if (!receiver.phone || !receiver.address) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Receiver must have a phone number and address in their profile to receive a parcel.');
//   }
//   // Populate senderInfo and receiverInfo from the fetched user data.
//   const senderInfo = {
//     name: sender.name,
//     address: sender.address,
//     phone: sender.phone,
//   };
//   const receiverInfo = {
//     name: receiver.name,
//     address: receiver.address,
//     phone: receiver.phone,
//   };
//   const initialTrackingEvent: ITrackingEvent = {
//     status: 'requested',
//     timestamp: new Date(),
//     updatedBy: senderId,
//     note: 'Parcel creation requested by sender.',
//   };
//   const result = await Parcel.create({
//     ...parcelData,
//     senderInfo,
//     receiverInfo,
//     status: 'requested',
//     trackingEvents: [initialTrackingEvent],
//   });
//   return result;
// };
// Function to get filtered parcels for the authenticated user myparcels.
const getMyParcels = (userId, filters) => __awaiter(void 0, void 0, void 0, function* () {
    const query = {
        $or: [
            { senderId: userId },
            { receiverId: userId }
        ]
    };
    // Add filters if they exist
    if (filters.status) {
        query.status = filters.status;
    }
    // Add date range filtering
    if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) {
            query.createdAt.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
            query.createdAt.$lte = new Date(filters.endDate);
        }
    }
    const parcels = yield parcel_model_1.Parcel.find(query).lean();
    return parcels;
});
const getSingleParcel = (parcelId, queryOptions) => __awaiter(void 0, void 0, void 0, function* () {
    // Build the query dynamically based on the queryOptions
    const query = { _id: parcelId };
    // If a userId is provided, restrict the search to parcels where the user is either the sender or receiver
    if (queryOptions.userId) {
        query.$or = [{ senderId: queryOptions.userId }, { receiverId: queryOptions.userId }];
    }
    const result = yield parcel_model_1.Parcel.findOne(query);
    if (!result) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Parcel not found or you are not authorized to view it.');
    }
    return result;
});
// Function to get all parcels for an Admin.
const getAllParcelsForAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield parcel_model_1.Parcel.find({}).populate('senderId receiverId');
    return result;
});
// Function for a sender to cancel a parcel.
const cancelParcel = (parcelId, senderId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Parcel not found!');
    }
    // Check if the authenticated user is the sender.
    if (parcel.senderId.toString() !== senderId.toString()) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, 'You are not authorized to cancel this parcel.');
    }
    // A parcel can only be canceled if its status is 'requested' or 'pending'.
    if (parcel.status === 'in_transit' || parcel.status === 'delivered') {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Cannot cancel a parcel that is already in transit or delivered.');
    }
    // Update the parcel status and add a new tracking event.
    parcel.status = 'canceled';
    parcel.isCanceled = true;
    const newTrackingEvent = {
        status: 'canceled',
        timestamp: new Date(),
        updatedBy: senderId,
        note: 'Parcel canceled by sender.',
    };
    parcel.trackingEvents.push(newTrackingEvent);
    const result = yield parcel.save();
    return result;
});
// Function for a receiver to confirm delivery.
const confirmDelivery = (parcelId, receiverId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Parcel not found!');
    }
    // Check if the authenticated user is the receiver.
    if (parcel.receiverId.toString() !== receiverId.toString()) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, 'You are not authorized to confirm this parcel.');
    }
    // A parcel can only be confirmed if its status is 'in_transit' or 'delivered'.
    if (parcel.status !== 'in_transit') {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Cannot confirm delivery for a parcel that is not in transit.');
    }
    // Update the parcel status and add a new tracking event.
    parcel.status = 'delivered';
    parcel.isConfirmed = true;
    const newTrackingEvent = {
        status: 'delivered',
        timestamp: new Date(),
        updatedBy: receiverId,
        note: 'Delivery confirmed by receiver.',
    };
    parcel.trackingEvents.push(newTrackingEvent);
    const result = yield parcel.save();
    return result;
});
// Function for an Admin to update a parcel's status.
const updateParcelStatus = (parcelId, newStatus, adminId, note) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Parcel not found!');
    }
    // Update the parcel's status.
    parcel.status = newStatus;
    // Add a new tracking event.
    const newTrackingEvent = {
        status: newStatus,
        timestamp: new Date(),
        updatedBy: adminId,
        note: note || `Status updated to '${newStatus}' by Admin.`,
    };
    parcel.trackingEvents.push(newTrackingEvent);
    const result = yield parcel.save();
    return result;
});
// Function for an Admin to block a parcel.
const blockParcel = (parcelId, adminId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Parcel not found!');
    }
    if (parcel.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Parcel is already blocked.');
    }
    parcel.isBlocked = true;
    parcel.status = 'blocked';
    const newTrackingEvent = {
        status: 'blocked',
        timestamp: new Date(),
        updatedBy: adminId,
        note: 'Parcel blocked by Admin.',
    };
    parcel.trackingEvents.push(newTrackingEvent);
    const result = yield parcel.save();
    return result;
});
exports.ParcelService = {
    createParcel,
    getMyParcels,
    getSingleParcel,
    getAllParcelsForAdmin,
    cancelParcel,
    confirmDelivery,
    updateParcelStatus,
    blockParcel,
};
