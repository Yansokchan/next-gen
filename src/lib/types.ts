export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
  purchaseCount?: number; // Added for UI display
};

export type Employee = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  position: string;
  department: string;
  salary: number;
  hireDate: Date;
  status: "active" | "inactive"; // Add status field
  salesCount?: number; // Added for UI display
  salesAmount?: number; // Added for UI display
};

export const PRODUCT_CATEGORIES = [
  "iPhone",
  "Charger",
  "Cable",
  "AirPod",
] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const IPHONE_COLORS = [
  "Black",
  "White",
  "Gold",
  "Silver",
  "Blue",
  "Purple",
  "Red",
  "Green",
  "Yellow",
  "Pink",
] as const;
export type iPhoneColor = (typeof IPHONE_COLORS)[number];

export const IPHONE_STORAGE = [
  "64GB",
  "128GB",
  "256GB",
  "512GB",
  "1TB",
  "2TB",
] as const;
export type iPhoneStorage = (typeof IPHONE_STORAGE)[number];

export const CHARGER_WATTAGE = [
  "5W",
  "10W",
  "12W",
  "18W",
  "20W",
  "30W",
  "45W",
  "60W",
  "96W",
  "140W",
] as const;
export type ChargerWattage = (typeof CHARGER_WATTAGE)[number];

export const CABLE_TYPES = [
  "USB-C to Lightning",
  "USB-C to USB-C",
  "USB-A to Lightning",
] as const;
export type CableType = (typeof CABLE_TYPES)[number];

export const CABLE_LENGTHS = ["1m", "2m"] as const;
export type CableLength = (typeof CABLE_LENGTHS)[number];

export type BaseProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  stock: number;
  status: "available" | "unavailable";
  createdAt: Date;
};

export type iPhoneProduct = BaseProduct & {
  category: "iPhone";
  color: iPhoneColor;
  storage: iPhoneStorage;
};

export type ChargerProduct = BaseProduct & {
  category: "Charger";
  wattage: ChargerWattage;
  isFastCharging: boolean;
};

export type CableProduct = BaseProduct & {
  category: "Cable";
  type: CableType;
  length: CableLength; // Updated to use CableLength type
};

export type AirPodProduct = BaseProduct & {
  category: "AirPod";
};

export type Product =
  | iPhoneProduct
  | ChargerProduct
  | CableProduct
  | AirPodProduct;

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  details?: string;
  stockAfterOrder?: number;
};

export type Order = {
  id: string;
  customerId: string;
  customerName: string;
  employeeId: string;
  employeeName: string;
  items: Array<OrderItem>;
  total: number;
  createdAt: Date;
};
