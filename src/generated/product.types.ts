/* eslint-disable */
/**
 * ProductService — request and response types.
 *
 * Fields are optional unless an operation takes exactly one argument. The XSD marks almost
 * everything required, search filters included, so its requiredness describes JAXB's default
 * rather than what n11 accepts — encoding it here would only force callers to pass
 * placeholders.
 *
 * GENERATED FILE — do not edit by hand.
 * Source: wsdl/ProductService.wsdl · regenerate with `npm run generate`.
 */

import type { PagingData, RequestPagingData, ResultInfo } from './common.types.js';

export type ProductStatus = "Active" | "Suspended" | "Prohibited" | "WaitingForApproval" | "Rejected" | "UnapprovedUpdate" | "Unlisted";

export type ProductQuestionStatus = "CLOSED" | "OPEN";

export interface Product {
  id?: number;
  title?: string;
  displayPrice?: number;
  price?: number;
  productSellerCode?: string;
  description?: string;
  category?: Category;
  specialProductInfoList?: SpecialProductInfoList | null;
  preparingDay?: number;
  productCondition?: string;
  expirationDate?: string;
  images?: ProductImageList;
  stockItems?: ProductSkuList;
  discount?: ProductDiscount;
  shipmentTemplate?: string;
  groupAttribute?: string;
  groupItemCode?: string;
  itemName?: string;
  attributes?: ProductAttributeList | null;
  approvalStatus?: number | null;
  saleStatus?: number;
  currencyAmount?: number;
  currencyType?: number;
  unitInfo?: ProductUnitInfoModel;
  maxPurchaseQuantity?: number;
  productStatusDetail?: string;
  sellerNote?: string;
}

export interface SpecialProductInfoList {
  specialProductInfo?: SpecialProductInfoApiModel[];
}

export interface ProductBasicList {
  product?: ProductBasic[];
}

export interface ProductRequest {
  productSellerCode?: string;
  title?: string;
  description?: string;
  domestic?: boolean;
  category?: CategoryRequest;
  specialProductInfoList?: SpecialProductInfoList | null;
  price?: number;
  currencyType?: number;
  images?: ProductImageList;
  approvalStatus?: number | null;
  groupAttribute?: string;
  groupItemCode?: string;
  itemName?: string;
  attributes?: ProductAttributeRequestList;
  productionDate?: string;
  expirationDate?: string;
  productCondition?: string;
  preparingDay?: number;
  discount?: ProductDiscountRequest;
  shipmentTemplate?: string;
  stockItems?: ProductSkuRequestList;
  unitInfo?: ProductUnitInfoModel;
  maxPurchaseQuantity?: number;
  sellerNote?: string;
}

export interface ProductBasic {
  id?: number;
  productSellerCode?: string;
  title?: string;
  price?: number;
  displayPrice?: number;
  isDomestic?: boolean;
  saleStatus?: number;
  approvalStatus?: number | null;
  stockItems?: ProductSkuList;
  oldPrice?: number;
  currencyAmount?: number;
  currencyType?: number;
  productStatusDetail?: string;
}

export interface ProductData {
  version?: number;
  producedDate?: string;
  expireDate?: string;
  saleEndDate?: string;
  saleStartDate?: string;
  description?: string;
  price?: number;
  maxPurchaseQuantity?: number;
}

export interface ImageList {
  image?: string;
}

export interface ProductQuestion {
  id?: number;
  productId?: number;
  productTitle?: string;
  questionSubject?: string;
  question?: string;
  answer?: string;
  images?: ImageList;
}

export interface ProductQuestionList {
  productQuestion?: ProductQuestion[];
}

export interface ProductQuestionDetail {
  productId?: number;
  productTitle?: string;
  questionSubject?: string;
  question?: string;
  answer?: string;
  fullName?: string;
  email?: string;
  productStatus?: string;
  status?: string;
  questionDate?: string;
  answeredDate?: string;
  sellerExpose?: string;
  buyerExpose?: string;
  images?: ImageList;
}

export interface Category {
  id?: number;
  name?: string;
  fullName?: string;
}

export interface CategoryRequest {
  id?: number;
}

export interface SpecialProductInfoApiModel {
  key?: string;
  value?: string;
}

export interface ProductImage {
  url?: string;
  order?: number;
}

export interface ProductImageList {
  image?: ProductImage[];
}

export interface ProductSku {}

export interface ProductSkuBasic {}

export interface ProductSkuBasicRequest {
  sellerStockCode?: string;
  optionPrice?: number;
}

export interface ProductUpdateSkuBasicRequest {
  sellerStockCode?: string;
  id?: number;
  optionPrice?: number | null;
  quantity?: number | null;
}

export interface ProductSkuBasicItemList {
  stockItem?: ProductSkuBasic[];
}

export interface ProductSkuBasicRequestItemList {
  stockItem?: ProductSkuBasicRequest[];
}

export interface ProductUpdateSkuBasicRequestItemList {
  stockItem?: ProductUpdateSkuBasicRequest[];
}

export interface ProductSkuItemList {
  stockItem?: ProductSku[];
}

export interface ProductSkuRequest {
  bundle?: boolean | null;
  mpn?: string | null;
  gtin?: string | null;
  n11CatalogId?: number;
  oem?: string | null;
  quantity?: number;
  sellerStockCode?: string;
  attributes?: ProductAttributeRequestList;
  optionPrice?: number;
  images?: ProductImageList;
}

export interface StockItem {
  id?: number;
}

export interface StockItemForAddStockWithId {
  id?: number;
  quantityToIncrease?: number;
  version?: number;
}

export interface StockItemForUpdateStockWithId {
  id?: number;
  quantity?: number;
  version?: number;
  delist?: boolean | null;
}

export interface StockItemForAddStockWithIdList {
  stockItem?: StockItemForAddStockWithId[];
}

export interface StockItemForUpdateStockWithIdList {
  stockItem?: StockItemForUpdateStockWithId[];
}

export interface StockItemForAddStockWithSellerStockCode {
  sellerStockCode?: string;
  quantityToIncrease?: number;
  version?: number;
}

export interface StockItemForUpdateStockWithSellerStockCode {
  sellerStockCode?: string;
  quantity?: number;
  version?: number;
}

export interface StockItemForAddStockWithSellerStockCodeList {
  stockItem?: StockItemForAddStockWithSellerStockCode[];
}

export interface StockItemForUpdateStockWithSellerStockCodeList {
  stockItem?: StockItemForUpdateStockWithSellerStockCode[];
}

export interface StockItemForAddStockWithAttributes {
  attributes?: StockAttributeList;
  quantityToIncrease?: number;
  version?: number;
}

export interface StockItemForUpdateStockWithAttributes {
  attributes?: StockAttributeList;
  quantity?: number;
  version?: number;
}

export interface StockItemForAddStockWithAttributesList {
  stockItem?: StockItemForAddStockWithAttributes[];
}

export interface StockItemForUpdateStockWithAttributesList {
  stockItem?: StockItemForUpdateStockWithAttributes[];
}

export interface StockAttribute {
  name?: string;
  value?: string;
}

export interface StockAttributeList {
  attribute?: StockAttribute[];
}

export interface StockItemList {
  stockItem?: StockItem[];
}

export interface StockDataWithProductId {
  stockItems?: StockItemList[];
  product?: ProductWithId;
}

export interface ProductWithId {
  id?: number;
}

export interface StockDataWithProductSellerCode {
  stockItems?: StockItemList[];
  product?: ProductWithSellerCode;
}

export interface ProductWithIdAndStockId {
  id?: number;
  stockList?: StockItemForAddStockWithIdList;
}

export interface ProductWithIdAndStockSellerCode {
  id?: number;
  stockList?: StockItemForAddStockWithSellerStockCodeList;
}

export interface ProductWithIdAndStockAttributes {
  id?: number;
  stockItems?: StockItemForAddStockWithAttributesList;
}

export interface ProductWithIdAndStockAttributesForUpdate {
  id?: number;
  stockItems?: StockItemForUpdateStockWithAttributesList;
}

export interface ProductWithSellerCode {
  sellerCode?: string;
}

export interface ProductAttribute {
  id?: number;
  name?: string;
  value?: string;
}

export interface ProductAttributeRequest {
  name?: string;
  value?: string;
}

export interface ProductAttributeRequestList {
  attribute?: ProductAttributeRequest[];
}

export interface ProductAttributeList {
  attribute?: ProductAttribute[];
}

export interface ProductDiscount {
  startDate?: string;
  endDate?: string;
  type?: string;
  value?: string;
  maxPurchaseCount?: string;
}

export interface ProductDiscountRequest {
  startDate?: string;
  endDate?: string;
  type?: string;
  value?: string;
}

export interface ProductSearch {
  name?: string;
  saleDate?: DateRange;
  approvalStatus?: ProductStatus;
  bundle?: boolean | null;
  mpn?: string | null;
  gtin?: string | null;
  oem?: string | null;
}

export interface ProductQuestionSearch {
  productId?: number;
  buyerEmail?: string;
  subject?: string;
  status?: ProductQuestionStatus;
  questionDate?: string;
  startDate?: string;
  endDate?: string;
}

export interface DateRange {
  startDate?: string;
  endDate?: string;
}

export interface ProductSkuList {
  id?: number;
  stockItem?: ProductSku[];
  productSellerCode?: string;
}

export interface ProductSkuRequestList {
  stockItem?: ProductSkuRequest[];
}

export interface SellerProductDiscount {
  discountType?: number;
  discountValue?: number;
  discountStartDate?: string;
  discountEndDate?: string;
}

/** The `ProductApprovalStatusResponse` complex type, distinct from the element of the same name. */
export interface ProductApprovalStatusResponseType {
  result?: ProductApprovalStatusApi[];
}

export interface ProductApprovalStatusApi {
  approvedCount?: number;
  unapprovedCount?: number;
  waitingApprovalCount?: number;
  waitingCount?: number;
  rejectedCount?: number;
  totalCount?: number;
}

export interface ProductIdList {
  productId?: number[];
}

export interface ProductUnitInfoModel {
  unitType?: number;
  unitWeight?: number;
}

/** `GetProductList` request body. */
export type GetProductListRequest = {
  pagingData: RequestPagingData;
};

/** `GetProductList` response body. */
export interface GetProductListResponse {
  result?: ResultInfo;
  products?: ProductBasicList;
  pagingData?: PagingData;
}

/** `UpdateProductPriceBySellerCode` request body. */
export type UpdateProductPriceBySellerCodeRequest = {
  productSellerCode?: string;
  price?: number;
  currencyType?: number;
  stockItems?: ProductSkuBasicRequestItemList;
};

/** `UpdateProductPriceBySellerCode` response body. */
export interface UpdateProductPriceBySellerCodeResponse {
  result?: ResultInfo;
  product?: ProductBasic;
}

/** `GetProductBySellerCode` request body. */
export type GetProductBySellerCodeRequest = {
  sellerCode: string;
};

/** `GetProductBySellerCode` response body. */
export interface GetProductBySellerCodeResponse {
  result?: ResultInfo;
  product?: Product;
}

/** `DeleteProductById` request body. */
export type DeleteProductByIdRequest = {
  productId: number;
};

/** `DeleteProductById` response body. */
export interface DeleteProductByIdResponse {
  result?: ResultInfo;
  product?: ProductBasic;
}

/** `UpdateDiscountValueBySellerCode` request body. */
export type UpdateDiscountValueBySellerCodeRequest = {
  productSellerCode?: string;
  productDiscount?: SellerProductDiscount;
};

/** `UpdateDiscountValueBySellerCode` response body. */
export interface UpdateDiscountValueBySellerCodeResponse {
  result?: ResultInfo;
  product?: ProductBasic;
}

/** `GetProductQuestionList` request body. */
export type GetProductQuestionListRequest = {
  productQuestionSearch?: ProductQuestionSearch;
  pagingData?: RequestPagingData;
};

/** `GetProductQuestionList` response body. */
export interface GetProductQuestionListResponse {
  productQuestions?: ProductQuestionList;
  pagingData?: PagingData;
}

/** `UpdateProductBasic` request body. */
export type UpdateProductBasicRequest = {
  productId?: number;
  productSellerCode?: string;
  price?: number | null;
  productDiscount?: SellerProductDiscount;
  stockItems?: ProductUpdateSkuBasicRequestItemList;
  description?: string;
};

/** `UpdateProductBasic` response body. */
export interface UpdateProductBasicResponse {
  result?: ResultInfo;
  product?: ProductBasic;
}

/** `GetProductQuestionDetail` request body. */
export type GetProductQuestionDetailRequest = {
  productQuestionId: number;
};

/** `GetProductQuestionDetail` response body. */
export interface GetProductQuestionDetailResponse {
  productQuestion?: ProductQuestionDetail;
}

/** `SaveProductAnswer` request body. */
export type SaveProductAnswerRequest = {
  productQuestionId?: number;
  answer?: string;
};

/** `SaveProductAnswer` response body. */
export interface SaveProductAnswerResponse {
  result?: ResultInfo;
}

/** `UpdateDiscountValueByProductId` request body. */
export type UpdateDiscountValueByProductIdRequest = {
  productId?: number;
  productDiscount?: SellerProductDiscount;
};

/** `UpdateDiscountValueByProductId` response body. */
export interface UpdateDiscountValueByProductIdResponse {
  result?: ResultInfo;
  product?: ProductBasic;
}

/** `SaveProduct` request body. */
export type SaveProductRequest = {
  product: ProductRequest;
};

/** `SaveProduct` response body. */
export interface SaveProductResponse {
  result?: ResultInfo;
  product?: ProductBasic;
}

/** `DeleteProductBySellerCode` request body. */
export type DeleteProductBySellerCodeRequest = {
  productSellerCode: string;
};

/** `DeleteProductBySellerCode` response body. */
export interface DeleteProductBySellerCodeResponse {
  result?: ResultInfo;
  product?: ProductBasic;
}

/** `GetProductByProductId` request body. */
export type GetProductByProductIdRequest = {
  productId: number;
};

/** `GetProductByProductId` response body. */
export interface GetProductByProductIdResponse {
  result?: ResultInfo;
  product?: Product;
}

/** `SearchProducts` request body. */
export type SearchProductsRequest = {
  pagingData?: RequestPagingData;
  productSearch?: ProductSearch;
};

/** `SearchProducts` response body. */
export interface SearchProductsResponse {
  result?: ResultInfo;
  products?: ProductBasicList;
  pagingData?: PagingData;
}

/** `AdaptUnificationProducts` request body. */
export type AdaptUnificationProductsRequest = {};

/** `AdaptUnificationProducts` response body. */
export interface AdaptUnificationProductsResponse {
  result?: ResultInfo;
}

/** `UpdateProductPriceById` request body. */
export type UpdateProductPriceByIdRequest = {
  productId?: number;
  price?: number;
  currencyType?: number;
  stockItems?: ProductSkuBasicRequestItemList;
};

/** `UpdateProductPriceById` response body. */
export interface UpdateProductPriceByIdResponse {
  result?: ResultInfo;
  product?: ProductBasic;
}

/** `ProductApprovalStatus` request body. */
export type ProductApprovalStatusRequest = {};

/** `ProductApprovalStatus` response body. */
export interface ProductApprovalStatusResponse {
  result?: ProductApprovalStatusApi;
}

/** `ProductPriceAddOptionPrice` request body. */
export type ProductPriceAddOptionPriceRequest = {
  categoryId?: number;
  productId?: number;
};

/** `ProductPriceAddOptionPrice` response body. */
export interface ProductPriceAddOptionPriceResponse {
  result?: ResultInfo;
}

