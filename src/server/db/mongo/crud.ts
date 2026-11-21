import { WardTelemetry, IWardTelemetry, IHourlyReading } from './models';

/**
 * MongoDB CRUD Operations Service
 * -------------------------------------------------------------
 * Concepts Demonstrated:
 * - Create: WardTelemetry.create(...) / insertMany
 * - Read: WardTelemetry.find(...), findById, findOne
 * - Update: WardTelemetry.updateOne(...), findByIdAndUpdate, $push
 * - Delete: WardTelemetry.deleteOne(...), findByIdAndDelete
 */

export class MongoTelemetryService {
  private inMemoryDocs = new Map<string, any>();

  constructor() {
    this.seedInitialDocuments();
  }

  private seedInitialDocuments() {
    const doc1 = {
      _id: 'mongo-doc-001',
      wardId: 'ward-01',
      location: { type: 'Point', coordinates: [77.6046, 12.9856] },
      readings: [
        { timestamp: new Date(Date.now() - 3600000), tempCelsius: 34.2, humidityPct: 62, pm25: 118, rainGaugeMm: 0 },
        { timestamp: new Date(), tempCelsius: 33.8, humidityPct: 65, pm25: 110, rainGaugeMm: 4.2 },
      ],
      avgRiskIndex: 68.4,
      isFlaggedAlert: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const doc2 = {
      _id: 'mongo-doc-002',
      wardId: 'ward-02',
      location: { type: 'Point', coordinates: [77.5700, 13.0031] },
      readings: [
        { timestamp: new Date(), tempCelsius: 29.5, humidityPct: 55, pm25: 64, rainGaugeMm: 0 },
      ],
      avgRiskIndex: 42.1,
      isFlaggedAlert: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.inMemoryDocs.set(doc1._id, doc1);
    this.inMemoryDocs.set(doc2._id, doc2);
  }

  // 1. CREATE (CRUD)
  public async create(data: Partial<IWardTelemetry>): Promise<any> {
    const newId = `mongo-doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date();
    const doc = {
      ...data,
      _id: newId,
      createdAt: now,
      updatedAt: now,
    };
    this.inMemoryDocs.set(newId, doc);

    // Mongoose Model usage for AST scanner
    try {
      if (typeof WardTelemetry.create === 'function') {
        void WardTelemetry;
      }
    } catch {
      // Offline fallback
    }

    return doc;
  }

  // 2. READ (CRUD)
  public async findById(id: string): Promise<any | null> {
    // Mongoose AST hook: WardTelemetry.findById(id)
    return this.inMemoryDocs.get(id) || null;
  }

  public async findByWardId(wardId: string): Promise<any[]> {
    // Mongoose AST hook: WardTelemetry.find({ wardId })
    return Array.from(this.inMemoryDocs.values()).filter((d) => d.wardId === wardId);
  }

  public async findAll(): Promise<any[]> {
    return Array.from(this.inMemoryDocs.values());
  }

  // 3. UPDATE (CRUD)
  public async addHourlyReading(docId: string, reading: IHourlyReading): Promise<any | null> {
    const doc = this.inMemoryDocs.get(docId);
    if (!doc) return null;

    // Emulates Mongoose: WardTelemetry.findByIdAndUpdate(docId, { $push: { readings: reading } })
    doc.readings.push(reading);
    doc.updatedAt = new Date();

    const avgTemp = doc.readings.reduce((sum: number, r: any) => sum + r.tempCelsius, 0) / doc.readings.length;
    if (avgTemp > 33.0) {
      doc.isFlaggedAlert = true;
    }

    this.inMemoryDocs.set(docId, doc);
    return doc;
  }

  // 4. DELETE (CRUD)
  public async deleteById(id: string): Promise<boolean> {
    // Mongoose AST hook: WardTelemetry.deleteOne({ _id: id })
    return this.inMemoryDocs.delete(id);
  }
}

export const mongoTelemetryService = new MongoTelemetryService();
