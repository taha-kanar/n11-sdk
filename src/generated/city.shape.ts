/* eslint-disable */
/**
 * CityService — the schema as runtime data.
 *
 * The codec walks these descriptors so a one-element list is still an array and a seller
 * code like `"0123"` survives as a string. Nothing here is guessed from the payload.
 *
 * GENERATED FILE — do not edit by hand. Run `npm run generate`.
 */
import type { ServiceShapes } from '../soap/shape.js';

export const cityServiceShapes: ServiceShapes = {
  service: "CityService",
  endpoint: "https://api.n11.com/ws/cityService/",
  enums: new Set([]),
  types: {
  CityData: [{ n:"cityCode", t:"string" }, { n:"cityId", t:"number" }, { n:"cityName", t:"string" }],
  CityList: [{ n:"city", t:"CityData", c:1, l:1 }],
  CreateCityData: [{ n:"cityId", t:"number" }],
  DistrictData: [{ n:"name", t:"string" }, { n:"id", t:"number" }],
  DistrictList: [{ n:"district", t:"DistrictData", c:1, l:1 }],
  CreateDistrictData: [{ n:"id", t:"number" }],
  NeighborhoodData: [{ n:"name", t:"string" }, { n:"id", t:"number" }],
  NeighborhoodListData: [{ n:"neighborhood", t:"NeighborhoodData", c:1, l:1 }],
  BaseResponse: [{ n:"status", t:"string", x:1 }, { n:"errorCode", t:"string", x:1 }, { n:"errorMessage", t:"string", x:1 }, { n:"errorCategory", t:"string", x:1 }],
  ResultInfo: [{ n:"status", t:"string", x:1 }, { n:"errorCode", t:"string", x:1 }, { n:"errorMessage", t:"string", x:1 }, { n:"errorCategory", t:"string", x:1 }],
  BaseRequest: [{ n:"authentication", t:"Authentication", c:1 }],
  Authentication: [{ n:"appKey", t:"string" }, { n:"appSecret", t:"string" }],
  },
  operations: {
  GetCities: { request: [{ n:"auth", t:"Authentication", c:1 }], response: [{ n:"result", t:"ResultInfo", c:1 }, { n:"cities", t:"CityList", c:1 }] },
  GetCity: { request: [{ n:"cityCode", t:"number" }, { n:"auth", t:"Authentication", c:1 }], response: [{ n:"result", t:"ResultInfo", c:1 }, { n:"city", t:"CityData", c:1 }] },
  GetNeighborhoods: { request: [{ n:"districtId", t:"number" }, { n:"auth", t:"Authentication", c:1 }], response: [{ n:"result", t:"ResultInfo", c:1 }, { n:"neighborhoods", t:"NeighborhoodListData", c:1 }] },
  GetDistrict: { request: [{ n:"cityCode", t:"number" }, { n:"auth", t:"Authentication", c:1 }], response: [{ n:"result", t:"ResultInfo", c:1 }, { n:"districts", t:"DistrictList", c:1 }] },
  },
};
