
import type { ZokoConfig } from './types';

/**
 * Zoko API client for handling API calls
 */
export class ZokoApiClient {
  private config: ZokoConfig;
  private isDevelopment: boolean;

  constructor(config: ZokoConfig) {
    this.config = config;
    this.isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
  }

  /**
   * Call Zoko API - try proxy first, then edge function as fallback
   */
  async callZokoAPI(action: string, data?: any): Promise<any> {
    if (this.isDevelopment) {
      try {
        return await this.callZokoViaProxy(action, data);
      } catch (error) {
        console.warn('Proxy failed, falling back to edge function:', error);
        return await this.callEdgeFunction(action, data);
      }
    } else {
      return this.callEdgeFunction(action, data);
    }
  }

  /**
   * Call Zoko API via local proxy server (development only)
   */
  private async callZokoViaProxy(action: string, data?: any): Promise<any> {
    try {
      const proxyUrl = 'http://localhost:3001/zoko-proxy';
      
      console.log(`Making Zoko API call via proxy: ${action}`);
      
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, data }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Proxy Error Response:', errorText);
        throw new Error(`Proxy error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Proxy Success Response:', result);
      return result;
    } catch (error: any) {
      console.error('Proxy call failed:', error);
      
      if (error.message?.includes('fetch')) {
        throw new Error('Could not connect to proxy server. Make sure proxy.js is running on port 3001');
      }
      
      throw error;
    }
  }

  /**
   * Call Supabase Edge Function (for production or as fallback)
   */
  private async callEdgeFunction(action: string, data?: any): Promise<any> {
    try {
      const edgeFunctionUrl = `https://cqsdxzziodtprpsyrrgj.supabase.co/functions/v1/zoko-api`;
      
      console.log(`Making Zoko API call via edge function: ${action}`);
      
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxc2R4enppb2R0cHJwc3lycmdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3OTM0OTksImV4cCI6MjA2NjM2OTQ5OX0.bC6J6qjdZGN9V6nuE1c_CM_FwXocZIYUKb80Ggb9zn0`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, data }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Edge function error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Edge function call failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect to Zoko API via Edge Function'
      };
    }
  }

  /**
   * Test connection to Zoko API
   */
  async testConnection(): Promise<{ success: boolean; error?: string; phoneNumber?: string }> {
    try {
      console.log('Testing Zoko connection...');
      
      const result = await this.callZokoAPI('test_connection');
      
      console.log('Zoko connection test result:', result);
      return result;
    } catch (error: any) {
      console.error('Zoko connection test failed:', error);
      return {
        success: false,
        error: error.message || 'Network error - could not connect to Zoko API'
      };
    }
  }
}
