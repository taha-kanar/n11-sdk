/* eslint-disable */
/**
 * Types every n11 service declares identically — authentication, paging and result envelopes.
 *
 * GENERATED FILE — do not edit by hand. Run `npm run generate`.
 */

export interface Authentication {
  appKey?: string;
  appSecret?: string;
}

export interface BaseRequest {
  authentication?: Authentication;
}

export interface BaseResponse {
  status?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  errorCategory?: string | null;
}

export interface PagingData {
  currentPage?: number | null;
  pageSize?: number | null;
  totalCount?: number | null;
  pageCount?: number | null;
}

export interface RequestPagingData {
  currentPage?: number | null;
  pageSize?: number | null;
}

export interface ResultInfo {
  status?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  errorCategory?: string | null;
}

export interface ShipmentCompanyData {
  id?: number;
  name?: string;
  shortName?: string;
}

