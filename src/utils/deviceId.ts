// Utility to manage anonymous device UUID for isolated 30-day history
const DEVICE_ID_KEY = 'nls_anonymous_device_id';

export const getAnonymousDeviceId = (): string => {
  if (typeof window === 'undefined') return 'server_side';

  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      // Generate a secure RFC4122 v4 UUID
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        deviceId = crypto.randomUUID();
      } else {
        deviceId = 'dev_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      }
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch (err) {
    console.warn('Failed to access localStorage for deviceId:', err);
    return 'fallback_device_session';
  }
};

