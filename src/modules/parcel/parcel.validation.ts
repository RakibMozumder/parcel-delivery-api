// src/modules/parcel/parcel.validation.ts

import { z } from 'zod';
import { PARCEL_STATUS_VALUES } from './parcel.constant'; // Import from the new constant file.

const createParcelZodSchema = z.object({
  body: z.object({
    senderId: z.string({ error: 'Sender ID is required' }),
    receiverId: z.string({ error: 'Receiver ID is required' }),
    
    parcelDetails: z.object({
      type: z.string({ error: 'Parcel type is required' }),
      weight: z.number({ error: 'Parcel weight is required' }).min(0.1, 'Weight must be greater than 0'),
      dimensions: z.object({
        width: z.number().min(0, 'Width cannot be negative'),
        height: z.number().min(0, 'Height cannot be negative'),
        length: z.number().min(0, 'Length cannot be negative'),
      }).optional(),
    }),
    
    fee: z.number({ error: 'Delivery fee is required' }).min(0, 'Fee cannot be negative')
  }),
});

const updateParcelStatusZodSchema = z.object({
  body: z.object({
    status: z.enum(PARCEL_STATUS_VALUES), // Use the imported constant.
    note: z.string().optional(),
    location: z.string().optional()
  })
});

export const ParcelValidation = {
  createParcelZodSchema,
  updateParcelStatusZodSchema,
};