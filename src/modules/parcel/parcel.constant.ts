// src/modules/parcel/parcel.constant.ts

// Define the possible statuses for a parcel.
export const PARCEL_STATUS_VALUES = [
  'requested',
  'pending',
  'in_transit',
  'delivered',
  'canceled',
  'returned',
  'blocked',
] as const;