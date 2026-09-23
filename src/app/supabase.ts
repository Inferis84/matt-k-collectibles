import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey,
    );
  }

  /**
   * Insert a commission request row into the `commission_request` table.
   * Converts Date deadline to ISO date string (YYYY-MM-DD) before sending.
   */
  async insertCommissionRequest(payload: any) {
    const sendPayload = { ...payload };
    if (sendPayload.deadline instanceof Date) {
      sendPayload.deadline = sendPayload.deadline.toISOString().split('T')[0];
    }

    try {
      // Try using Supabase client first
      const { data, error } = await this.supabase
        .from('commission_request')
        .insert([sendPayload])
        .select();

      if (!error) {
        return { success: true, data };
      }

      // If Supabase responded with an error, fall through to fallback
      console.error('Supabase client insert error', error);
    } catch (err) {
      console.error('Supabase client exception', err);
    }

    // No available method to persist
    return {
      success: false,
      error: 'No Supabase config or fallback endpoint available',
    };
  }

  async getGalleryProjects() {
    try {
      const { data, error } = await this.supabase
        .from('gallery_project')
        .select('title,description,reference_name,price,sold');

      if (error) {
        console.error('Supabase gallery query error', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (err) {
      console.error('Supabase gallery query exception', err);
      return { success: false, error: err };
    }
  }
}
