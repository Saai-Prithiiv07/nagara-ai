import mongoose, { Schema, Document, model } from 'mongoose';

/**
 * MongoDB / Mongoose Schema Modeling
 * -------------------------------------------------------------
 * Concepts Demonstrated:
 * - Schema modeling (Mongo) with Schema and model
 * - Embedding vs referencing relationships:
 *   * Embedding: HourlyReadingSchema embedded directly inside WardTelemetry document
 *   * Referencing: wardRef and operatorRef referencing separate collections by ObjectId
 * - Indexing for query performance (Mongo):
 *   * Compound index: { wardId: 1, createdAt: -1 }
 *   * Geospatial index: { location: '2dsphere' }
 *   * TTL index: { createdAt: 1 }, expireAfterSeconds: 2592000 (30 days)
 */

// 1. EMBEDDED SUBDOCUMENT SCHEMA
export interface IHourlyReading {
  timestamp: Date;
  tempCelsius: number;
  humidityPct: number;
  pm25: number;
  rainGaugeMm: number;
}

export const HourlyReadingSchema = new Schema<IHourlyReading>({
  timestamp: { type: Date, required: true, default: Date.now },
  tempCelsius: { type: Number, required: true, min: -10, max: 60 },
  humidityPct: { type: Number, required: true, min: 0, max: 100 },
  pm25: { type: Number, required: true, min: 0 },
  rainGaugeMm: { type: Number, required: true, min: 0 },
});

// 2. ROOT DOCUMENT SCHEMA WITH EMBEDDED & REFERENCED RELATIONSHIPS
export interface IWardTelemetry extends Document {
  wardId: string;
  operatorId?: string;
  wardRef?: mongoose.Types.ObjectId; // REFERENCED RELATIONSHIP
  operatorRef?: mongoose.Types.ObjectId; // REFERENCED RELATIONSHIP
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  readings: IHourlyReading[]; // EMBEDDED RELATIONSHIP
  avgRiskIndex: number;
  isFlaggedAlert: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const WardTelemetrySchema = new Schema<IWardTelemetry>(
  {
    wardId: { type: String, required: true },
    // REFERENCED RELATIONSHIP
    wardRef: { type: Schema.Types.ObjectId, ref: 'Ward' },
    operatorRef: { type: Schema.Types.ObjectId, ref: 'User' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    // EMBEDDED RELATIONSHIP: Array of subdocuments embedded in the parent document
    readings: [HourlyReadingSchema],
    avgRiskIndex: { type: Number, required: true, min: 0, max: 100 },
    isFlaggedAlert: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 3. INDEXING FOR QUERY PERFORMANCE (MONGO)
// Compound index for time-series range queries per ward
WardTelemetrySchema.index({ wardId: 1, createdAt: -1 });

// Geospatial 2dsphere index for proximity spatial lookups
WardTelemetrySchema.index({ location: '2dsphere' });

// TTL index to automatically archive/expire telemetry records after 30 days
WardTelemetrySchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

// Risk index for fast sorting and ranking
WardTelemetrySchema.index({ avgRiskIndex: -1 });

export const WardTelemetry =
  mongoose.models.WardTelemetry ||
  model<IWardTelemetry>('WardTelemetry', WardTelemetrySchema);

// Backwards-compatible interface definitions
export type HourlyReading = IHourlyReading;
export type WardTelemetryDocument = IWardTelemetry;
