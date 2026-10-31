import { supabase, isSupabaseConfigured } from './supabaseClient';
import { SuratJalanData, ShipperPreset, DriverPreset } from '../types/suratJalan';
import {
  defaultDeliveryAddresses,
  defaultGoodsDescriptions,
  defaultShippers,
  defaultDrivers,
} from '../utils/defaultData';
import { getAnonymousDeviceId } from '../utils/deviceId';

const MEMORY_CACHE_KEY = 'nls_learned_memory_cache';

export interface LearnedMemoryState {
  shippers: ShipperPreset[];
  deliveryAddresses: string[];
  goodsDescriptions: string[];
  drivers: DriverPreset[];
}

// In-memory cache synced with localStorage
let memoryCache: LearnedMemoryState = {
  shippers: [],
  deliveryAddresses: [],
  goodsDescriptions: [],
  drivers: [],
};

// Initialize from localStorage immediately
const initLocalCache = () => {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(MEMORY_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      memoryCache = {
        shippers: Array.isArray(parsed.shippers) ? parsed.shippers : [],
        deliveryAddresses: Array.isArray(parsed.deliveryAddresses) ? parsed.deliveryAddresses : [],
        goodsDescriptions: Array.isArray(parsed.goodsDescriptions) ? parsed.goodsDescriptions : [],
        drivers: Array.isArray(parsed.drivers) ? parsed.drivers : [],
      };
    }
  } catch (e) {
    console.warn('Failed to load local master memory cache:', e);
  }
};

initLocalCache();

const saveLocalCache = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MEMORY_CACHE_KEY, JSON.stringify(memoryCache));
  } catch (e) {
    console.warn('Failed to save master memory cache to localStorage:', e);
  }
};

/**
 * Fetch all learned master memory from Supabase and synchronize local cache
 */
export const fetchMasterMemoryFromSupabase = async (): Promise<LearnedMemoryState> => {
  if (!isSupabaseConfigured || !supabase) {
    return memoryCache;
  }

  try {
    const { data, error } = await supabase
      .from('nls_master_memory')
      .select('*')
      .order('usage_count', { ascending: false });

    if (error) {
      console.warn('Supabase master memory query warning:', error.message);
      return memoryCache;
    }

    if (Array.isArray(data)) {
      const newShippers: ShipperPreset[] = [];
      const newAddresses: string[] = [];
      const newGoods: string[] = [];
      const newDrivers: DriverPreset[] = [];

      data.forEach((row: any) => {
        if (row.category === 'shipper' && row.name) {
          newShippers.push({
            id: row.id || `ship-${row.name}`,
            name: row.name,
            address: row.data?.address || '',
          });
        } else if (row.category === 'delivery_address' && row.name) {
          newAddresses.push(row.name);
        } else if (row.category === 'goods_description' && row.name) {
          newGoods.push(row.name);
        } else if (row.category === 'driver' && row.name) {
          newDrivers.push({
            id: row.id || `drv-${row.name}`,
            name: row.name,
            phone: row.data?.phone || '',
            licensePlate: row.data?.licensePlate || '',
            unitType: row.data?.unitType || 'Trailer 40ft',
          });
        }
      });

      memoryCache = {
        shippers: newShippers,
        deliveryAddresses: newAddresses,
        goodsDescriptions: newGoods,
        drivers: newDrivers,
      };

      saveLocalCache();
    }
  } catch (err) {
    console.warn('Error fetching master memory from Supabase:', err);
  }

  return memoryCache;
};

/**
 * Automatically learns new Shippers, Delivery Addresses, and Nama Barang from Surat Jalan.
 * Instantly updates local memory and persists into Supabase in background.
 */
export const learnFromSuratJalan = async (documents: SuratJalanData[]): Promise<void> => {
  if (!documents || documents.length === 0) return;

  const deviceId = getAnonymousDeviceId();
  let cacheModified = false;
  const upsertRows: Array<{
    category: string;
    name: string;
    data: any;
    device_id: string;
  }> = [];

  documents.forEach((doc) => {
    // 1. Learn Delivery Address
    const rawAddr = doc.deliveryAddress?.trim();
    if (rawAddr && rawAddr.length > 3) {
      const isDefault = defaultDeliveryAddresses.some(
        (a) => a.toLowerCase() === rawAddr.toLowerCase()
      );
      const isLearned = memoryCache.deliveryAddresses.some(
        (a) => a.toLowerCase() === rawAddr.toLowerCase()
      );

      if (!isDefault && !isLearned) {
        memoryCache.deliveryAddresses.push(rawAddr);
        cacheModified = true;
      }

      upsertRows.push({
        category: 'delivery_address',
        name: rawAddr,
        data: {},
        device_id: deviceId,
      });
    }

    // 2. Learn Shipper Name & Address
    const shipperName = doc.shipperName?.trim();
    const shipperAddr = doc.shipperAddress?.trim() || '';
    if (shipperName && shipperName.length > 2) {
      const isDefault = defaultShippers.some(
        (s) => s.name.toLowerCase() === shipperName.toLowerCase()
      );
      const isLearned = memoryCache.shippers.some(
        (s) => s.name.toLowerCase() === shipperName.toLowerCase()
      );

      if (!isDefault && !isLearned) {
        memoryCache.shippers.push({
          id: `ship-learned-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: shipperName,
          address: shipperAddr,
        });
        cacheModified = true;
      }

      upsertRows.push({
        category: 'shipper',
        name: shipperName,
        data: { address: shipperAddr },
        device_id: deviceId,
      });
    }

    // 3. Learn Nama Barang (Goods Descriptions)
    doc.items?.forEach((it) => {
      const rawGoods = it.description?.trim().toUpperCase();
      if (rawGoods && rawGoods.length > 2) {
        const isDefault = defaultGoodsDescriptions.some(
          (g) => g.toLowerCase() === rawGoods.toLowerCase()
        );
        const isLearned = memoryCache.goodsDescriptions.some(
          (g) => g.toLowerCase() === rawGoods.toLowerCase()
        );

        if (!isDefault && !isLearned) {
          memoryCache.goodsDescriptions.push(rawGoods);
          cacheModified = true;
        }

        upsertRows.push({
          category: 'goods_description',
          name: rawGoods,
          data: {},
          device_id: deviceId,
        });
      }
    });

    // 4. Learn Driver & Truck Data
    const driverName = doc.driverName?.trim();
    if (driverName && driverName.length > 2) {
      const isDefault = defaultDrivers.some(
        (d) => d.name.toLowerCase() === driverName.toLowerCase()
      );
      const isLearned = memoryCache.drivers.some(
        (d) => d.name.toLowerCase() === driverName.toLowerCase()
      );

      if (!isDefault && !isLearned) {
        memoryCache.drivers.push({
          id: `drv-learned-${Date.now()}`,
          name: driverName,
          phone: doc.phoneNo || '',
          licensePlate: doc.licensePlate || '',
          unitType: doc.unitType || 'Trailer 40ft',
        });
        cacheModified = true;
      }

      upsertRows.push({
        category: 'driver',
        name: driverName,
        data: {
          phone: doc.phoneNo || '',
          licensePlate: doc.licensePlate || '',
          unitType: doc.unitType || 'Trailer 40ft',
        },
        device_id: deviceId,
      });
    }
  });

  if (cacheModified) {
    saveLocalCache();
  }

  // Persist / Upsert into Supabase in background
  if (isSupabaseConfigured && supabase && upsertRows.length > 0) {
    // Deduplicate rows within this batch before sending
    const uniqueMap = new Map<string, typeof upsertRows[0]>();
    upsertRows.forEach((r) => {
      const key = `${r.category}:${r.name.toLowerCase()}`;
      uniqueMap.set(key, r);
    });
    const dedupedRows = Array.from(uniqueMap.values());

    try {
      // Upsert using category + name
      await supabase.from('nls_master_memory').upsert(dedupedRows, {
        onConflict: 'category,name',
        ignoreDuplicates: false,
      });
    } catch (err) {
      console.warn('Background master memory sync failed:', err);
    }
  }
};

/**
 * Access merged delivery addresses (Defaults + Learned from memory)
 */
export const getMergedDeliveryAddresses = (): string[] => {
  const merged = [...defaultDeliveryAddresses];
  memoryCache.deliveryAddresses.forEach((addr) => {
    if (!merged.some((m) => m.toLowerCase() === addr.toLowerCase())) {
      merged.push(addr);
    }
  });
  return merged;
};

/**
 * Access merged goods descriptions (Defaults + Learned from memory)
 */
export const getMergedGoodsDescriptions = (): string[] => {
  const merged = [...defaultGoodsDescriptions];
  memoryCache.goodsDescriptions.forEach((goods) => {
    if (!merged.some((m) => m.toLowerCase() === goods.toLowerCase())) {
      merged.push(goods);
    }
  });
  return merged;
};

/**
 * Access merged shippers (Defaults + Learned from memory)
 */
export const getMergedShippers = (): ShipperPreset[] => {
  const merged = [...defaultShippers];
  memoryCache.shippers.forEach((shipper) => {
    if (!merged.some((m) => m.name.toLowerCase() === shipper.name.toLowerCase())) {
      merged.push(shipper);
    }
  });
  return merged;
};

/**
 * Access merged drivers (Defaults + Learned from memory)
 */
export const getMergedDrivers = (): DriverPreset[] => {
  const merged = [...defaultDrivers];
  memoryCache.drivers.forEach((driver) => {
    if (!merged.some((m) => m.name.toLowerCase() === driver.name.toLowerCase())) {
      merged.push(driver);
    }
  });
  return merged;
};

/**
 * Delete a specific learned item from local cache and Supabase
 */
export const deleteLearnedItem = async (
  category: 'shipper' | 'delivery_address' | 'goods_description' | 'driver',
  name: string
): Promise<void> => {
  if (category === 'delivery_address') {
    memoryCache.deliveryAddresses = memoryCache.deliveryAddresses.filter(
      (a) => a.toLowerCase() !== name.toLowerCase()
    );
  } else if (category === 'goods_description') {
    memoryCache.goodsDescriptions = memoryCache.goodsDescriptions.filter(
      (g) => g.toLowerCase() !== name.toLowerCase()
    );
  } else if (category === 'shipper') {
    memoryCache.shippers = memoryCache.shippers.filter(
      (s) => s.name.toLowerCase() !== name.toLowerCase()
    );
  } else if (category === 'driver') {
    memoryCache.drivers = memoryCache.drivers.filter(
      (d) => d.name.toLowerCase() !== name.toLowerCase()
    );
  }
  saveLocalCache();

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('nls_master_memory')
        .delete()
        .eq('category', category)
        .eq('name', name);
    } catch (err) {
      console.warn('Failed to delete item from Supabase master memory:', err);
    }
  }
};
