import { api } from "@/api/axios";

// ─── Customer Address Types ───────────────────────────────────────────────────
export interface CustomerAddressRequest {
  name: string;
  phone: string;
  address: {
    buildingName: string;
    streetName: string;
    landmark: string;
    district: string;
    city: string;
    pin: string;
    stateName: string;
    latitude: string;
    longitude: string;
    type: "HOME" | "OFFICE" | "OTHER";
  };
}

export interface CustomerAddress {
  id: number;
  created: string;
  updated: string;
  name: string;
  phone: string;
  address: {
    buildingName: string;
    streetName: string;
    landmark: string;
    district: string;
    city: string;
    pin: string;
    stateName: string;
    latitude: string;
    longitude: string;
    type: "HOME" | "OFFICE" | "OTHER";
  };
  active: boolean;
}

// ─── Address Service ──────────────────────────────────────────────────────────
export const addressService = {
  // CREATE: Add new address
  createAddress: async (
    req: CustomerAddressRequest,
  ): Promise<CustomerAddress> => {
    const response = await api.post("/v1/api/customer-addresses", req);
    return response.data;
  },

  // READ: Get all addresses
  getAllAddresses: async (): Promise<CustomerAddress[]> => {
    const response = await api.get("/v1/api/customer-addresses");
    return response.data;
  },

  // READ: Get single address by ID
  getAddressById: async (id: number): Promise<CustomerAddress> => {
    const response = await api.get(`/v1/api/customer-addresses/${id}`);
    return response.data;
  },

  // UPDATE: Update address by ID
  updateAddress: async (
    id: number,
    req: CustomerAddressRequest,
  ): Promise<CustomerAddress> => {
    const response = await api.put(`/v1/api/customer-addresses/${id}`, req);
    return response.data;
  },

  // DELETE: Delete address by ID
  deleteAddress: async (id: number): Promise<void> => {
    await api.delete(`/v1/api/customer-addresses/${id}`);
  },
};
