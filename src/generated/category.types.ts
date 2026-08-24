/* eslint-disable */
/**
 * CategoryService — request and response types.
 *
 * Fields are optional unless an operation takes exactly one argument. The XSD marks almost
 * everything required, search filters included, so its requiredness describes JAXB's default
 * rather than what n11 accepts — encoding it here would only force callers to pass
 * placeholders.
 *
 * GENERATED FILE — do not edit by hand.
 * Source: wsdl/CategoryService.wsdl · regenerate with `npm run generate`.
 */

import type { PagingData, RequestPagingData, ResultInfo } from './common.types.js';

export interface CategoryData {
  id?: number;
  name?: string;
  parentCategory?: CategoryData;
  subCategoryList?: SubCategoryList;
  attributeList?: CategoryAttributeList;
  metadata?: PagingData;
}

export interface SubCategoryData {
  id?: number;
  name?: string;
  subCategoryList?: SubCategoryList;
}

export interface SubCategory {
  id?: number;
  name?: string;
  lastModifiedDate?: string;
}

export interface ParentCategoryData {
  id?: number;
  name?: string;
  parentCategory?: ParentCategory;
}

export interface ParentCategory {
  id?: number;
  name?: string;
}

export interface CategoryAttributeList {
  attribute?: CategoryAttributeData[];
}

export interface TopCategoryList {
  category?: SubCategory[];
}

export interface SubCategoryList {
  subCategory?: SubCategory[];
}

export interface CategoryProductAttributeList {
  categoryProductAttribute?: CategoryProductAttributeData[];
}

export interface CategoryProductAttributeData {
  id?: number;
  name?: string;
  mandatory?: boolean;
  multipleSelect?: boolean;
  variant?: boolean;
  slicer?: boolean;
  grouping?: boolean;
  customValue?: boolean;
}

export interface CategoryProductAttributeValueData {
  id?: number;
  name?: string;
  dependedName?: string | null;
}

export interface CategoryProductAttributeValueList {
  categoryProductAttributeValue?: CategoryProductAttributeValueData[];
}

export interface CategoryAttributeData {
  id?: number;
  name?: string;
  mandatory?: boolean;
  multipleSelect?: boolean;
  valueList?: CategoryAttributeValueList;
  priority?: number;
  variant?: boolean;
  slicer?: boolean;
  grouping?: boolean;
  customValue?: boolean;
}

export interface CategoryAttributeValueList {
  value?: CategoryAttributeValueData[];
}

export interface CategoryAttributeValueData {
  id?: number;
  name?: string;
  dependedName?: string | null;
}

/** `GetCategoryAttributesId` request body. */
export type GetCategoryAttributesIdRequest = {
  categoryId: number;
};

/** `GetCategoryAttributesId` response body. */
export interface GetCategoryAttributesIdResponse {
  result?: ResultInfo;
  categoryProductAttributeList?: CategoryProductAttributeList;
}

/** `GetCategoryAttributes` request body. */
export type GetCategoryAttributesRequest = {
  categoryId?: number;
  pagingData?: RequestPagingData;
};

/** `GetCategoryAttributes` response body. */
export interface GetCategoryAttributesResponse {
  result?: ResultInfo;
  category?: CategoryData;
}

/** `GetCategoryAttributeValue` request body. */
export type GetCategoryAttributeValueRequest = {
  categoryProductAttributeId?: number;
  categoryId?: number;
  pagingData?: RequestPagingData;
};

/** `GetCategoryAttributeValue` response body. */
export interface GetCategoryAttributeValueResponse {
  result?: ResultInfo;
  categoryProductAttributeValueList?: CategoryProductAttributeValueList;
  pagingData?: PagingData;
}

/** `GetParentCategory` request body. */
export type GetParentCategoryRequest = {
  categoryId: number;
};

/** `GetParentCategory` response body. */
export interface GetParentCategoryResponse {
  result?: ResultInfo;
  category?: ParentCategoryData;
}

/** `GetTopLevelCategories` request body. */
export type GetTopLevelCategoriesRequest = {};

/** `GetTopLevelCategories` response body. */
export interface GetTopLevelCategoriesResponse {
  result?: ResultInfo;
  categoryList?: TopCategoryList;
}

/** `GetSubCategories` request body. */
export type GetSubCategoriesRequest = {
  categoryId?: number;
  lastModifiedDate?: string | null;
};

/** `GetSubCategories` response body. */
export interface GetSubCategoriesResponse {
  result?: ResultInfo;
  category?: SubCategoryData[];
}

