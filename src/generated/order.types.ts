/* eslint-disable */
/**
 * OrderService — request and response types.
 *
 * Fields are optional unless an operation takes exactly one argument. The XSD marks almost
 * everything required, search filters included, so its requiredness describes JAXB's default
 * rather than what n11 accepts — encoding it here would only force callers to pass
 * placeholders.
 *
 * GENERATED FILE — do not edit by hand.
 * Source: wsdl/OrderService.wsdl · regenerate with `npm run generate`.
 */

import type { PagingData, RequestPagingData, ResultInfo, ShipmentCompanyData } from './common.types.js';

export interface OrderDetailData {
  id?: number;
  orderNumber?: string;
  rwbOrder?: boolean | null;
  buyer?: BuyerWithTaxFields;
  citizenshipId?: string;
  invoiceType?: string;
  itemList?: OrderItemDataList;
  serviceItemList?: ServiceOrderItemDataList;
  status?: number;
  paymentType?: number;
  billingTemplate?: BillingTemplate;
  shippingAddress?: AddressModel;
  billingAddress?: AddressModel;
  createDate?: string;
  orderItemShipmentList?: OrderItemShipmentDataList;
}

export interface OrderItemShipmentDataList {
  orderItemShipmentInfo?: OrderItemShipmentInfoList[];
}

export interface OrderItemShipmentInfoList {
  shippingAddress?: AddressModel;
  deliveryPointMessage?: string;
  orderItemIds?: OrderItemIdList;
}

export interface OrderItemIdList {
  id?: number;
}

export interface ServiceOrderItemDataList {
  serviceItem?: ServiceOrderItemData[];
}

export interface ServiceOrderItemData {
  orderItemType?: number;
  installmentChargeWithVAT?: number;
  price?: number;
  totalDiscountPrice?: number;
  quantity?: number;
  sellerInvoiceAmount?: number;
  orderItemList?: ProductOrderItemList;
}

export interface ProductOrderItemList {
  orderItem?: number[];
}

export interface BillingTemplate {
  originalPrice?: number;
  totalSellerDiscount?: number;
  totalServiceItemOriginalPrice?: number;
  installmentChargeWithVat?: number;
  sellerInvoiceAmount?: number;
  totalMallDiscountPrice?: number;
  dueAmount?: number;
}

export interface OrderItemDataList {
  item?: OrderSearchData[];
}

export interface OrderData {
  id?: number;
  createDate?: string;
  totalDiscountAmount?: number;
  paymentType?: number | null;
  orderNumber?: string;
  totalAmount?: number;
  status?: number | null;
  citizenshipId?: string;
}

export interface OrderItemDataRequest {
  id?: number;
}

export interface OrderItemDataListRequest {
  orderItem?: OrderItemDataRequest[];
}

export interface OrderDataRequest {
  id?: number;
}

export interface OrderItemDataRequestForRejection {
  orderItem?: OrderItemDataRequest[];
}

export interface OrderDataList {
  order?: OrderData[];
}

export interface OrderDataListRequest {
  productId?: number | null;
  status?: string | null;
  buyerName?: string;
  orderNumber?: string;
  productSellerCode?: string | null;
  recipient?: string;
  sameDayDelivery?: boolean | null;
  period?: OrderSearchPeriod;
  sortForUpdateDate?: boolean;
  updateDateSortOrder?: string | null;
}

export interface OrderSearchPeriod {
  startDate?: string | null;
  endDate?: string | null;
}

export interface OrderItemData {
  id?: number;
  stockKeepingUnitId?: number;
  productSellerCode?: string;
  price?: number;
  sellerDiscount?: number;
  mallDiscount?: number;
  commission?: number;
  status?: number;
  quantity?: number;
  productName?: string;
  deliveryFeeType?: number;
  dueAmount?: number;
  shipmentInfo?: OrderItemShipmentInfo;
  attributes?: SkuAttributeList;
  customTextOptionValues?: CustomTextOptionsDataList;
  bundle?: boolean;
  updatedDate?: string;
  cargoCompanyWarning?: string;
  approvedDate?: string; // observed in production; not in the WSDL
  installmentChargeWithVAT?: number; // observed in production; not in the WSDL
  productId?: number; // observed in production; not in the WSDL
  sellerCouponDiscount?: number; // observed in production; not in the WSDL
  sellerInvoiceAmount?: number; // observed in production; not in the WSDL
  sellerStockCode?: string; // observed in production; not in the WSDL
  shipmenCompanyCampaignNumber?: string; // observed in production; not in the WSDL
  shippingDate?: string; // observed in production; not in the WSDL
  sppApproved?: boolean; // observed in production; not in the WSDL
  totalMallDiscountPrice?: number; // observed in production; not in the WSDL
  version?: number; // observed in production; not in the WSDL
}

export interface SkuAttributeList {
  attribute?: SkuAttribute[];
}

export interface CustomTextOptionsDataList {
  customTextOptionValue?: CustomTextOptionsData[];
}

export interface SkuAttribute {
  id?: number;
  name?: string;
  value?: string;
}

export interface CustomTextOptionsData {
  option?: string;
  text?: string;
}

export interface OrderItemListShipmentRequest {
  orderItem?: OrderItemShipmentRequest[];
}

export interface OrderItemShipmentRequest {
  id?: number;
  shipmentInfo?: MakeShipmentInfoRequest;
}

export interface ShipmentCompanyRequest {
  id?: number;
}

export interface ShipmentInfoRequest {
  shipmentCompany?: ShipmentCompanyRequest;
  campaignNumber?: string;
  shipmentCode?: number;
  shipmentMethod?: number;
}

export interface MakeShipmentInfoRequest {
  shipmentCompany?: ShipmentCompanyRequest;
  campaignNumber?: string;
  trackingNumber?: string;
  shipmentMethod?: number;
}

export interface OrderItemShipment {
  id?: number;
  price?: number;
  sellerDiscount?: number;
  mallDiscount?: number;
  commission?: number;
  status?: number;
  quantity?: number;
  productName?: string;
  shipmentInfo?: OrderItemShipmentInfo;
}

export interface OrderSearchData {
  id?: number;
  productId?: number;
  deliveryFeeType?: number;
  productSellerCode?: string;
  status?: string;
  rejectReason?: string;
  approvedDate?: string;
  dueAmount?: number;
  installmentChargeWithVAT?: number;
  price?: number;
  totalMallDiscountPrice?: number;
  quantity?: number;
  sellerCouponDiscount?: number;
  sellerStockCode?: string;
  version?: number;
  attributes?: SkuAttributeList;
  sellerDiscount?: number;
  mallDiscount?: number;
  commission?: number;
  sellerInvoiceAmount?: number;
  productName?: string;
  shipmentInfo?: OrderItemShipmentInfo;
  shippingDate?: string;
  customTextOptionValues?: CustomTextOptionsDataList;
  shipmenCompanyCampaignNumber?: string;
  bundle?: boolean; // observed in production; not in the WSDL
  sppApproved?: boolean; // observed in production; not in the WSDL
  stockKeepingUnitId?: number; // observed in production; not in the WSDL
  updatedDate?: string; // observed in production; not in the WSDL
}

export interface DetailedOrderDataList {
  order?: DetailedOrderData[];
}

export interface DetailedOrderData {
  id?: number;
  invoiceType?: string;
  status?: number;
  orderNumber?: string;
  totalAmount?: number;
  paymentType?: number;
  citizenshipId?: string;
  orderItemList?: DetailedOrderItemDataList;
  createDate?: string;
  serviceItemList?: ServiceOrderItemDataList;
  buyer?: BuyerWithTaxFields; // observed in production; not in the WSDL
  shippingAddress?: AddressModel; // observed in production; not in the WSDL
  billingAddress?: AddressModel; // observed in production; not in the WSDL
  totalDiscountAmount?: number; // observed in production; not in the WSDL
}

export interface DetailedOrderItemDataList {
  orderItem?: OrderItemData[];
}

export interface ItemWithComplementaryList {
  itemWithComplementary?: ItemWithComplementaryData;
}

export interface OrderItemShipmentInfo {
  shipmentCompany?: ShipmentCompanyData | null;
  trackingNumber?: string;
  trackingNumberStatus?: string;
  shipmentCode?: number;
  campaignNumber?: string;
  shipmentMethod?: string;
  campaignNumberStatus?: number;
}

export interface MakeOrderItemShipmentInfo {
  shipmentCompany?: ShipmentCompanyData | null;
  trackingNumber?: string;
  trackingNumberStatus?: string;
  campaignNumber?: string;
  shipmentMethod?: string;
}

export interface BuyerAddressData {
  fullName?: string;
  address?: string;
  phoneNumber?: number;
  tcNo?: string;
  companyName?: string;
  taxNo?: string;
  taxOffice?: string;
}

export interface ItemWithComplementaryData {
  sellerCode?: string;
  productTitle?: string;
  category?: string;
  price?: number;
  paidDate?: string;
  acceptedDate?: string;
  status?: number;
  certificateNo?: string[];
  compItemId?: number;
  compAcceptedDate?: string;
  buyerAddress?: BuyerAddressData;
}

export interface OrderItemIdentityDataList {
  orderItem?: OrderItemIdentityDataRequest[];
}

export interface OrderItemIdentityDataRequest {
  orderItemId?: number;
  productId?: number;
  serialDataList?: SerialDataListRequest;
}

export interface SerialDataListRequest {
  serialData?: SerialDataRequest[];
}

export interface SerialDataRequest {
  serialNumber?: string;
  imei1?: string;
  imei2?: string;
}

export interface OrderItemListRequest {
  orderItemId?: number;
}

export interface Buyer {
  id?: number;
  fullName?: string;
}

export interface BuyerWithTaxFields {
  id?: number;
  fullName?: string;
  taxId?: string | null;
  taxOffice?: string | null;
  email?: string | null;
  tcId?: string;
}

export interface AddressModel {
  address?: string;
  fullName?: string;
  city?: string;
  district?: string;
  neighborhood?: string;
  postalCode?: string;
  gsm?: string;
  tcId?: string;
  taxId?: string;
  taxHouse?: string;
}

/** `CombineItems` request body. */
export type CombineItemsRequest = {
  orderItemList: OrderItemDataListRequest;
};

/** `CombineItems` response body. */
export interface CombineItemsResponse {
  result?: ResultInfo;
}

/** `OrderDetail` request body. */
export type OrderDetailRequest = {
  orderRequest: OrderDataRequest;
};

/** `OrderDetail` response body. */
export interface OrderDetailResponse {
  result?: ResultInfo;
  orderDetail?: OrderDetailData;
}

/** `SeparateCombinedItems` request body. */
export type SeparateCombinedItemsRequest = {
  orderItemList: OrderItemDataListRequest;
};

/** `SeparateCombinedItems` response body. */
export interface SeparateCombinedItemsResponse {
  result?: ResultInfo;
}

/** `OrderList` request body. */
export type OrderListRequest = {
  searchData?: OrderDataListRequest;
  pagingData?: RequestPagingData | null;
};

/** `OrderList` response body. */
export interface OrderListResponse {
  result?: ResultInfo;
  pagingData?: PagingData;
  orderList?: OrderDataList;
}

/** `OrderItemDelivery` request body. */
export type OrderItemDeliveryRequest = {
  orderItemList?: OrderItemListRequest;
  shipmentCompanyId?: number;
  shipmentMethod?: string;
  deliveryTime?: string;
};

/** `OrderItemDelivery` response body. */
export interface OrderItemDeliveryResponse {
  result?: ResultInfo;
}

/** `OrderItemReject` request body. */
export type OrderItemRejectRequest = {
  orderItemList?: OrderItemDataRequestForRejection;
  rejectReason?: string;
  rejectReasonType?: string | null;
};

/** `OrderItemReject` response body. */
export interface OrderItemRejectResponse {
  result?: ResultInfo;
  orderItemList?: DetailedOrderItemDataList;
}

/** `DetailedOrderList` request body. */
export type DetailedOrderListRequest = {
  searchData?: OrderDataListRequest | null;
  pagingData?: PagingData | null;
};

/** `DetailedOrderList` response body. */
export interface DetailedOrderListResponse {
  result?: ResultInfo;
  orderList?: DetailedOrderDataList;
  pagingData?: PagingData;
}

/** `OrderItemAccept` request body. */
export type OrderItemAcceptRequest = {
  orderItemList?: OrderItemDataListRequest;
  numberOfPackages?: number;
};

/** `OrderItemAccept` response body. */
export interface OrderItemAcceptResponse {
  result?: ResultInfo;
  orderItemList?: DetailedOrderItemDataList;
}

/** `ComplementaryItemDetail` request body. */
export type ComplementaryItemDetailRequest = {
  orderItemList: OrderItemDataListRequest;
};

/** `ComplementaryItemDetail` response body. */
export interface ComplementaryItemDetailResponse {
  result?: ResultInfo;
  itemWithCompInfoList?: ItemWithComplementaryList;
}

/** `MakeOrderItemShipment` request body. */
export type MakeOrderItemShipmentRequest = {
  orderItemList: OrderItemListShipmentRequest;
};

/** `MakeOrderItemShipment` response body. */
export interface MakeOrderItemShipmentResponse {
  result?: ResultInfo;
  orderItemList?: DetailedOrderItemDataList;
}

/** `OrderItemIdentity` request body. */
export type OrderItemIdentityRequest = {
  orderNumber?: string;
  orderItemList?: OrderItemIdentityDataList;
};

/** `OrderItemIdentity` response body. */
export interface OrderItemIdentityResponse {
  result?: ResultInfo;
}

