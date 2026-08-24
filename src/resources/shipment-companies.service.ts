import { BaseService } from '../core/resource/base-service.js';
import type { RequestOptions } from '../soap/transport.js';
import type { GetShipmentCompaniesResponse } from '../generated/shipment-company.types.js';

/**
 * The carriers n11 can hand a package to.
 *
 * The ids returned here are what `OrderItemDelivery` expects as `shipmentCompanyId`.
 *
 * @see https://api.n11.com/ws/ShipmentCompanyService.wsdl
 */
export class ShipmentCompaniesService extends BaseService {
  /**
   * Every shipment company available to the seller.
   *
   * @operation GetShipmentCompanies
   */
  list(options: RequestOptions = {}): Promise<GetShipmentCompaniesResponse> {
    return this.call<GetShipmentCompaniesResponse>('GetShipmentCompanies', {}, options);
  }
}
