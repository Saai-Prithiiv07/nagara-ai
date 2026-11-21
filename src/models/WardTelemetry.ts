import mongoose, { Schema, Document, model } from 'mongoose';

/**
 * MongoDB / Mongoose Schema Modeling
 * =============================================================
 * Concepts Demonstrated:
 * 1. Schema modeling (Mongo): Strongly-typed Mongoose Schemas & Models
 * 2. Embedding vs referencing relationships:
 *    - EMBEDDING (Subdocuments):
 *      * HourlyReadingSchema is embedded directly inside WardTelemetry (`readings: [HourlyReadingSchema]`)
 *      * Advantages: Single document atomicity, fast collocated reads, zero joins required
 *      * Best for: 1-to-few bounded data like time-series sensor logs
 *    - REFERENCING (Normalized ObjectId References):
 *      * wardRef points to 'Ward' collection (`type: Schema.Types.ObjectId, ref: 'Ward'`)
 *      * operatorRef points to 'User' collection (`type: Schema.Types.ObjectId, ref: 'User'`)
 *      * Advantages: Prevents data duplication, unbounded array growth, and stale copies
 *      * Dereferencing / Join: Executed via `.populate('wardRef').populate('operatorRef')`
 * 3. Indexing for query performance (Mongo):
 *    - Compound index: `{ wardId: 1, createdAt: -1 }`
 *    - Geospatial index: `{ location: '2dsphere' }`
 *    - TTL index: `{ createdAt: 1 }, expireAfterSeconds: 2592000 (30 days)`
 *    - Metric index: `{ avgRiskIndex: -1 }`
 */

// =============================================================
// 1. REFERENCED MODELS (Normalized Collections)
// =============================================================

export interface IWard extends Document {
  wardNumber: number;
  wardName: string;
  zone: string;
  areaSqKm: number;
  population: number;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
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

// =============================================================
// 2. EMBEDDED SUBDOCUMENT SCHEMA (Denormalized inside parent)
// =============================================================

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

// =============================================================
// 3. ROOT TELEMETRY DOCUMENT (Embedding vs Referencing)
// =============================================================

export interface IWardTelemetry extends Document {
  wardId: string;
  
  // REFERENCING RELATIONSHIPS: Stores foreign ObjectIds referencing separate collections
  wardRef?: mongoose.Types.ObjectId | IWard;
  operatorRef?: mongoose.Types.ObjectId | IUser;

  location: {
    type: 'Point';
    coordinates: [number, number];
  };

  // EMBEDDING RELATIONSHIP: Subdocument array stored directly within the parent document
  readings: IHourlyReading[];

  avgRiskIndex: number;
  isFlaggedAlert: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const WardTelemetrySchema = new Schema<IWardTelemetry>(
  {
    wardId: { type: String, required: true },

    // REFERENCING RELATIONSHIP (Object ID reference to Ward collection)
    wardRef: { type: Schema.Types.ObjectId, ref: 'Ward' },

    // REFERENCING RELATIONSHIP (Object ID reference to User collection)
    operatorRef: { type: Schema.Types.ObjectId, ref: 'User' },

    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },

    // EMBEDDING RELATIONSHIP: Array of embedded subdocuments
    readings: [HourlyReadingSchema],

    avgRiskIndex: { type: Number, required: true, min: 0, max: 100 },
    isFlaggedAlert: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// =============================================================
// 4. INDEXING FOR QUERY PERFORMANCE (MONGO)
// =============================================================

// Compound index for fast timeseries queries by ward
WardTelemetrySchema.index({ wardId: 1, createdAt: -1 });

// Geospatial index for radius and proximity queries
WardTelemetrySchema.index({ location: '2dsphere' });

// TTL index (Time-To-Live) to expire records after 30 days
WardTelemetrySchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

// Metric index for fast descending risk queries
WardTelemetrySchema.index({ avgRiskIndex: -1 });

export const WardTelemetry =
  mongoose.models.WardTelemetry ||
  model<IWardTelemetry>('WardTelemetry', WardTelemetrySchema);

// =============================================================
// 5. QUERY HELPERS: EMBEDDING VS REFERENCING RELATIONSHIPS
// =============================================================

/**
 * Accesses EMBEDDED subdocuments directly from parent document.
 * Requires NO join / populate — read is completely atomic and fast.
 */
export async function fetchWithEmbeddedSubdocuments(id: string) {
  const telemetry = await WardTelemetry.findById(id);
  // Embedded readings are immediately available in memory
  return {
    id: telemetry?._id,
    wardId: telemetry?.wardId,
    readingsCount: telemetry?.readings.length ?? 0,
    readings: telemetry?.readings ?? [],
  };
}

/**
 * Pushes a new reading into the EMBEDDED subdocument array.
 * Demonstrates atomic subdocument manipulation without foreign table updates.
 */
export async function addEmbeddedReading(id: string, reading: IHourlyReading) {
  return await WardTelemetry.findByIdAndUpdate(
    id,
    { $push: { readings: reading } },
    { new: true }
  );
}

/**
 * Resolves REFERENCED documents using Mongoose .populate().
 * Traverses ObjectId foreign keys to pull the full Ward and User documents.
 */
export async function fetchWithReferencedPopulation(id: string) {
  return await WardTelemetry.findById(id)
    .populate('wardRef')
    .populate('operatorRef')
    .exec();
}

/**
 * Demonstrates comparative differences between Embedding vs Referencing.
 */
export async function demonstrateEmbeddingVsReferencing(id: string) {
  // 1. EMBEDDED: Read parent doc and access subdocuments directly
  const embeddedResult = await fetchWithEmbeddedSubdocuments(id);

  // 2. REFERENCED: Read parent doc and dereference foreign keys with .populate()
  const referencedResult = await fetchWithReferencedPopulation(id);

  return {
    relationshipType: 'Embedding vs Referencing in MongoDB',
    embedded: {
      description: 'Embedded subdocuments (HourlyReadingSchema) stored inline',
      readings: embeddedResult.readings,
    },
    referenced: {
      description: 'Referenced collections (Ward & User) resolved via .populate()',
      ward: (referencedResult as any)?.wardRef,
      operator: (referencedResult as any)?.operatorRef,
    },
  };
}

export default WardTelemetry;
