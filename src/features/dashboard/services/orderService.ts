import { api } from '@/api/axios';

// ─── Coupon ───────────────────────────────────────────────────────────────────
export interface CouponResponse {
  id: number;
  name: string;
  code: string;
  value: number;
  startDate: string;
  endDate: string;
  couponValueType: 'PERCENTAGE' | 'VALUE';
  active: boolean;
}

// ─── Order ────────────────────────────────────────────────────────────────────
export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface MakeOrderRequest {
  itemRequests: OrderItem[];
  couponCode?: string;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
}

export interface MakeOrderResponse {
  orderNumber: string;
  razorpayorderId: string | null;
  status: 'AVAILABLE' | 'NOT_AVAILABLE' | string;
  message: string;
  paymentRes: {
    razorpayKey: string;
    razorpayOrderResponse: RazorpayOrderResponse;
  } | null;
}

export const orderService = {
  getCoupon: async (couponCode: string): Promise<CouponResponse> => {
    const response = await api.get(`/v1/coupon/active/${couponCode}`);
    return response.data;
  },

  makeOrder: async (req: MakeOrderRequest): Promise<MakeOrderResponse> => {
    const response = await api.post('/v1/order/make-order', req);
    return response.data;
  },
};
