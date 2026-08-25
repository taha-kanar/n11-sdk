/* eslint-disable */
/**
 * CategoryService — the schema as runtime data.
 *
 * The codec walks these descriptors so a one-element list is still an array and a seller
 * code like `"0123"` survives as a string. Nothing here is guessed from the payload.
 *
 * GENERATED FILE — do not edit by hand. Run `npm run generate`.
 */
import type { ServiceShapes } from '../soap/shape.js';

export const categoryServiceShapes: ServiceShapes = {
  service: "CategoryService",
  endpoint: "https://api.n11.com/ws/categoryService/",
  enums: new Set([]),
  types: {
  CategoryData: [{ n:"id", t:"number" }, { n:"name", t:"string" }, { n:"parentCategory", t:"CategoryData", c:1 }, { n:"subCategoryList", t:"SubCategoryList", c:1 }, { n:"attributeList", t:"CategoryAttributeList", c:1 }, { n:"metadata", t:"PagingData", c:1 }, { n:"lastModifiedDate", t:"string" }],
  SubCategoryData: [{ n:"id", t:"number" }, { n:"name", t:"string" }, { n:"subCategoryList", t:"SubCategoryList", c:1 }, { n:"lastModifiedDate", t:"string" }],
  SubCategory: [{ n:"id", t:"number" }, { n:"name", t:"string" }, { n:"lastModifiedDate", t:"string" }],
  ParentCategoryData: [{ n:"id", t:"number" }, { n:"name", t:"string" }, { n:"parentCategory", t:"ParentCategory", c:1 }, { n:"lastModifiedDate", t:"string" }],
  ParentCategory: [{ n:"id", t:"number" }, { n:"name", t:"string" }, { n:"lastModifiedDate", t:"string" }],
  CategoryAttributeList: [{ n:"attribute", t:"CategoryAttributeData", c:1, l:1 }],
  TopCategoryList: [{ n:"category", t:"SubCategory", c:1, l:1 }],
  SubCategoryList: [{ n:"subCategory", t:"SubCategory", c:1, l:1 }],
  CategoryProductAttributeList: [{ n:"categoryProductAttribute", t:"CategoryProductAttributeData", c:1, l:1 }],
  CategoryProductAttributeData: [{ n:"id", t:"number" }, { n:"name", t:"string" }, { n:"mandatory", t:"boolean" }, { n:"multipleSelect", t:"boolean" }, { n:"variant", t:"boolean" }, { n:"slicer", t:"boolean" }, { n:"grouping", t:"boolean" }, { n:"customValue", t:"boolean" }],
  CategoryProductAttributeValueData: [{ n:"id", t:"number" }, { n:"name", t:"string" }, { n:"dependedName", t:"string", x:1 }],
  CategoryProductAttributeValueList: [{ n:"categoryProductAttributeValue", t:"CategoryProductAttributeValueData", c:1, l:1 }],
  CategoryAttributeData: [{ n:"id", t:"number" }, { n:"name", t:"string" }, { n:"mandatory", t:"boolean" }, { n:"multipleSelect", t:"boolean" }, { n:"valueList", t:"CategoryAttributeValueList", c:1 }, { n:"priority", t:"number" }, { n:"variant", t:"boolean" }, { n:"slicer", t:"boolean" }, { n:"grouping", t:"boolean" }, { n:"customValue", t:"boolean" }],
  CategoryAttributeValueList: [{ n:"value", t:"CategoryAttributeValueData", c:1, l:1 }],
  CategoryAttributeValueData: [{ n:"id", t:"number" }, { n:"name", t:"string" }, { n:"dependedName", t:"string", x:1 }],
  PagingData: [{ n:"currentPage", t:"number", x:1 }, { n:"pageSize", t:"number", x:1 }, { n:"totalCount", t:"number", x:1 }, { n:"pageCount", t:"number", x:1 }],
  RequestPagingData: [{ n:"currentPage", t:"number", x:1 }, { n:"pageSize", t:"number", x:1 }],
  BaseRequest: [{ n:"authentication", t:"Authentication", c:1 }],
  Authentication: [{ n:"appKey", t:"string" }, { n:"appSecret", t:"string" }],
  BaseResponse: [{ n:"status", t:"string", x:1 }, { n:"errorCode", t:"string", x:1 }, { n:"errorMessage", t:"string", x:1 }, { n:"errorCategory", t:"string", x:1 }],
  ResultInfo: [{ n:"status", t:"string", x:1 }, { n:"errorCode", t:"string", x:1 }, { n:"errorMessage", t:"string", x:1 }, { n:"errorCategory", t:"string", x:1 }],
  },
  operations: {
  GetCategoryAttributesId: { request: [{ n:"auth", t:"Authentication", c:1 }, { n:"categoryId", t:"number" }], response: [{ n:"result", t:"ResultInfo", c:1 }, { n:"categoryProductAttributeList", t:"CategoryProductAttributeList", c:1 }] },
  GetCategoryAttributes: { request: [{ n:"auth", t:"Authentication", c:1 }, { n:"categoryId", t:"number" }, { n:"pagingData", t:"RequestPagingData", c:1 }], response: [{ n:"result", t:"ResultInfo", c:1 }, { n:"category", t:"CategoryData", c:1 }] },
  GetCategoryAttributeValue: { request: [{ n:"auth", t:"Authentication", c:1 }, { n:"categoryProductAttributeId", t:"number" }, { n:"categoryId", t:"number" }, { n:"pagingData", t:"RequestPagingData", c:1 }], response: [{ n:"result", t:"ResultInfo", c:1 }, { n:"categoryProductAttributeValueList", t:"CategoryProductAttributeValueList", c:1 }, { n:"pagingData", t:"PagingData", c:1 }] },
  GetParentCategory: { request: [{ n:"auth", t:"Authentication", c:1 }, { n:"categoryId", t:"number" }], response: [{ n:"result", t:"ResultInfo", c:1 }, { n:"category", t:"ParentCategoryData", c:1 }] },
  GetTopLevelCategories: { request: [{ n:"auth", t:"Authentication", c:1 }], response: [{ n:"result", t:"ResultInfo", c:1 }, { n:"categoryList", t:"TopCategoryList", c:1 }] },
  GetSubCategories: { request: [{ n:"auth", t:"Authentication", c:1 }, { n:"categoryId", t:"number" }, { n:"lastModifiedDate", t:"string", x:1 }], response: [{ n:"result", t:"ResultInfo", c:1 }, { n:"category", t:"SubCategoryData", c:1, l:1 }] },
  },
};
