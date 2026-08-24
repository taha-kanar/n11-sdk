import { BaseService } from '../core/resource/base-service.js';
import type { RequestOptions } from '../soap/transport.js';
import type {
  GetCategoryAttributeValueRequest,
  GetCategoryAttributeValueResponse,
  GetCategoryAttributesIdResponse,
  GetCategoryAttributesRequest,
  GetCategoryAttributesResponse,
  GetParentCategoryResponse,
  GetSubCategoriesRequest,
  GetSubCategoriesResponse,
  GetTopLevelCategoriesResponse,
} from '../generated/category.types.js';

/**
 * The category tree and the attributes each category demands.
 *
 * Read this before saving products: `SaveProduct` rejects any payload whose attributes do not
 * match the target category. Categories change rarely — cache them.
 *
 * @see https://api.n11.com/ws/CategoryService.wsdl
 */
export class CategoriesService extends BaseService {
  /**
   * Root categories of the tree.
   *
   * @operation GetTopLevelCategories
   */
  topLevel(options: RequestOptions = {}): Promise<GetTopLevelCategoriesResponse> {
    return this.call<GetTopLevelCategoriesResponse>('GetTopLevelCategories', {}, options);
  }

  /**
   * Children of a category, optionally only those changed since a date.
   *
   * `lastModifiedDate` is a string in n11's `dd/MM/yyyy` format, not an ISO date.
   *
   * @operation GetSubCategories
   */
  subCategories(body: GetSubCategoriesRequest, options: RequestOptions = {}): Promise<GetSubCategoriesResponse> {
    return this.call<GetSubCategoriesResponse>('GetSubCategories', body, options);
  }

  /**
   * The parent chain above a category.
   *
   * @operation GetParentCategory
   */
  parent(categoryId: number, options: RequestOptions = {}): Promise<GetParentCategoryResponse> {
    return this.call<GetParentCategoryResponse>('GetParentCategory', { categoryId }, options);
  }

  /**
   * Attributes of a category, with their allowed values, paginated.
   *
   * @operation GetCategoryAttributes
   */
  attributes(body: GetCategoryAttributesRequest, options: RequestOptions = {}): Promise<GetCategoryAttributesResponse> {
    return this.call<GetCategoryAttributesResponse>('GetCategoryAttributes', body, options);
  }

  /**
   * Attribute definitions of a category, without their values — the lighter call.
   *
   * @operation GetCategoryAttributesId
   */
  attributeIds(categoryId: number, options: RequestOptions = {}): Promise<GetCategoryAttributesIdResponse> {
    return this.call<GetCategoryAttributesIdResponse>('GetCategoryAttributesId', { categoryId }, options);
  }

  /**
   * Allowed values of a single attribute, paginated.
   *
   * @operation GetCategoryAttributeValue
   */
  attributeValues(
    body: GetCategoryAttributeValueRequest,
    options: RequestOptions = {}
  ): Promise<GetCategoryAttributeValueResponse> {
    return this.call<GetCategoryAttributeValueResponse>('GetCategoryAttributeValue', body, options);
  }
}
