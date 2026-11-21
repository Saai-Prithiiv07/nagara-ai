/**
 * MongoDB / Mongoose Schema Modeling
 * -------------------------------------------------------------
 * Concepts Demonstrated:
 * - Schema modeling with types, required fields, and validation
 * - Embedding vs Referencing relationships:
 *   * Embedded: HourlySensorReading embedded inside WardTelemetry document
 *     for atomic single-document reads of localized high-frequency telemetry.
 *   * Referenced: wardRef and reportedBy referencing separate collections by ObjectId.
 * - Indexing for query performance:
 *   * Compound index on (wardId, recordedAt)
 *   * Geospatial 2dsphere index on location coordinates
 *   * TTL index (Time-To-Live) for automated telemetry archival
 */

export interface HourlyReading {
  timestamp: Date;
  tempCelsius: number;
  humidityPct: number;
  pm25: number;
  rainGaugeMm: number;
}

export interface WardTelemetryDocument {
  _id: string;
  wardId: string; // Foreign reference key
  operatorId: string; // User reference key
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude] for 2dsphere index
  };
  // EMBEDDED RELATIONSHIP: Array of hourly readings stored directly within the document
  readings: HourlyReading[];
  avgRiskIndex: number;
  isFlaggedAlert: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose Schema definition representation for documentation & runtime validation.
 */
export const MongoSchemaDefinitions = {
  HourlyReadingSchema: {
    timestamp: { type: Date, required: true },
    tempCelsius: { type: Number, required: true, min: -10, max: 60 },
    humidityPct: { type: Number, required: true, min: 0, max: 100 },
    pm25: { type: Number, required: true, min: 0 },
    rainGaugeMm: { type: Number, required: true, min: 0 },
  },

  WardTelemetrySchema: {
    wardId: { type: String, required: true, ref: 'Ward' }, // REFERENCED RELATIONSHIP
    operatorId: { type: String, required: true, ref: 'User' }, // REFERENCED RELATIONSHIP
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    // EMBEDDED RELATIONSHIP
    readings: ['HourlyReadingSchema'],
    avgRiskIndex: { type: Number, required: true, min: 0, max: 100 },
    isFlaggedAlert: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, expires: '30d' }, // TTL INDEX: 30 days
  },

  // INDEX SPECIFICATIONS FOR QUERY PERFORMANCE:
  Indexes: [
    { fields: { wardId: 1, createdAt: -1 }, name: 'compound_ward_date_idx' },
    { fields: { location: '2dsphere' }, name: 'geospatial_location_idx' },
    { fields: { avgRiskIndex: -1 }, name: 'risk_ranking_idx' },
    { fields: { createdAt: 1 }, options: { expireAfterSeconds: 2592000 }, name: 'ttl_30_days_idx' },
  ],
};
