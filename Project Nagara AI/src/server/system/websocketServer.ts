/**
 * System & Integration: WebSocket / Real-Time Communication
 * -------------------------------------------------------------
 * Concepts Demonstrated:
 * - Full-duplex bidirectional real-time communication
 * - Connection lifecycle management (connect, heartbeat/ping, disconnect)
 * - Broadcast channel for live urban sensor telemetry & optimization ticks
 */

export interface WebSocketMessage<T = unknown> {
  type: 'SUBSCRIBE' | 'TELEMETRY_UPDATE' | 'OPTIMISATION_PROGRESS' | 'ALERT';
  channel?: string;
  payload: T;
  timestamp: string;
}

export type MessageListener = (msg: WebSocketMessage) => void;

export class SimulatedWebSocketServer {
  private clients = new Set<string>();
  private subscriptions = new Map<string, Set<string>>(); // channel -> clientIds
  private listeners: MessageListener[] = [];

  public handleConnection(clientId: string): void {
    this.clients.add(clientId);
  }

  public handleDisconnection(clientId: string): void {
    this.clients.delete(clientId);
    for (const subscribers of this.subscriptions.values()) {
      subscribers.delete(clientId);
    }
  }

  public subscribe(clientId: string, channel: string): void {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    this.subscriptions.get(channel)!.add(clientId);
  }

  public broadcast(channel: string, type: WebSocketMessage['type'], payload: unknown): WebSocketMessage {
    const message: WebSocketMessage = {
      type,
      channel,
      payload,
      timestamp: new Date().toISOString(),
    };

    // Dispatch to registered message listeners
    for (const listener of this.listeners) {
      listener(message);
    }

    return message;
  }

  public onMessage(listener: MessageListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getConnectedClientsCount(): number {
    return this.clients.size;
  }
}

export const wsServer = new SimulatedWebSocketServer();
