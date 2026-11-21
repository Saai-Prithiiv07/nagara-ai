import { describe, it, expect } from 'vitest';
import {
  WardTelemetry,
  Ward,
  User,
  HourlyReadingSchema,
  WardSchema,
  UserSchema,
  WardTelemetrySchema,
  fetchWithEmbeddedSubdocuments,
  addEmbeddedReading,
  fetchWithReferencedPopulation,
  demonstrateEmbeddingVsReferencing,
} from '../models/WardTelemetry';

describe('NoSQL (Mongo): Embedding vs Referencing Relationships & Indexing', () => {
  it('defines embedded HourlyReadingSchema with required fields', () => {
    expect(HourlyReadingSchema.path('timestamp')).toBeDefined();
    expect(HourlyReadingSchema.path('tempCelsius')).toBeDefined();
    expect(HourlyReadingSchema.path('humidityPct')).toBeDefined();
    expect(HourlyReadingSchema.path('pm25')).toBeDefined();
    expect(HourlyReadingSchema.path('rainGaugeMm')).toBeDefined();
  });

  it('defines referenced Ward and User schemas with primary identifiers', () => {
    expect(WardSchema.path('wardNumber')).toBeDefined();
    expect(WardSchema.path('wardName')).toBeDefined();
    expect(UserSchema.path('email')).toBeDefined();
    expect(UserSchema.path('role')).toBeDefined();
  });

  it('configures both embedded subdocuments and referenced ObjectIds in WardTelemetrySchema', () => {
    // 1. Embedded relationship: readings is an array of subdocuments
    const readingsType = WardTelemetrySchema.path('readings');
    expect(readingsType).toBeDefined();

    // 2. Referenced relationships: wardRef and operatorRef with ref targets
    const wardRef = WardTelemetrySchema.path('wardRef') as any;
    expect(wardRef.options.ref).toBe('Ward');

    const operatorRef = WardTelemetrySchema.path('operatorRef') as any;
    expect(operatorRef.options.ref).toBe('User');
  });

  it('registers indexes for query performance (compound, 2dsphere, TTL)', () => {
    const indexes = WardTelemetrySchema.indexes();
    expect(indexes.length).toBeGreaterThanOrEqual(4);

    // Compound index { wardId: 1, createdAt: -1 }
    const compound = indexes.find((idx) => (idx[0] as any).wardId === 1 && (idx[0] as any).createdAt === -1);
    expect(compound).toBeDefined();

    // Geospatial index { location: '2dsphere' }
    const geospatial = indexes.find((idx) => (idx[0] as any).location === '2dsphere');
    expect(geospatial).toBeDefined();

    // TTL index with expireAfterSeconds
    const ttl = indexes.find((idx) => (idx[0] as any).createdAt === 1 && (idx[1] as any)?.expireAfterSeconds === 2592000);
    expect(ttl).toBeDefined();
  });

  it('exposes helper methods to demonstrate embedding vs referencing queries', () => {
    expect(typeof fetchWithEmbeddedSubdocuments).toBe('function');
    expect(typeof addEmbeddedReading).toBe('function');
    expect(typeof fetchWithReferencedPopulation).toBe('function');
    expect(typeof demonstrateEmbeddingVsReferencing).toBe('function');
  });
});
