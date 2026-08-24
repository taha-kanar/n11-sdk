/* eslint-disable */
/**
 * ShipmentCompanyService — the schema as runtime data.
 *
 * The codec walks these descriptors so a one-element list is still an array and a seller
 * code like `"0123"` survives as a string. Nothing here is guessed from the payload.
 *
 * GENERATED FILE — do not edit by hand. Run `npm run generate`.
 */
import type { ServiceShapes } from '../soap/shape.js';

export const shipmentCompanyServiceShapes: ServiceShapes = {
  service: "ShipmentCompanyService",
  endpoint: "https://api.n11.com/ws/shipmentCompanyService/",
  enums: new Set([]),
  types: {
  ShipmentCompanyList: [{ n:"shipmentCompany", t:"ShipmentCompanyData", c:1, l:1 }],
  ShipmentCompanyData: [{ n:"id", t:"number" }, { n:"name", t:"string" }, { n:"shortName", t:"string" }],
  BaseResponse: [{ n:"status", t:"string", x:1 }, { n:"errorCode", t:"string", x:1 }, { n:"errorMessage", t:"string", x:1 }, { n:"errorCategory", t:"string", x:1 }],
  ResultInfo: [{ n:"status", t:"string", x:1 }, { n:"errorCode", t:"string", x:1 }, { n:"errorMessage", t:"string", x:1 }, { n:"errorCategory", t:"string", x:1 }],
  BaseRequest: [{ n:"authentication", t:"Authentication", c:1 }],
  Authentication: [{ n:"appKey", t:"string" }, { n:"appSecret", t:"string" }],
  },
  operations: {
  GetShipmentCompanies: { request: [{ n:"auth", t:"Authentication", c:1 }], response: [{ n:"result", t:"ResultInfo", c:1 }, { n:"shipmentCompanies", t:"ShipmentCompanyList", c:1 }] },
  },
};
