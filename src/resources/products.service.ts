import { BaseService } from '../core/resource/base-service.js';
import type { RequestOptions } from '../soap/transport.js';
import type {
  AdaptUnificationProductsResponse,
  DeleteProductByIdResponse,
  DeleteProductBySellerCodeResponse,
  GetProductByProductIdResponse,
  GetProductBySellerCodeResponse,
  GetProductListRequest,
  GetProductListResponse,
  GetProductQuestionDetailResponse,
  GetProductQuestionListRequest,
  GetProductQuestionListResponse,
  ProductApprovalStatusResponse,
  ProductPriceAddOptionPriceRequest,
  ProductPriceAddOptionPriceResponse,
  SaveProductAnswerRequest,
  SaveProductAnswerResponse,
  SaveProductRequest,
  SaveProductResponse,
  SearchProductsRequest,
  SearchProductsResponse,
  UpdateDiscountValueByProductIdRequest,
  UpdateDiscountValueByProductIdResponse,
  UpdateDiscountValueBySellerCodeRequest,
  UpdateDiscountValueBySellerCodeResponse,
  UpdateProductBasicRequest,
  UpdateProductBasicResponse,
  UpdateProductPriceByIdRequest,
  UpdateProductPriceByIdResponse,
  UpdateProductPriceBySellerCodeRequest,
  UpdateProductPriceBySellerCodeResponse,
} from '../generated/product.types.js';

/**
 * The product catalogue: listing, saving, pricing, deleting, and customer questions.
 *
 * Most operations come in two flavours — by n11's `productId`, or by your own
 * `productSellerCode`. Prefer the seller code: it is the id you already own, and it survives
 * n11 re-creating a listing.
 *
 * @see https://api.n11.com/ws/ProductService.wsdl
 */
export class ProductsService extends BaseService {
  /**
   * All products of the seller, paginated.
   *
   * @operation GetProductList
   */
  list(body: GetProductListRequest, options: RequestOptions = {}): Promise<GetProductListResponse> {
    return this.call<GetProductListResponse>('GetProductList', body, options);
  }

  /**
   * Search products by title, category, status and more.
   *
   * @operation SearchProducts
   */
  search(body: SearchProductsRequest, options: RequestOptions = {}): Promise<SearchProductsResponse> {
    return this.call<SearchProductsResponse>('SearchProducts', body, options);
  }

  /**
   * One product, by n11's id.
   *
   * @operation GetProductByProductId
   */
  getById(productId: number, options: RequestOptions = {}): Promise<GetProductByProductIdResponse> {
    return this.call<GetProductByProductIdResponse>('GetProductByProductId', { productId }, options);
  }

  /**
   * One product, by your own seller code.
   *
   * @operation GetProductBySellerCode
   */
  getBySellerCode(sellerCode: string, options: RequestOptions = {}): Promise<GetProductBySellerCodeResponse> {
    return this.call<GetProductBySellerCodeResponse>('GetProductBySellerCode', { sellerCode }, options);
  }

  /**
   * Create a product, or update it when its seller code already exists.
   *
   * The attributes must match what {@link CategoriesService.attributes} declares for the
   * category, and `shipmentTemplate` must name an existing template.
   *
   * @operation SaveProduct
   */
  save(body: SaveProductRequest, options: RequestOptions = {}): Promise<SaveProductResponse> {
    return this.call<SaveProductResponse>('SaveProduct', body, options);
  }

  /**
   * Update the common fields of a product without resending the whole listing.
   *
   * @operation UpdateProductBasic
   */
  updateBasic(body: UpdateProductBasicRequest, options: RequestOptions = {}): Promise<UpdateProductBasicResponse> {
    return this.call<UpdateProductBasicResponse>('UpdateProductBasic', body, options);
  }

  /**
   * Set price and stock, by n11's product id.
   *
   * @operation UpdateProductPriceById
   */
  updatePriceById(
    body: UpdateProductPriceByIdRequest,
    options: RequestOptions = {}
  ): Promise<UpdateProductPriceByIdResponse> {
    return this.call<UpdateProductPriceByIdResponse>('UpdateProductPriceById', body, options);
  }

  /**
   * Set price and stock, by your own seller code.
   *
   * @operation UpdateProductPriceBySellerCode
   */
  updatePriceBySellerCode(
    body: UpdateProductPriceBySellerCodeRequest,
    options: RequestOptions = {}
  ): Promise<UpdateProductPriceBySellerCodeResponse> {
    return this.call<UpdateProductPriceBySellerCodeResponse>('UpdateProductPriceBySellerCode', body, options);
  }

  /**
   * Set a discount, by n11's product id.
   *
   * @operation UpdateDiscountValueByProductId
   */
  updateDiscountById(
    body: UpdateDiscountValueByProductIdRequest,
    options: RequestOptions = {}
  ): Promise<UpdateDiscountValueByProductIdResponse> {
    return this.call<UpdateDiscountValueByProductIdResponse>('UpdateDiscountValueByProductId', body, options);
  }

  /**
   * Set a discount, by your own seller code.
   *
   * @operation UpdateDiscountValueBySellerCode
   */
  updateDiscountBySellerCode(
    body: UpdateDiscountValueBySellerCodeRequest,
    options: RequestOptions = {}
  ): Promise<UpdateDiscountValueBySellerCodeResponse> {
    return this.call<UpdateDiscountValueBySellerCodeResponse>('UpdateDiscountValueBySellerCode', body, options);
  }

  /**
   * Add option pricing for a product in a category that supports it.
   *
   * @operation ProductPriceAddOptionPrice
   */
  addOptionPrice(
    body: ProductPriceAddOptionPriceRequest,
    options: RequestOptions = {}
  ): Promise<ProductPriceAddOptionPriceResponse> {
    return this.call<ProductPriceAddOptionPriceResponse>('ProductPriceAddOptionPrice', body, options);
  }

  /**
   * Delete a product, by n11's id.
   *
   * @operation DeleteProductById
   */
  deleteById(productId: number, options: RequestOptions = {}): Promise<DeleteProductByIdResponse> {
    return this.call<DeleteProductByIdResponse>('DeleteProductById', { productId }, options);
  }

  /**
   * Delete a product, by your own seller code.
   *
   * @operation DeleteProductBySellerCode
   */
  deleteBySellerCode(
    productSellerCode: string,
    options: RequestOptions = {}
  ): Promise<DeleteProductBySellerCodeResponse> {
    return this.call<DeleteProductBySellerCodeResponse>('DeleteProductBySellerCode', { productSellerCode }, options);
  }

  /**
   * How many of the seller's products sit in each approval state.
   *
   * Note this response's `result` holds counts, not a status — the one operation in the whole
   * API where `result` does not report success or failure.
   *
   * @operation ProductApprovalStatus
   */
  approvalStatus(options: RequestOptions = {}): Promise<ProductApprovalStatusResponse> {
    return this.call<ProductApprovalStatusResponse>('ProductApprovalStatus', {}, options);
  }

  /**
   * Ask n11 to match the seller's products against its unified catalogue.
   *
   * @operation AdaptUnificationProducts
   */
  adaptUnification(options: RequestOptions = {}): Promise<AdaptUnificationProductsResponse> {
    return this.call<AdaptUnificationProductsResponse>('AdaptUnificationProducts', {}, options);
  }

  /**
   * Customer questions about the seller's products, paginated.
   *
   * @operation GetProductQuestionList
   */
  questions(
    body: GetProductQuestionListRequest,
    options: RequestOptions = {}
  ): Promise<GetProductQuestionListResponse> {
    return this.call<GetProductQuestionListResponse>('GetProductQuestionList', body, options);
  }

  /**
   * One question in full, with its history.
   *
   * @operation GetProductQuestionDetail
   */
  question(productQuestionId: number, options: RequestOptions = {}): Promise<GetProductQuestionDetailResponse> {
    return this.call<GetProductQuestionDetailResponse>('GetProductQuestionDetail', { productQuestionId }, options);
  }

  /**
   * Answer a customer's question. Answers go through moderation before they appear.
   *
   * @operation SaveProductAnswer
   */
  answerQuestion(body: SaveProductAnswerRequest, options: RequestOptions = {}): Promise<SaveProductAnswerResponse> {
    return this.call<SaveProductAnswerResponse>('SaveProductAnswer', body, options);
  }
}
