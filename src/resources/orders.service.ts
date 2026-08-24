import { BaseService } from '../core/resource/base-service.js';
import type { RequestOptions } from '../soap/transport.js';
import type {
  CombineItemsRequest,
  CombineItemsResponse,
  ComplementaryItemDetailRequest,
  ComplementaryItemDetailResponse,
  DetailedOrderListRequest,
  DetailedOrderListResponse,
  MakeOrderItemShipmentRequest,
  MakeOrderItemShipmentResponse,
  OrderDetailRequest,
  OrderDetailResponse,
  OrderItemAcceptRequest,
  OrderItemAcceptResponse,
  OrderItemDeliveryRequest,
  OrderItemDeliveryResponse,
  OrderItemIdentityRequest,
  OrderItemIdentityResponse,
  OrderItemRejectRequest,
  OrderItemRejectResponse,
  OrderListRequest,
  OrderListResponse,
  SeparateCombinedItemsRequest,
  SeparateCombinedItemsResponse,
} from '../generated/order.types.js';

/**
 * Orders and the items inside them.
 *
 * n11 works at the level of *order items*, not whole orders: each item is accepted, rejected and
 * shipped on its own, and one order can be in several states at once.
 *
 * @see https://api.n11.com/ws/OrderService.wsdl
 */
export class OrdersService extends BaseService {
  /**
   * Search orders, paginated.
   *
   * Dates in `searchData` use n11's `dd/MM/yyyy` format.
   *
   * @operation OrderList
   */
  list(body: OrderListRequest, options: RequestOptions = {}): Promise<OrderListResponse> {
    return this.call<OrderListResponse>('OrderList', body, options);
  }

  /**
   * Search orders and get their items in the same response.
   *
   * Preferred over {@link list} when you need line detail: one call instead of one per order.
   * Note its `pagingData` is `PagingData`, not `RequestPagingData` — n11's own inconsistency.
   *
   * @operation DetailedOrderList
   */
  listDetailed(body: DetailedOrderListRequest, options: RequestOptions = {}): Promise<DetailedOrderListResponse> {
    return this.call<DetailedOrderListResponse>('DetailedOrderList', body, options);
  }

  /**
   * One order in full, by id or order number.
   *
   * @operation OrderDetail
   */
  detail(body: OrderDetailRequest, options: RequestOptions = {}): Promise<OrderDetailResponse> {
    return this.call<OrderDetailResponse>('OrderDetail', body, options);
  }

  /**
   * Accept items, committing to supply them.
   *
   * `numberOfPackages` declares how many parcels the items will ship in.
   *
   * @operation OrderItemAccept
   */
  acceptItems(body: OrderItemAcceptRequest, options: RequestOptions = {}): Promise<OrderItemAcceptResponse> {
    return this.call<OrderItemAcceptResponse>('OrderItemAccept', body, options);
  }

  /**
   * Reject items, cancelling them with a reason.
   *
   * @operation OrderItemReject
   */
  rejectItems(body: OrderItemRejectRequest, options: RequestOptions = {}): Promise<OrderItemRejectResponse> {
    return this.call<OrderItemRejectResponse>('OrderItemReject', body, options);
  }

  /**
   * Hand items to the carrier, with the tracking number.
   *
   * @operation MakeOrderItemShipment
   */
  ship(body: MakeOrderItemShipmentRequest, options: RequestOptions = {}): Promise<MakeOrderItemShipmentResponse> {
    return this.call<MakeOrderItemShipmentResponse>('MakeOrderItemShipment', body, options);
  }

  /**
   * Set the carrier, method and delivery window for items.
   *
   * @operation OrderItemDelivery
   */
  setDelivery(body: OrderItemDeliveryRequest, options: RequestOptions = {}): Promise<OrderItemDeliveryResponse> {
    return this.call<OrderItemDeliveryResponse>('OrderItemDelivery', body, options);
  }

  /**
   * Attach serial numbers / IMEIs to items that require identity tracking.
   *
   * @operation OrderItemIdentity
   */
  setItemIdentity(body: OrderItemIdentityRequest, options: RequestOptions = {}): Promise<OrderItemIdentityResponse> {
    return this.call<OrderItemIdentityResponse>('OrderItemIdentity', body, options);
  }

  /**
   * Merge items into a single package.
   *
   * @operation CombineItems
   */
  combineItems(body: CombineItemsRequest, options: RequestOptions = {}): Promise<CombineItemsResponse> {
    return this.call<CombineItemsResponse>('CombineItems', body, options);
  }

  /**
   * Undo a merge, splitting items back into separate packages.
   *
   * @operation SeparateCombinedItems
   */
  separateItems(
    body: SeparateCombinedItemsRequest,
    options: RequestOptions = {}
  ): Promise<SeparateCombinedItemsResponse> {
    return this.call<SeparateCombinedItemsResponse>('SeparateCombinedItems', body, options);
  }

  /**
   * Detail of complementary (gift / bundled) items on an order.
   *
   * @operation ComplementaryItemDetail
   */
  complementaryItemDetail(
    body: ComplementaryItemDetailRequest,
    options: RequestOptions = {}
  ): Promise<ComplementaryItemDetailResponse> {
    return this.call<ComplementaryItemDetailResponse>('ComplementaryItemDetail', body, options);
  }
}
