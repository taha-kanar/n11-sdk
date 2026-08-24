import { BaseService } from '../core/resource/base-service.js';
import type { RequestOptions } from '../soap/transport.js';
import type {
  GetCitiesResponse,
  GetCityResponse,
  GetDistrictResponse,
  GetNeighborhoodsResponse,
} from '../generated/city.types.js';

/**
 * Address reference data: cities, districts and neighbourhoods of Türkiye.
 *
 * Order addresses come back with these ids, and shipment templates are defined against them.
 * The data barely changes — cache it rather than calling per order.
 *
 * @see https://api.n11.com/ws/CityService.wsdl
 */
export class CitiesService extends BaseService {
  /**
   * All 81 cities with their codes.
   *
   * @operation GetCities
   */
  list(options: RequestOptions = {}): Promise<GetCitiesResponse> {
    return this.call<GetCitiesResponse>('GetCities', {}, options);
  }

  /**
   * One city, by its plate code (`1` for Adana, `34` for İstanbul).
   *
   * @operation GetCity
   */
  get(cityCode: number, options: RequestOptions = {}): Promise<GetCityResponse> {
    return this.call<GetCityResponse>('GetCity', { cityCode }, options);
  }

  /**
   * Districts of a city, by plate code.
   *
   * @operation GetDistrict
   */
  districts(cityCode: number, options: RequestOptions = {}): Promise<GetDistrictResponse> {
    return this.call<GetDistrictResponse>('GetDistrict', { cityCode }, options);
  }

  /**
   * Neighbourhoods of a district, by the district's id (not its name).
   *
   * @operation GetNeighborhoods
   */
  neighborhoods(districtId: number, options: RequestOptions = {}): Promise<GetNeighborhoodsResponse> {
    return this.call<GetNeighborhoodsResponse>('GetNeighborhoods', { districtId }, options);
  }
}
