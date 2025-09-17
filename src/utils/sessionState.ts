import { MapState, Pin } from '@/types/map';

// Session state management for map system
export class MapSessionState {
  private static readonly STORAGE_KEYS = {
    MAP_TOGGLE: 'stayhq_map_toggle',
    MAP_MODE: 'stayhq_map_mode',
    PINS: 'stayhq_map_pins',
    BOUNDS: 'stayhq_map_bounds',
    SEARCH_MODE: 'stayhq_search_mode'
  };

  // Save map toggle state
  static saveMapToggle(showMap: boolean): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.MAP_TOGGLE, JSON.stringify(showMap));
    } catch (error) {
      console.warn('Failed to save map toggle state:', error);
    }
  }

  // Load map toggle state
  static loadMapToggle(): boolean {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.MAP_TOGGLE);
      return stored ? JSON.parse(stored) : false;
    } catch (error) {
      console.warn('Failed to load map toggle state:', error);
      return false;
    }
  }

  // Save map mode
  static saveMapMode(mode: 'browse' | 'plan'): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.MAP_MODE, mode);
    } catch (error) {
      console.warn('Failed to save map mode:', error);
    }
  }

  // Load map mode
  static loadMapMode(): 'browse' | 'plan' {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.MAP_MODE);
      return (stored === 'browse' || stored === 'plan') ? stored : 'browse';
    } catch (error) {
      console.warn('Failed to load map mode:', error);
      return 'browse';
    }
  }

  // Save pins
  static savePins(pins: Pin[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.PINS, JSON.stringify(pins));
    } catch (error) {
      console.warn('Failed to save pins:', error);
    }
  }

  // Load pins
  static loadPins(): Pin[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.PINS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load pins:', error);
      return [];
    }
  }

  // Save map bounds
  static saveMapBounds(bounds: { north: number; south: number; east: number; west: number }): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.BOUNDS, JSON.stringify(bounds));
    } catch (error) {
      console.warn('Failed to save map bounds:', error);
    }
  }

  // Load map bounds
  static loadMapBounds(): { north: number; south: number; east: number; west: number } | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.BOUNDS);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load map bounds:', error);
      return null;
    }
  }

  // Save search mode
  static saveSearchMode(mode: 'standard' | 'smart'): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.SEARCH_MODE, mode);
    } catch (error) {
      console.warn('Failed to save search mode:', error);
    }
  }

  // Load search mode
  static loadSearchMode(): 'standard' | 'smart' {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.SEARCH_MODE);
      return (stored === 'standard' || stored === 'smart') ? stored : 'standard';
    } catch (error) {
      console.warn('Failed to load search mode:', error);
      return 'standard';
    }
  }

  // Save complete map state
  static saveMapState(mapState: Partial<MapState>): void {
    if (mapState.mode) {
      this.saveMapMode(mapState.mode);
    }
    if (mapState.pins) {
      this.savePins(mapState.pins);
    }
    if (mapState.bounds) {
      this.saveMapBounds(mapState.bounds);
    }
  }

  // Load complete map state
  static loadMapState(): Partial<MapState> {
    return {
      mode: this.loadMapMode(),
      pins: this.loadPins(),
      bounds: this.loadMapBounds()
    };
  }

  // Clear all map state
  static clearMapState(): void {
    try {
      Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Failed to clear map state:', error);
    }
  }

  // Check if map state exists
  static hasMapState(): boolean {
    try {
      return Object.values(this.STORAGE_KEYS).some(key => 
        localStorage.getItem(key) !== null
      );
    } catch (error) {
      console.warn('Failed to check map state:', error);
      return false;
    }
  }

  // Get storage usage info
  static getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      let used = 0;
      Object.values(this.STORAGE_KEYS).forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          used += value.length;
        }
      });

      // Estimate available space (most browsers have 5-10MB limit)
      const available = 5 * 1024 * 1024; // 5MB
      const percentage = (used / available) * 100;

      return { used, available, percentage };
    } catch (error) {
      console.warn('Failed to get storage info:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }
}
