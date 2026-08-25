/* eslint-disable */
/**
 * ShipmentService — request and response types.
 *
 * Fields are optional unless an operation takes exactly one argument. The XSD marks almost
 * everything required, search filters included, so its requiredness describes JAXB's default
 * rather than what n11 accepts — encoding it here would only force callers to pass
 * placeholders.
 *
 * GENERATED FILE — do not edit by hand.
 * Source: wsdl/ShipmentService.wsdl · regenerate with `npm run generate`.
 */

import type { RequestPagingData, ResultInfo } from './common.types.js';

export interface ShipmentApiModel {
  templateName?: string;
  installmentInfo?: string;
  exchangeInfo?: string;
  shippingInfo?: string;
  specialDelivery?: boolean;
  deliveryFeeType?: string;
  combinedShipmentAllowed?: boolean;
  shipmentMethod?: string;
  warehouseAddress?: ShipmentSaveAddress;
  exchangeAddress?: ShipmentSaveAddress;
  shipmentCompanies?: ShipmentCompanyApiModelList;
  deliverableCities?: CityApiModelList | null;
  claimShipmentCompany?: ShipmentCompanyApiModel;
  cargoAccountNo?: string | null;
  useDmallCargo?: boolean;
  defaultTemplate?: boolean | null;
}

export interface Address {
  title?: string;
  address?: string;
  district?: DistrictApiModel;
  city?: CityApiModel;
  postalCode?: string;
  feeCondition?: string;
  feeConditionUnit?: number;
  feeConditionPrice?: number;
}

export interface ShipmentSaveAddress {
  title?: string;
  address?: string;
  district?: DistrictApiModel;
  city?: CityApiModel;
  postalCode?: string;
  feeCondition?: number; // observed in production; not in the WSDL
  feeConditionPrice?: number; // observed in production; not in the WSDL
}

export interface DistrictApiModel {
  name?: string;
  id?: number;
}

export interface CityApiModel {
  name?: string;
  code?: number;
}

export interface ShipmentCompanyApiModel {
  name?: string;
  shortName?: string;
}

export interface ShipmentCompanyApiModelList {
  shipmentCompany?: ShipmentCompanyApiModel[];
}

export interface CityApiModelList {
  city?: CityApiModel[];
}

export interface ShipmentTemplateList {
  shipmentTemplate?: ShipmentApiModel[];
}

/** `GetShipmentTemplateList` request body. */
export type GetShipmentTemplateListRequest = {
  pagingData?: RequestPagingData | null;
};

/** `GetShipmentTemplateList` response body. */
export interface GetShipmentTemplateListResponse {
  result?: ResultInfo;
  shipmentTemplates?: ShipmentTemplateList;
}

/** `GetShipmentTemplate` request body. */
export type GetShipmentTemplateRequest = {
  name: string;
};

/** `GetShipmentTemplate` response body. */
export interface GetShipmentTemplateResponse {
  result?: ResultInfo;
  shipmentTemplate?: ShipmentApiModel;
}

/** `CreateOrUpdateShipmentTemplate` request body. */
export type CreateOrUpdateShipmentTemplateRequest = {
  shipment: ShipmentApiModel;
};

/** `CreateOrUpdateShipmentTemplate` response body. */
export interface CreateOrUpdateShipmentTemplateResponse {
  result?: ResultInfo;
  shipmentTemplate?: ShipmentApiModel;
}

