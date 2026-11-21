/**
 * Frontend Service: Async Data Fetching from API
 * -------------------------------------------------------------
 * Concepts Demonstrated:
 * - Async data fetching using modern Fetch API and async/await
 * - Non-blocking request dispatch with AbortController timeout
 * - Structured error parsing and retry strategies
 * - Integration with backend RESTful endpoints
 */

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  statusCode: number;
}

export class ApiClient {
  private static readonly BASE_URL = '/api/v1';

  /**
   * Performs an asynchronous GET request with AbortController timeout.
   */
  public static async get<T>(
    endpoint: string,
    authToken?: string,
    timeoutMs = 8000
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`${this.BASE_URL}${endpoint}`, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        return {
          data: null,
          error: errorBody.message || `HTTP ${response.status}: Request failed`,
          statusCode: response.status,
        };
      }

      const json = await response.json();
      return {
        data: json,
        error: null,
        statusCode: response.status,
      };
    } catch (err) {
      clearTimeout(timeoutId);
      const isAbort = err instanceof DOMException && err.name === 'AbortError';
      return {
        data: null,
        error: isAbort ? 'Network timeout: Request took longer than 8 seconds' : (err as Error).message,
        statusCode: isAbort ? 408 : 500,
      };
    }
  }

  /**
   * Performs an asynchronous POST request.
   */
  public static async post<TRequest, TResponse>(
    endpoint: string,
    body: TRequest,
    authToken?: string
  ): Promise<ApiResponse<TResponse>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`${this.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          data: null,
          error: json.message || `HTTP ${response.status}: Request failed`,
          statusCode: response.status,
        };
      }

      return {
        data: json,
        error: null,
        statusCode: response.status,
      };
    } catch (err) {
      return {
        data: null,
        error: (err as Error).message,
        statusCode: 500,
      };
    }
  }
}
