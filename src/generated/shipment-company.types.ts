/* eslint-disable */
/**
 * ShipmentCompanyService — request and response types.
 *
 * Fields are optional unless an operation takes exactly one argument. The XSD marks almost
 * everything required, search filters included, so its requiredness describes JAXB's default
 * rather than what n11 accepts — encoding it here would only force callers to pass
 * placeholders.
 *
 * GENERATED FILE — do not edit by hand.
 * Source: wsdl/ShipmentCompanyService.wsdl · regenerate with `npm run generate`.
 */

import type { ResultInfo, ShipmentCompanyData } from './common.types.js';

export interface ShipmentCompanyList {
  shipmentCompany?: ShipmentCompanyData[];
}

/** `GetShipmentCompanies` request body. */
export type GetShipmentCompaniesRequest = {};

/** `GetShipmentCompanies` response body. */
export interface GetShipmentCompaniesResponse {
  result?: ResultInfo;
  shipmentCompanies?: ShipmentCompanyList;
}

