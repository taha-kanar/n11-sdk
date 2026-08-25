/* eslint-disable */
/**
 * ShipmentService — the schema as runtime data.
 *
 * The codec walks these descriptors so a one-element list is still an array and a seller
 * code like `"0123"` survives as a string. Nothing here is guessed from the payload.
 *
 * GENERATED FILE — do not edit by hand. Run `npm run generate`.
 */
import type { ServiceShapes } from '../soap/shape.js';

export const shipmentServiceShapes: ServiceShapes = {
  service: "ShipmentService",
  endpoint: "https://api.n11.com/ws/shipmentService/",
  enums: new Set([]),
  types: {
  ShipmentApiModel: [{ n:"templateName", t:"string" }, { n:"installmentInfo", t:"string" }, { n:"exchangeInfo", t:"string" }, { n:"shippingInfo", t:"string" }, { n:"specialDelivery", t:"boolean" }, { n:"deliveryFeeType", t:"string" }, { n:"combinedShipmentAllowed", t:"boolean" }, { n:"shipmentMethod", t:"string" }, { n:"warehouseAddress", t:"ShipmentSaveAddress", c:1 }, { n:"exchangeAddress", t:"ShipmentSaveAddress", c:1 }, { n:"shipmentCompanies", t:"ShipmentCompanyApiModelList", c:1 }, { n:"deliverableCities", t:"CityApiModelList", c:1, x:1 }, { n:"claimShipmentCompany", t:"ShipmentCompanyApiModel", c:1 }, { n:"cargoAccountNo", t:"string", x:1 }, { n:"useDmallCargo", t:"boolean" }, { n:"defaultTemplate", t:"boolean", x:1 }],
  Address: [{ n:"title", t:"string" }, { n:"address", t:"string" }, { n:"district", t:"DistrictApiModel", c:1 }, { n:"city", t:"CityApiModel", c:1 }, { n:"postalCode", t:"string" }, { n:"feeCondition", t:"string" }, { n:"feeConditionUnit", t:"number" }, { n:"feeConditionPrice", t:"number" }],
  ShipmentSaveAddress: [{ n:"title", t:"string" }, { n:"address", t:"string" }, { n:"district", t:"DistrictApiModel", c:1 }, { n:"city", t:"CityApiModel", c:1 }, { n:"postalCode", t:"string" }, { n:"feeCondition", t:"number" }, { n:"feeConditionPrice", t:"number" }],
  DistrictApiModel: [{ n:"name", t:"string" }, { n:"id", t:"number" }],
  CityApiModel: [{ n:"name", t:"string" }, { n:"code", t:"number" }],
  ShipmentCompanyApiModel: [{ n:"name", t:"string" }, { n:"shortName", t:"string" }],
  ShipmentCompanyApiModelList: [{ n:"shipmentCompany", t:"ShipmentCompanyApiModel", c:1, l:1 }],
  CityApiModelList: [{ n:"city", t:"CityApiModel", c:1, l:1 }],
  ShipmentTemplateList: [{ n:"shipmentTemplate", t:"ShipmentApiModel", c:1, l:1 }],
  BaseRequest: [{ n:"authentication", t:"Authentication", c:1 }],
  Authentication: [{ n:"appKey", t:"string" }, { n:"appSecret", t:"string" }],
  BaseResponse: [{ n:"status", t:"string", x:1 }, { n:"errorCode", t:"string", x:1 }, { n:"errorMessage", t:"string", x:1 }, { n:"errorCategory", t:"string", x:1 }],
  ResultInfo: [{ n:"status", t:"string", x:1 }, { n:"errorCode", t:"string", x:1 }, { n:"errorMessage", t:"string", x:1 }, { n:"errorCategory", t:"string", x:1 }],
  PagingData: [{ n:"currentPage", t:"number", x:1 }, { n:"pageSize", t:"number", x:1 }, { n:"totalCount", t:"number", x:1 }, { n:"pageCount", t:"number", x:1 }],
  RequestPagingData: [{ n:"currentPage", t:"number", x:1 }, { n:"pageSize", t:"number", x:1 }],
  },
  operations: {
  GetShipmentTemplateList: { request: [{ n:"auth", t:"Authentication", c:1 }, { n:"pagingData", t:"RequestPagingData", c:1, x:1 }], response: [{ n:"result", t:"ResultInfo", c:1 }, { n:"shipmentTemplates", t:"ShipmentTemplateList", c:1 }] },
  GetShipmentTemplate: { request: [{ n:"auth", t:"Authentication", c:1 }, { n:"name", t:"string" }], response: [{ n:"result", t:"ResultInfo", c:1 }, { n:"shipmentTemplate", t:"ShipmentApiModel", c:1 }] },
  CreateOrUpdateShipmentTemplate: { request: [{ n:"auth", t:"Authentication", c:1 }, { n:"shipment", t:"ShipmentApiModel", c:1 }], response: [{ n:"result", t:"ResultInfo", c:1 }, { n:"shipmentTemplate", t:"ShipmentApiModel", c:1 }] },
  },
};
