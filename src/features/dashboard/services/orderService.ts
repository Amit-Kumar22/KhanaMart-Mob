import { api } from "@/api/axios";

// ─── Coupon ───────────────────────────────────────────────────────────────────
export interface CouponResponse {
  id: number;
  name: string;
  code: string;
  value: number;
  startDate: string;
  endDate: string;
  couponValueType: "PERCENTAGE" | "VALUE";
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
  status: "AVAILABLE" | "NOT_AVAILABLE" | string;
  message: string;
  paymentRes: {
    razorpayKey: string;
    razorpayOrderResponse: RazorpayOrderResponse;
  } | null;
}

// ─── Payment Verification ─────────────────────────────────────────────────────
export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  status: "AVAILABLE" | "NOT_AVAILABLE" | string;
  message: string;
  orderNumber: string;
}

// ─── Save Payment ─────────────────────────────────────────────────────────────
export interface SavePaymentRequest {
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentStatus: "SUCCESS" | "FAILURE";
  errorDescription?: string;
}

export interface SavePaymentResponse {
  success: boolean;
  message: string;
}

export const orderService = {
  getCoupon: async (couponCode: string): Promise<CouponResponse> => {
    const response = await api.get(`/v1/coupon/active/${couponCode}`);
    return response.data;
  },

  makeOrder: async (req: MakeOrderRequest): Promise<MakeOrderResponse> => {
    const response = await api.post("/v1/order/make-order", req);
    return response.data;
  },

  verifyPayment: async (
    req: VerifyPaymentRequest,
  ): Promise<VerifyPaymentResponse> => {
    const response = await api.post("/v1/order/payment-verification", req);
    return response.data;
  },

  savePayment: async (
    orderNumber: string,
    req: SavePaymentRequest,
  ): Promise<SavePaymentResponse> => {
    const response = await api.post(
      `/v1/payment/${orderNumber}/save-payment`,
      req,
    );
    return response.data;
  },
};
