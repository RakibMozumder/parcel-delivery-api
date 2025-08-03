"use strict";
// src/modules/parcel/parcel.model.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parcel = void 0;
const mongoose_1 = require("mongoose");
const parcel_constant_1 = require("./parcel.constant");
const TrackingEventSchema = new mongoose_1.Schema({
    status: { type: String, enum: parcel_constant_1.PARCEL_STATUS_VALUES, required: true },
    timestamp: { type: Date, default: Date.now, required: true },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    note: { type: String },
});
const ParcelSchema = new mongoose_1.Schema(// Use IParcelDocument here
{ trackingId: { type: String, unique: true },
    senderId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    parcelDetails: {
        type: { type: String, required: true },
        weight: { type: Number, required: true },
        dimensions: {
            width: { type: Number },
            height: { type: Number },
            length: { type: Number },
        },
    },
    senderInfo: {
        name: { type: String, required: true },
        address: { type: String, required: true },
        phone: { type: String, required: true },
    },
    receiverInfo: {
        name: { type: String, required: true },
        address: { type: String, required: true },
        phone: { type: String, required: true },
    },
    status: {
        type: String,
        enum: parcel_constant_1.PARCEL_STATUS_VALUES, // Use the imported constant.
        default: 'requested',
        required: true,
    },
    currentLocation: { type: String },
    trackingEvents: [TrackingEventSchema],
    isCanceled: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isConfirmed: { type: Boolean, default: false },
    fee: { type: Number, required: true },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
});
// Correctly type the `this` context with IParcelDocument
ParcelSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isNew) {
            const today = new Date();
            const formattedDate = today.toISOString().slice(0, 10).replace(/-/g, '');
            const count = yield this.$model('Parcel').countDocuments({});
            const trackingNumber = (count + 1).toString().padStart(6, '0');
            this.trackingId = `TRK-${formattedDate}-${trackingNumber}`;
        }
        next();
    });
});
exports.Parcel = (0, mongoose_1.model)('Parcel', ParcelSchema);
