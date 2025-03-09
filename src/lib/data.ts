// Keep the mock data for fallback, but we'll primarily use Supabase
import {
  Customer,
  Employee,
  Product,
  Order,
  PRODUCT_CATEGORIES,
  IPHONE_COLORS,
  IPHONE_STORAGE,
  CHARGER_WATTAGE,
  CABLE_TYPES,
  iPhoneProduct,
  ChargerProduct,
  CableProduct,
  AirPodProduct,
} from "./types";
import {
  fetchCustomers,
  fetchEmployees,
  fetchCustomerById,
  fetchEmployeeById,
  getCustomerPurchaseCount,
  getEmployeeSalesMetrics,
  isValidUUID,
} from "./supabase";
import { v4 as uuidv4 } from "uuid";

const generateId = () => uuidv4();
const randomDate = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const randomElement = <T>(array: readonly T[]): T =>
  array[Math.floor(Math.random() * array.length)];

// Keeping the mock data for reference and fallback
export const customers: Customer[] = Array.from({ length: 50 }, (_, i) => ({
  id: generateId(),
  name: `Customer ${i + 1}`,
  email: `customer${i + 1}@example.com`,
  phone: `+1 ${Math.floor(100 + Math.random() * 900)}-${Math.floor(
    100 + Math.random() * 900
  )}-${Math.floor(1000 + Math.random() * 9000)}`,
  address: `${Math.floor(100 + Math.random() * 9000)} Main St, City ${i + 1}`,
  createdAt: randomDate(new Date(2020, 0, 1), new Date()),
}));

export const employees: Employee[] = Array.from({ length: 25 }, (_, i) => {
  const departments = ["Engineering", "Marketing", "Sales", "Support", "HR"];
  const positions = ["Manager", "Senior", "Junior", "Intern", "Lead"];

  return {
    id: generateId(),
    name: `Employee ${i + 1}`,
    email: `employee${i + 1}@company.com`,
    phone: `+1 ${Math.floor(100 + Math.random() * 900)}-${Math.floor(
      100 + Math.random() * 900
    )}-${Math.floor(1000 + Math.random() * 9000)}`,
    address: `${Math.floor(100 + Math.random() * 9000)} Employee Ave, Suite ${
      i + 1
    }`,
    position: `${positions[Math.floor(Math.random() * positions.length)]}`,
    department: `${
      departments[Math.floor(Math.random() * departments.length)]
    }`,
    salary: Math.floor(40000 + Math.random() * 60000),
    hireDate: randomDate(new Date(2018, 0, 1), new Date()),
  };
});

// Generate a random product based on category
const generateProduct = (i: number): Product => {
  const category = randomElement(PRODUCT_CATEGORIES);
  const baseProduct = {
    id: generateId(),
    name: `Product ${i + 1}`,
    description: `This is product ${
      i + 1
    }, a high-quality item in our catalog.`,
    price: Math.floor(10 + Math.random() * 990),
    stock: Math.floor(Math.random() * 100),
    status: Math.random() > 0.1 ? "available" : "unavailable",
    createdAt: randomDate(new Date(2019, 0, 1), new Date()),
  } as const;

  switch (category) {
    case "iPhone":
      return {
        ...baseProduct,
        category: "iPhone",
        model: `iPhone ${Math.floor(12 + Math.random() * 4)} Pro`,
        color: randomElement(IPHONE_COLORS),
        storage: randomElement(IPHONE_STORAGE),
      } as iPhoneProduct;

    case "Charger":
      return {
        ...baseProduct,
        category: "Charger",
        wattage: randomElement(CHARGER_WATTAGE),
        isFastCharging: Math.random() > 0.5,
      } as ChargerProduct;

    case "Cable":
      return {
        ...baseProduct,
        category: "Cable",
        type: randomElement(CABLE_TYPES),
        length: `${Math.floor(1 + Math.random() * 3)}m`,
      } as CableProduct;

    case "AirPod":
      return {
        ...baseProduct,
        category: "AirPod",
        model: `AirPods ${Math.random() > 0.5 ? "Pro" : "Max"}`,
        isWirelessCharging: Math.random() > 0.3,
      } as AirPodProduct;

    default:
      throw new Error(`Unexpected category: ${category}`);
  }
};

export const products: Product[] = Array.from({ length: 40 }, (_, i) =>
  generateProduct(i)
);

export const orders: Order[] = Array.from({ length: 30 }, (_, i) => {
  const customer = customers[Math.floor(Math.random() * customers.length)];
  const employee = employees[Math.floor(Math.random() * employees.length)];
  const itemCount = Math.floor(1 + Math.random() * 4);
  const items = Array.from({ length: itemCount }, () => {
    const product = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.floor(1 + Math.random() * 3);

    return {
      id: generateId(),
      productId: product.id,
      productName: product.name,
      quantity,
      price: product.price,
    };
  });

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const statuses = ["pending", "processing", "completed", "cancelled"] as const;

  return {
    id: generateId(),
    customerId: customer.id,
    customerName: customer.name,
    employeeId: employee.id,
    employeeName: employee.name,
    items,
    total,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    createdAt: randomDate(new Date(2021, 0, 1), new Date()),
  };
});

// Updated functions to use Supabase - with fallback to mock data
export const getCustomerById = async (
  id: string
): Promise<Customer | undefined> => {
  try {
    if (!id) return undefined;

    // Validate UUID format before proceeding
    if (!isValidUUID(id)) {
      console.error("Invalid UUID format for customer ID:", id);
      return undefined;
    }

    const customer = await fetchCustomerById(id);
    if (customer) {
      // Fetch additional metrics
      const purchaseCount = await getCustomerPurchaseCount(id);
      return {
        ...customer,
        purchaseCount,
      };
    }
  } catch (error) {
    console.error("Error fetching customer from Supabase:", error);
  }

  // Fallback to mock data only if ID is a valid UUID
  return customers.find((customer) => customer.id === id);
};

export const getEmployeeById = async (
  id: string
): Promise<Employee | undefined> => {
  try {
    if (!id) return undefined;

    const employee = await fetchEmployeeById(id);
    if (employee) {
      // Fetch additional metrics
      const { count, amount } = await getEmployeeSalesMetrics(id);
      return {
        ...employee,
        salesCount: count,
        salesAmount: amount,
      };
    }
  } catch (error) {
    console.error("Error fetching employee from Supabase:", error);
  }

  // Fallback to mock data
  return employees.find((employee) => employee.id === id);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find((product) => product.id === id);
};

export const getOrderById = (id: string): Order | undefined => {
  return orders.find((order) => order.id === id);
};
