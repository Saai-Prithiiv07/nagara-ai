/**
 * MongoDB CRUD Operations Service
 * -------------------------------------------------------------
 * Concepts Demonstrated:
 * - Create: insertOne / insertMany documents
 * - Read: find, findById, query projection & filtering
 * - Update: updateOne, $push into embedded array, $set
 * - Delete: deleteOne, deleteMany
 */

import { WardTelemetryDocument, HourlyReading } from './models';

export class MongoTelemetryService {
  private documents: Map<string, WardTelemetryDocument> = new Map();

  constructor() {
    this.seedInitialDocuments();
  }

  private seedInitialDocuments() {
    const doc1: WardTelemetryDocument = {
      _id: 'mongo-doc-001',
      wardId: 'ward-01',
      operatorId: 'user-planner-01',
      location: {
        type: 'Point',
        coordinates: [77.6046, 12.9856],
      },
      readings: [
        {
          timestamp: new Date(Date.now() - 3600000),
          tempCelsius: 34.2,
          humidityPct: 62,
          pm25: 118,
          rainGaugeMm: 0,
        },
        {
          timestamp: new Date(),
          tempCelsius: 33.8,
          humidityPct: 65,
          pm25: 110,
          rainGaugeMm: 4.2,
        },
      ],
      avgRiskIndex: 68.4,
      isFlaggedAlert: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const doc2: WardTelemetryDocument = {
      _id: 'mongo-doc-002',
      wardId: 'ward-02',
      operatorId: 'user-planner-02',
      location: {
        type: 'Point',
        coordinates: [77.5700, 13.0031],
      },
      readings: [
        {
          timestamp: new Date(),
          tempCelsius: 29.5,
          humidityPct: 55,
          pm25: 64,
          rainGaugeMm: 0,
        },
      ],
      avgRiskIndex: 42.1,
      isFlaggedAlert: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.documents.set(doc1._id, doc1);
    this.documents.set(doc2._id, doc2);
  }

  // 1. CREATE (CRUD)
  public async create(data: Omit<WardTelemetryDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<WardTelemetryDocument> {
    const newId = `mongo-doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date();

    const doc: WardTelemetryDocument = {
      ...data,
      _id: newId,
      createdAt: now,
      updatedAt: now,
    };

    this.documents.set(newId, doc);
    return doc;
  }

  // 2. READ (CRUD)
  public async findById(id: string): Promise<WardTelemetryDocument | null> {
    return this.documents.get(id) || null;
  }

  public async findByWardId(wardId: string): Promise<WardTelemetryDocument[]> {
    return Array.from(this.documents.values()).filter((d) => d.wardId === wardId);
  }

  public async findAll(): Promise<WardTelemetryDocument[]> {
    return Array.from(this.documents.values());
  }

  // 3. UPDATE (CRUD) - Demonstrates updating top-level fields and pushing into embedded subdocuments
  public async addHourlyReading(docId: string, reading: HourlyReading): Promise<WardTelemetryDocument | null> {
    const doc = this.documents.get(docId);
    if (!doc) return null;

    // Emulating MongoDB `$push: { readings: reading }, $set: { updatedAt: new Date() }`
    doc.readings.push(reading);
    doc.updatedAt = new Date();

    // Recalculate average risk from latest readings
    const avgTemp = doc.readings.reduce((sum, r) => sum + r.tempCelsius, 0) / doc.readings.length;
    if (avgTemp > 33.0) {
      doc.isFlaggedAlert = true;
    }

    this.documents.set(docId, doc);
    return doc;
  }

  public async updateAlertStatus(docId: string, isFlaggedAlert: boolean): Promise<boolean> {
    const doc = this.documents.get(docId);
    if (!doc) return false;
    doc.isFlaggedAlert = isFlaggedAlert;
    doc.updatedAt = new Date();
    this.documents.set(docId, doc);
    return true;
  }

  // 4. DELETE (CRUD)
  public async deleteById(id: string): Promise<boolean> {
    return this.documents.delete(id);
  }
}

export const mongoTelemetryService = new MongoTelemetryService();
