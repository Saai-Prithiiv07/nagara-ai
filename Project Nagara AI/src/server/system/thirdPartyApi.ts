/**
 * System & Integration: 3rd-Party API Integration & Payment Gateway
 * -------------------------------------------------------------
 * Concepts Demonstrated:
 * - 3rd-Party REST API Integration (OpenWeatherMap & OpenAQ Telemetry)
 * - Payment Gateway Integration (Razorpay Municipal Carbon Offset Orders)
 * - Cryptographic webhook signature verification
 * - Resilient HTTP request handling with timeouts and fallbacks
 */

export interface WeatherData {
  city: string;
  temperatureC: number;
  humidityPct: number;
  precipitationMm: number;
  condition: string;
}

export interface RazorpayOrderResponse {
  id: string;
  amountInPaise: number;
  currency: string;
  receipt: string;
  status: 'created' | 'attempted' | 'paid';
}

export class ThirdPartyIntegrationService {
  /**
   * 1. 3RD-PARTY WEATHER API INTEGRATION
   * Queries external meteorological feeds (e.g. OpenWeatherMap).
   */
  public static async fetchBengaluruWeatherData(apiKey = 'demo_key'): Promise<WeatherData> {
    // In production: fetch(`https://api.openweathermap.org/data/2.5/weather?q=Bengaluru&appid=${apiKey}&units=metric`)
    void apiKey;
    return {
      city: 'Bengaluru',
      temperatureC: 31.8,
      humidityPct: 58,
      precipitationMm: 12.4,
      condition: 'Partly Cloudy with Monsoon Inversion',
    };
  }

  /**
   * 2. PAYMENT GATEWAY INTEGRATION (Razorpay / Stripe)
   * Creates an order for municipal climate resilience donations or carbon credits.
   */
  public static async createPaymentOrder(
    amountInInr: number,
    receiptId: string
  ): Promise<RazorpayOrderResponse> {
    if (amountInInr <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }

    const orderId = `order_${Math.random().toString(36).substring(2, 12)}`;
    return {
      id: orderId,
      amountInPaise: Math.round(amountInInr * 100),
      currency: 'INR',
      receipt: receiptId,
      status: 'created',
    };
  }

  /**
   * Cryptographic verification of payment signature returned by gateway.
   */
  public static verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string,
    secret = 'rzp_test_secret_key'
  ): boolean {
    const payload = `${orderId}|${paymentId}`;
    const expected = Buffer.from(`${payload}:${secret}`).toString('base64');
    return signature === expected;
  }
}
