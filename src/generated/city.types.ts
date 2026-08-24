/* eslint-disable */
/**
 * CityService — request and response types.
 *
 * Fields are optional unless an operation takes exactly one argument. The XSD marks almost
 * everything required, search filters included, so its requiredness describes JAXB's default
 * rather than what n11 accepts — encoding it here would only force callers to pass
 * placeholders.
 *
 * GENERATED FILE — do not edit by hand.
 * Source: wsdl/CityService.wsdl · regenerate with `npm run generate`.
 */

import type { ResultInfo } from './common.types.js';

export interface CityData {
  cityCode?: string;
  cityId?: number;
  cityName?: string;
}

export interface CityList {
  city?: CityData[];
}

export interface CreateCityData {
  cityId?: number;
}

export interface DistrictData {
  name?: string;
  id?: number;
}

export interface DistrictList {
  district?: DistrictData[];
}

export interface CreateDistrictData {
  id?: number;
}

export interface NeighborhoodData {
  name?: string;
  id?: number;
}

export interface NeighborhoodListData {
  neighborhood?: NeighborhoodData[];
}

/** `GetCities` request body. */
export type GetCitiesRequest = {};

/** `GetCities` response body. */
export interface GetCitiesResponse {
  result?: ResultInfo;
  cities?: CityList;
}

/** `GetCity` request body. */
export type GetCityRequest = {
  cityCode: number;
};

/** `GetCity` response body. */
export interface GetCityResponse {
  result?: ResultInfo;
  city?: CityData;
}

/** `GetNeighborhoods` request body. */
export type GetNeighborhoodsRequest = {
  districtId: number;
};

/** `GetNeighborhoods` response body. */
export interface GetNeighborhoodsResponse {
  result?: ResultInfo;
  neighborhoods?: NeighborhoodListData;
}

/** `GetDistrict` request body. */
export type GetDistrictRequest = {
  cityCode: number;
};

/** `GetDistrict` response body. */
export interface GetDistrictResponse {
  result?: ResultInfo;
  districts?: DistrictList;
}

