// src/modules/parcel/parcel.interface.ts

import { Document, Types } from "mongoose";

// The type for the Mongoose document instance.
export interface IParcelDocument extends IParcel, Document {}

// Defines the possible statuses for a parcel.
export type ParcelStatus =
  | "requested"
  | "pending"
  | "in_transit"
  | "delivered"
  | "canceled"
  | "returned"
  | "blocked";

// The interface for a single tracking event, which will be a sub-document.
export interface ITrackingEvent {
  status: ParcelStatus;
  timestamp: Date;
  updatedBy: Types.ObjectId; // A reference to the user who updated the status.
  note?: string; // An optional note for the status change.
}

// The interface for the main Parcel document.
export interface IParcel {
  trackingId: string;
  senderId: Types.ObjectId; // Reference to the sender user.
  receiverId: Types.ObjectId; // Reference to the receiver user.
  parcelDetails: {
    type: string;
    weight: number; // in kg
    dimensions?: {
      width: number;
      height: number;
      length: number;
    };
  };
  senderInfo: {
    name: string;
    address: string;
    contactNumber: string;
  };
  receiverInfo: {
    name: string;
    address: string;
    contactNumber: string;
  };
  status: ParcelStatus;
  currentLocation?: string;
  trackingEvents: ITrackingEvent[];
  isCanceled: boolean;
  isBlocked: boolean;
  isConfirmed: boolean; // For the receiver to confirm delivery.
  fee: number;
}
