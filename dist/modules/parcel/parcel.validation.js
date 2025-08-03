"use strict";
// src/modules/parcel/parcel.validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelValidation = void 0;
const zod_1 = require("zod");
const parcel_constant_1 = require("./parcel.constant"); // Import from the new constant file.
const createParcelZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        senderId: zod_1.z.string({ required_error: 'Sender ID is required' }),
        receiverId: zod_1.z.string({ required_error: 'Receiver ID is required' }),
        parcelDetails: zod_1.z.object({
            type: zod_1.z.string({ required_error: 'Parcel type is required' }),
            weight: zod_1.z.number({ required_error: 'Parcel weight is required' }).min(0.1, 'Weight must be greater than 0'),
            dimensions: zod_1.z.object({
                width: zod_1.z.number().min(0, 'Width cannot be negative'),
                height: zod_1.z.number().min(0, 'Height cannot be negative'),
                length: zod_1.z.number().min(0, 'Length cannot be negative'),
            }).optional(),
        }),
        fee: zod_1.z.number({ required_error: 'Delivery fee is required' }).min(0, 'Fee cannot be negative').optional(),
    }),
});
const updateParcelStatusZodSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(parcel_constant_1.PARCEL_STATUS_VALUES), // Use the imported constant.
        note: zod_1.z.string().optional(),
        location: zod_1.z.string().optional()
    })
});
exports.ParcelValidation = {
    createParcelZodSchema,
    updateParcelStatusZodSchema,
};
