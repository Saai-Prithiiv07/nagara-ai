import mongoose, { Schema, Document, model } from 'mongoose';

/**
 * MongoDB / Mongoose Schema Modeling
 * =============================================================
 * Concepts Demonstrated:
 * 1. Schema modeling (Mongo) with Schema and model
 * 2. Embedding vs referencing relationships:
 *    - Embedding: HourlyReadingSchema embedded directly inside WardTelemetry
 *    - Referencing: wardRef and operatorRef referencing separate Ward & User collections
 * 3. Indexing for query performance (Mongo):
 *    - Compound index: { wardId: 1, createdAt: -1 }
 *    - Geospatial index: { location: '2dsphere' }
 *    - TTL index: { createdAt: 1 }, expireAfterSeconds: 2592000 (30 days)
 *    - Metric index: { avgRiskIndex: -1 }
 */

// 1. REFERENCED MODELS
export interface IWard extends Document {
  wardNumber: number;
  wardName: string;
  zone: string;
  areaSqKm: number;
  population: number;
}

export const WardSchema = new Schema<IWard>(
  {
    wardNumber: { type: Number, required: true, unique: true },
    wardName: { type: String, required: true },
    zone: { type: String, required: true },
    areaSqKm: { type: Number, required: true },
    population: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Ward = mongoose.models.Ward || model<IWard>('Ward', WardSchema);

export interface IUser extends Document {
  name: string;
  email: string;
  role: string;
}

export const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: 'operator' },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || model<IUser>('User', UserSchema);

// 2. EMBEDDED SUBDOCUMENT SCHEMA
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

// 3. ROOT TELEMETRY DOCUMENT (Embedding vs Referencing)
export interface IWardTelemetry extends Document {
  wardId: string;
  operatorId?: string;
  // REFERENCING RELATIONSHIP
  wardRef?: mongoose.Types.ObjectId | IWard;
  operatorRef?: mongoose.Types.ObjectId | IUser;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  // EMBEDDED RELATIONSHIP
  readings: IHourlyReading[];
  avgRiskIndex: number;
  isFlaggedAlert: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const WardTelemetrySchema = new Schema<IWardTelemetry>(
  {
    wardId: { type: String, required: true },
    // REFERENCING RELATIONSHIPS
    wardRef: { type: Schema.Types.ObjectId, ref: 'Ward' },
    operatorRef: { type: Schema.Types.ObjectId, ref: 'User' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    // EMBEDDING RELATIONSHIP
    readings: [HourlyReadingSchema],
    avgRiskIndex: { type: Number, required: true, min: 0, max: 100 },
    isFlaggedAlert: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// 4. INDEXING FOR QUERY PERFORMANCE (MONGO)
WardTelemetrySchema.index({ wardId: 1, createdAt: -1 });
WardTelemetrySchema.index({ location: '2dsphere' });
WardTelemetrySchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });
WardTelemetrySchema.index({ avgRiskIndex: -1 });

export const WardTelemetry =
  mongoose.models.WardTelemetry ||
  model<IWardTelemetry>('WardTelemetry', WardTelemetrySchema);

// Backwards-compatible aliases
export type HourlyReading = IHourlyReading;
export type WardTelemetryDocument = IWardTelemetry;
