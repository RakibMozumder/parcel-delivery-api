// src/modules/parcel/parcel.model.ts

import { Schema, model } from 'mongoose';
import { ITrackingEvent, IParcelDocument } from './parcel.interface'; // Import the new type
import { PARCEL_STATUS_VALUES } from './parcel.constant';


const TrackingEventSchema = new Schema<ITrackingEvent>({
  status: { type: String, enum: PARCEL_STATUS_VALUES, required: true },
  timestamp: { type: Date, default: Date.now, required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  note: { type: String },
});

const ParcelSchema = new Schema<IParcelDocument>( // Use IParcelDocument here
  {  trackingId: { type: String, unique: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
      enum: PARCEL_STATUS_VALUES, // Use the imported constant.
      default: 'requested',
      required: true,
    },
    currentLocation: { type: String },
    trackingEvents: [TrackingEventSchema],
    isCanceled: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isConfirmed: { type: Boolean, default: false },
    fee: { type: Number, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  },
);

// Correctly type the `this` context with IParcelDocument
ParcelSchema.pre<IParcelDocument>('save', async function (next) {
  if (this.isNew) {
    const today = new Date();
    const formattedDate = today.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.$model('Parcel').countDocuments({});
    const trackingNumber = (count + 1).toString().padStart(6, '0');
    this.trackingId = `TRK-${formattedDate}-${trackingNumber}`;
  }
  next();
});

export const Parcel = model<IParcelDocument>('Parcel', ParcelSchema);