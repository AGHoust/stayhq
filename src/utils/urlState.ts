import { MapState, Pin } from '@/types/map';

// URL state management for map system
export class MapURLState {
  private static readonly MAP_PARAMS = {
    SHOW_MAP: 'map',
    MODE: 'mode',
    PINS: 'pins',
    BOUNDS: 'bounds',
    DESTINATION: 'destination',
    DATES: 'dates',
    GUESTS: 'guests'
  };

  // Encode map state to URL parameters
  static encodeMapState(mapState: Partial<MapState>): URLSearchParams {
    const params = new URLSearchParams();

    if (mapState.mode) {
      params.set(this.MAP_PARAMS.MODE, mapState.mode);
    }

    if (mapState.pins && mapState.pins.length > 0) {
      const pinsString = mapState.pins
        .map(pin => `${pin.id}:${pin.lat.toFixed(4)},${pin.lng.toFixed(4)}:${encodeURIComponent(pin.name)}`)
        .join('|');
      params.set(this.MAP_PARAMS.PINS, pinsString);
    }

    if (mapState.bounds) {
      const boundsString = `${mapState.bounds.south.toFixed(4)},${mapState.bounds.west.toFixed(4)},${mapState.bounds.north.toFixed(4)},${mapState.bounds.east.toFixed(4)}`;
      params.set(this.MAP_PARAMS.BOUNDS, boundsString);
    }

    return params;
  }

  // Decode URL parameters to map state
  static decodeMapState(searchParams: URLSearchParams): Partial<MapState> {
    const mapState: Partial<MapState> = {};

    const mode = searchParams.get(this.MAP_PARAMS.MODE);
    if (mode === 'browse' || mode === 'plan') {
      mapState.mode = mode;
    }

    const pinsString = searchParams.get(this.MAP_PARAMS.PINS);
    if (pinsString) {
      try {
        const pins: Pin[] = pinsString.split('|').map(pinStr => {
          const [id, coords, name] = pinStr.split(':');
          const [lat, lng] = coords.split(',').map(Number);
          return {
            id: id as 'A' | 'B' | 'C',
            name: decodeURIComponent(name),
            lat,
            lng,
            weight: 1
          };
        });
        mapState.pins = pins;
      } catch (error) {
        console.warn('Failed to decode pins from URL:', error);
      }
    }

    const boundsString = searchParams.get(this.MAP_PARAMS.BOUNDS);
    if (boundsString) {
      try {
        const [south, west, north, east] = boundsString.split(',').map(Number);
        mapState.bounds = { south, west, north, east };
      } catch (error) {
        console.warn('Failed to decode bounds from URL:', error);
      }
    }

    return mapState;
  }

  // Encode search parameters
  static encodeSearchParams(searchParams: {
    destination?: string;
    dates?: { checkIn?: string; checkOut?: string };
    guests?: { adults?: number; children?: number; infants?: number; pets?: number };
  }): URLSearchParams {
    const params = new URLSearchParams();

    if (searchParams.destination) {
      params.set(this.MAP_PARAMS.DESTINATION, searchParams.destination);
    }

    if (searchParams.dates?.checkIn && searchParams.dates?.checkOut) {
      params.set(this.MAP_PARAMS.DATES, `${searchParams.dates.checkIn},${searchParams.dates.checkOut}`);
    }

    if (searchParams.guests) {
      const { adults, children, infants, pets } = searchParams.guests;
      const guestsString = [adults, children, infants, pets].filter(Boolean).join(',');
      if (guestsString) {
        params.set(this.MAP_PARAMS.GUESTS, guestsString);
      }
    }

    return params;
  }

  // Decode search parameters
  static decodeSearchParams(searchParams: URLSearchParams): {
    destination?: string;
    dates?: { checkIn?: string; checkOut?: string };
    guests?: { adults?: number; children?: number; infants?: number; pets?: number };
  } {
    const result: any = {};

    const destination = searchParams.get(this.MAP_PARAMS.DESTINATION);
    if (destination) {
      result.destination = destination;
    }

    const dates = searchParams.get(this.MAP_PARAMS.DATES);
    if (dates) {
      const [checkIn, checkOut] = dates.split(',');
      result.dates = { checkIn, checkOut };
    }

    const guests = searchParams.get(this.MAP_PARAMS.GUESTS);
    if (guests) {
      const [adults, children, infants, pets] = guests.split(',').map(Number);
      result.guests = { adults, children, infants, pets };
    }

    return result;
  }

  // Update URL with map state
  static updateURL(mapState: Partial<MapState>, searchParams?: any, replace = false): void {
    const url = new URL(window.location.href);
    
    // Clear existing map parameters
    Object.values(this.MAP_PARAMS).forEach(param => {
      url.searchParams.delete(param);
    });

    // Add map state parameters
    const mapParams = this.encodeMapState(mapState);
    mapParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    // Add search parameters if provided
    if (searchParams) {
      const searchParamsEncoded = this.encodeSearchParams(searchParams);
      searchParamsEncoded.forEach((value, key) => {
        url.searchParams.set(key, value);
      });
    }

    // Update URL
    if (replace) {
      window.history.replaceState({}, '', url.toString());
    } else {
      window.history.pushState({}, '', url.toString());
    }
  }

  // Get current map state from URL
  static getCurrentMapState(): Partial<MapState> {
    const urlParams = new URLSearchParams(window.location.search);
    return this.decodeMapState(urlParams);
  }

  // Get current search parameters from URL
  static getCurrentSearchParams(): any {
    const urlParams = new URLSearchParams(window.location.search);
    return this.decodeSearchParams(urlParams);
  }

  // Generate deep link for listing detail
  static generateListingDeepLink(
    listingId: string,
    mapState: Partial<MapState>,
    searchParams?: any
  ): string {
    const url = new URL(window.location.origin);
    url.pathname = `/listing/${listingId}`;
    
    const mapParams = this.encodeMapState(mapState);
    mapParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    if (searchParams) {
      const searchParamsEncoded = this.encodeSearchParams(searchParams);
      searchParamsEncoded.forEach((value, key) => {
        url.searchParams.set(key, value);
      });
    }

    return url.toString();
  }

  // Generate deep link for search results
  static generateSearchDeepLink(
    mapState: Partial<MapState>,
    searchParams: any
  ): string {
    const url = new URL(window.location.origin);
    url.pathname = '/search';
    
    const mapParams = this.encodeMapState(mapState);
    mapParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    const searchParamsEncoded = this.encodeSearchParams(searchParams);
    searchParamsEncoded.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    return url.toString();
  }
}
