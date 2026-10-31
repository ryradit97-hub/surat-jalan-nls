import { supabase, isSupabaseConfigured } from './supabaseClient';
import { SuratJalanData } from '../types/suratJalan';
import { getAnonymousDeviceId } from '../utils/deviceId';

export interface SuratJalanHistoryRecord {
  id: string;
  created_at: string;
  device_id: string;
  bl_number: string;
  po_number: string;
  shipper_name: string;
  delivery_address: string;
  driver_name: string;
  license_plate: string;
  document_data: SuratJalanData;
  batch_id?: string;
}

/**
 * Save single or multiple Surat Jalan documents into Supabase history.
 * Tagged automatically with this device's unique anonymous UUID.
 */
export const saveSuratJalanHistory = async (
  documents: SuratJalanData[]
): Promise<boolean> => {
  if (!isSupabaseConfigured || !supabase || documents.length === 0) {
    return false;
  }

  const deviceId = getAnonymousDeviceId();
  const batchId = documents.length > 1 ? crypto.randomUUID() : undefined;

  const records = documents.map((doc) => ({
    device_id: deviceId,
    bl_number: doc.blNumber || 'Draft',
    po_number: doc.poNumber || '',
    shipper_name: doc.shipperName || '',
    delivery_address: doc.deliveryAddress || '',
    driver_name: doc.driverName || '',
    license_plate: doc.licensePlate || '',
    document_data: doc,
    batch_id: batchId,
  }));

  try {
    const { error } = await supabase.from('surat_jalan_history').insert(records);
    if (error) {
      console.warn('Supabase insert history warning:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to save to Supabase history:', err);
    return false;
  }
};

/**
 * Fetch 30-day history for the current anonymous device only.
 * Other devices cannot view these records.
 */
export const fetchSuratJalanHistory = async (
  filterDays: number = 30
): Promise<SuratJalanHistoryRecord[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const deviceId = getAnonymousDeviceId();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - filterDays);

  try {
    const { data, error } = await supabase
      .from('surat_jalan_history')
      .select('*')
      .eq('device_id', deviceId)
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch history warning:', error.message);
      return [];
    }

    return (data as SuratJalanHistoryRecord[]) || [];
  } catch (err) {
    console.error('Failed to fetch from Supabase history:', err);
    return [];
  }
};

/**
 * Fetch single Surat Jalan by its unique ID (for WhatsApp shareable links).
 */
export const fetchSuratJalanById = async (
  id: string
): Promise<SuratJalanData | null> => {
  if (!isSupabaseConfigured || !supabase || !id) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('surat_jalan_history')
      .select('document_data')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return (data.document_data as SuratJalanData) || null;
  } catch (err) {
    console.error('Failed to fetch shared Surat Jalan by ID:', err);
    return null;
  }
};

/**
 * Delete a specific record from the device's history.
 */
export const deleteSuratJalanHistory = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured || !supabase || !id) {
    return false;
  }

  const deviceId = getAnonymousDeviceId();

  try {
    const { error } = await supabase
      .from('surat_jalan_history')
      .delete()
      .eq('id', id)
      .eq('device_id', deviceId);

    return !error;
  } catch (err) {
    console.error('Failed to delete history record:', err);
    return false;
  }
};

