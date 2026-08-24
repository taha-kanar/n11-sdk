import { BaseService } from '../core/resource/base-service.js';
import type { RequestOptions } from '../soap/transport.js';
import type {
  CreateOrUpdateShipmentTemplateRequest,
  CreateOrUpdateShipmentTemplateResponse,
  GetShipmentTemplateListRequest,
  GetShipmentTemplateListResponse,
  GetShipmentTemplateResponse,
} from '../generated/shipment.types.js';

/**
 * Shipment templates — the delivery terms a product is sold under.
 *
 * Every product references a template by name, so templates must exist before `SaveProduct`.
 *
 * @see https://api.n11.com/ws/ShipmentService.wsdl
 */
export class ShipmentsService extends BaseService {
  /**
   * Templates defined by the seller, paginated.
   *
   * @operation GetShipmentTemplateList
   */
  listTemplates(
    body: GetShipmentTemplateListRequest,
    options: RequestOptions = {}
  ): Promise<GetShipmentTemplateListResponse> {
    return this.call<GetShipmentTemplateListResponse>('GetShipmentTemplateList', body, options);
  }

  /**
   * One template, by name — the same name products refer to.
   *
   * @operation GetShipmentTemplate
   */
  getTemplate(name: string, options: RequestOptions = {}): Promise<GetShipmentTemplateResponse> {
    return this.call<GetShipmentTemplateResponse>('GetShipmentTemplate', { name }, options);
  }

  /**
   * Create a template, or replace the one with the same name.
   *
   * @operation CreateOrUpdateShipmentTemplate
   */
  saveTemplate(
    body: CreateOrUpdateShipmentTemplateRequest,
    options: RequestOptions = {}
  ): Promise<CreateOrUpdateShipmentTemplateResponse> {
    return this.call<CreateOrUpdateShipmentTemplateResponse>('CreateOrUpdateShipmentTemplate', body, options);
  }
}
