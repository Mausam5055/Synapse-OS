import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Singleton Supabase Client
export const supabase: SupabaseClient | null = 
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export interface BlockchainRecord {
  id: string;
  profile_id: string;
  patient_name: string;
  abha_number: string;
  tx_hash: string;
  cid: string;
  record_type: string;
  timestamp_raw: string;
  facility: string;
  verified: boolean;
  created_at?: string;
}

const LOCAL_STORAGE_RECORDS_KEY = 'synapseos_blockchain_records_cache';

/**
 * Helper to get cached records from localStorage (for offline/demo fallback)
 */
function getLocalCachedRecords(): BlockchainRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_RECORDS_KEY);
    if (!raw) return [];
    const parsed: BlockchainRecord[] = JSON.parse(raw);
    
    // Purge unwanted test / accidental records
    const cleaned = parsed.filter(r => {
      const typeStr = (r.record_type || '').toLowerCase();
      const idStr = (r.id || '').toLowerCase();
      const cidStr = (r.cid || '').toLowerCase();
      if (typeStr.includes('chat chronicles') || idStr.includes('0x46500031') || cidStr.includes('qmb4bmn3ygatbeuwfe671ljarjpngyhesjgvatrv8mkaf')) {
        return false;
      }
      return true;
    });

    if (cleaned.length !== parsed.length) {
      localStorage.setItem(LOCAL_STORAGE_RECORDS_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

/**
 * Helper to save cached records to localStorage
 */
function saveLocalCachedRecords(records: BlockchainRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_RECORDS_KEY, JSON.stringify(records));
  } catch (e) {
    console.warn('Failed to save blockchain records to localStorage cache', e);
  }
}

/**
 * Fetches blockchain records for a specific citizen profile from Supabase.
 * Falls back to local storage and mock registry if Supabase is not configured or offline.
 */
export async function fetchBlockchainRecords(
  profileId?: string,
  abhaNumber?: string
): Promise<BlockchainRecord[]> {
  const localCached = getLocalCachedRecords();

  if (supabase) {
    try {
      let query = supabase
        .from('blockchain_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (profileId) {
        query = query.or(`profile_id.eq.${profileId},abha_number.eq.${abhaNumber || ''}`);
      } else if (abhaNumber) {
        query = query.eq('abha_number', abhaNumber);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        // Merge Supabase data with any freshly uploaded local cached records
        const combined = [...data];
        for (const localRec of localCached) {
          if (!combined.some(r => r.id === localRec.id || r.cid === localRec.cid)) {
            if (!profileId || localRec.profile_id === profileId || localRec.abha_number === abhaNumber) {
              combined.unshift(localRec);
            }
          }
        }
        return combined;
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to cached records:', err);
    }
  }

  // Fallback: Return matching local cached records
  if (profileId || abhaNumber) {
    const filtered = localCached.filter(
      r => (profileId && r.profile_id === profileId) || (abhaNumber && r.abha_number === abhaNumber)
    );
    if (filtered.length > 0) return filtered;
  }

  return localCached;
}

/**
 * Inserts a new blockchain record into Supabase and updates localStorage cache.
 */
export async function insertBlockchainRecord(
  record: BlockchainRecord
): Promise<{ success: boolean; data?: BlockchainRecord; error?: any }> {
  // 1. Always update local storage cache immediately for instant UI persistence
  const currentLocal = getLocalCachedRecords();
  const updatedLocal = [record, ...currentLocal.filter(r => r.id !== record.id)];
  saveLocalCachedRecords(updatedLocal);

  // 2. Persist to Supabase if client is active
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('blockchain_records')
        .insert([
          {
            id: record.id,
            profile_id: record.profile_id,
            patient_name: record.patient_name,
            abha_number: record.abha_number,
            tx_hash: record.tx_hash,
            cid: record.cid,
            record_type: record.record_type,
            timestamp_raw: record.timestamp_raw,
            facility: record.facility,
            verified: record.verified
          }
        ])
        .select()
        .single();

      if (error) {
        console.warn('Supabase insert warning (saved locally):', error);
        return { success: true, data: record, error };
      }

      return { success: true, data: data || record };
    } catch (err) {
      console.warn('Supabase network error (saved locally):', err);
      return { success: true, data: record, error: err };
    }
  }

  return { success: true, data: record };
}

/**
 * Updates an existing blockchain record in Supabase.
 */
export async function updateBlockchainRecord(
  id: string,
  updates: Partial<BlockchainRecord>
): Promise<{ success: boolean; error?: any }> {
  // Update local cache
  const currentLocal = getLocalCachedRecords();
  const updatedLocal = currentLocal.map(r => r.id === id ? { ...r, ...updates } : r);
  saveLocalCachedRecords(updatedLocal);

  if (supabase) {
    try {
      const { error } = await supabase
        .from('blockchain_records')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.warn('Supabase update warning:', error);
        return { success: false, error };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  }

  return { success: true };
}

/**
 * Deletes a blockchain record from Supabase and local cache.
 */
export async function deleteBlockchainRecord(
  id: string
): Promise<{ success: boolean; error?: any }> {
  const currentLocal = getLocalCachedRecords();
  const updatedLocal = currentLocal.filter(r => r.id !== id && r.cid !== id && r.record_type !== id);
  saveLocalCachedRecords(updatedLocal);

  if (supabase) {
    try {
      const { error } = await supabase
        .from('blockchain_records')
        .delete()
        .or(`id.eq.${id},cid.eq.${id}`);

      if (error) return { success: false, error };
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  }

  return { success: true };
}
