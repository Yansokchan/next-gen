import { createClient } from "@supabase/supabase-js";
import {
  Customer,
  Employee,
  Product,
  Order,
  iPhoneProduct,
  ChargerProduct,
  CableProduct,
  AirPodProduct,
} from "./types";
import { v4 as uuidv4 } from "uuid";

// Get Supabase URL and anon key from environment variables
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://khtkcvecjfjzmoormqjp.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtodGtjdmVjamZqem1vb3JtcWpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyNjk5ODUsImV4cCI6MjA1Njg0NTk4NX0.n-GfbUikJ0QkxHrgW1SyGA-vV1k8xrvq4m4SRZ4H970";

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

// Helper function to validate UUID
export const isValidUUID = (uuid: string) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Helper function to ensure UUID format
const ensureUUID = (id: string) => {
  if (isValidUUID(id)) return id;
  try {
    // Try to convert the id to a UUID format
    return uuidv4();
  } catch (error) {
    console.error("Error converting ID to UUID:", error);
    return uuidv4(); // Return a new UUID as fallback
  }
};

// Customer functions
export const fetchCustomers = async (): Promise<Customer[]> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning empty customers array");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching customers:", error);
      return [];
    }

    return data.map((customer) => ({
      ...customer,
      id: ensureUUID(customer.id),
      createdAt: customer.created_at
        ? new Date(new Date(customer.created_at).toUTCString())
        : new Date(),
    })) as Customer[];
  } catch (err) {
    console.error("Error in fetchCustomers:", err);
    return [];
  }
};

export const fetchCustomerById = async (
  id: string
): Promise<Customer | null> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning null customer");
    return null;
  }

  if (!id) {
    console.error("Customer ID is required");
    return null;
  }

  // Validate UUID format
  if (!isValidUUID(id)) {
    console.error("Invalid UUID format for customer ID:", id);
    return null;
  }

  try {
    // First check if the customer exists
    const { count, error: countError } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("id", id);

    if (countError) {
      console.error("Error checking customer existence:", countError);
      return null;
    }

    if (!count) {
      console.error("No customer found with ID:", id);
      return null;
    }

    // Then fetch the customer data
    const { data, error } = await supabase
      .from("customers")
      .select("id, name, email, phone, address, created_at")
      .eq("id", id)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching customer:", error);
      return null;
    }

    if (!data) {
      console.error("No customer data found with ID:", id);
      return null;
    }

    // Convert snake_case to camelCase
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      createdAt: data.created_at
        ? new Date(new Date(data.created_at).toUTCString())
        : new Date(),
    } as Customer;
  } catch (err) {
    console.error("Error in fetchCustomerById:", err);
    return null;
  }
};

export const createCustomer = async (
  customer: Omit<Customer, "id" | "createdAt">
): Promise<Customer | null> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning null for create customer");
    return null;
  }

  try {
    const newId = uuidv4();
    const now = new Date();
    const utcDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds()
      )
    );

    const { data, error } = await supabase
      .from("customers")
      .insert([
        {
          id: newId,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          created_at: utcDate.toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating customer:", error);
      return null;
    }

    return {
      ...data,
      id: newId,
      createdAt: data.created_at
        ? new Date(new Date(data.created_at).toUTCString())
        : utcDate,
    } as Customer;
  } catch (err) {
    console.error("Error in createCustomer:", err);
    return null;
  }
};

export const updateCustomer = async (
  id: string,
  customer: Partial<Customer>
): Promise<Customer | null> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning null for update customer");
    return null;
  }

  try {
    const uuid = ensureUUID(id);
    const { data, error } = await supabase
      .from("customers")
      .update(customer)
      .eq("id", uuid)
      .select()
      .single();

    if (error) {
      console.error("Error updating customer:", error);
      return null;
    }

    return {
      ...data,
      id: uuid,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    } as Customer;
  } catch (err) {
    console.error("Error in updateCustomer:", err);
    return null;
  }
};

export const deleteCustomer = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured) {
    console.warn(
      "Supabase not configured, returning false for delete customer"
    );
    return false;
  }

  try {
    const uuid = ensureUUID(id);
    const { error } = await supabase.from("customers").delete().eq("id", uuid);

    if (error) {
      console.error("Error deleting customer:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in deleteCustomer:", err);
    return false;
  }
};

// Employee functions
export const fetchEmployees = async (): Promise<Employee[]> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning empty employees array");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching employees:", error);
      return [];
    }

    return data.map((employee) => ({
      ...employee,
      id: ensureUUID(employee.id),
      hireDate: employee.hire_date
        ? new Date(new Date(employee.hire_date).toUTCString())
        : new Date(),
    })) as Employee[];
  } catch (err) {
    console.error("Error in fetchEmployees:", err);
    return [];
  }
};

export const fetchEmployeeById = async (
  id: string
): Promise<Employee | null> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning null employee");
    return null;
  }

  if (!id) {
    console.error("Employee ID is required");
    return null;
  }

  try {
    const uuid = ensureUUID(id);
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("id", uuid)
      .single();

    if (error) {
      console.error("Error fetching employee:", error);
      return null;
    }

    return {
      ...data,
      id: uuid,
      hireDate: data.hire_date
        ? new Date(new Date(data.hire_date).toUTCString())
        : new Date(),
    } as Employee;
  } catch (err) {
    console.error("Error in fetchEmployeeById:", err);
    return null;
  }
};

export const createEmployee = async (
  employee: Omit<Employee, "id" | "hireDate">
): Promise<Employee | null> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning null for create employee");
    return null;
  }

  try {
    const newId = uuidv4();
    const now = new Date();
    const utcDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds()
      )
    );

    const { data, error } = await supabase
      .from("employees")
      .insert([
        {
          id: newId,
          name: employee.name,
          email: employee.email,
          phone: employee.phone,
          address: employee.address,
          position: employee.position,
          department: employee.department,
          salary: employee.salary,
          hire_date: utcDate.toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating employee:", error);
      return null;
    }

    return {
      ...data,
      id: newId,
      hireDate: data.hire_date
        ? new Date(new Date(data.hire_date).toUTCString())
        : utcDate,
    } as Employee;
  } catch (err) {
    console.error("Error in createEmployee:", err);
    return null;
  }
};

export const updateEmployee = async (
  id: string,
  employee: Partial<Employee>
): Promise<Employee | null> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning null for update employee");
    return null;
  }

  try {
    const uuid = ensureUUID(id);

    // Convert camelCase to snake_case and ensure UTC dates
    let updateData: any = { ...employee };
    if (employee.hireDate) {
      const date = new Date(employee.hireDate);
      updateData.hire_date = new Date(
        Date.UTC(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate(),
          date.getUTCHours(),
          date.getUTCMinutes(),
          date.getUTCSeconds()
        )
      ).toISOString();
      delete updateData.hireDate; // Remove the camelCase version
    }

    const { data, error } = await supabase
      .from("employees")
      .update(updateData)
      .eq("id", uuid)
      .select()
      .single();

    if (error) {
      console.error("Error updating employee:", error);
      return null;
    }

    return {
      ...data,
      id: uuid,
      hireDate: data.hire_date
        ? new Date(new Date(data.hire_date).toUTCString())
        : new Date(),
    } as Employee;
  } catch (err) {
    console.error("Error in updateEmployee:", err);
    return null;
  }
};

export const deleteEmployee = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured) {
    console.warn(
      "Supabase not configured, returning false for delete employee"
    );
    return { success: false, error: "Database not configured" };
  }

  try {
    const uuid = ensureUUID(id);

    // First check if employee has any associated orders
    const { count, error: countError } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("employee_id", uuid);

    if (countError) {
      console.error("Error checking employee orders:", countError);
      return { success: false, error: "Failed to check employee orders" };
    }

    if (count && count > 0) {
      return {
        success: false,
        error: `Cannot delete employee: ${count} orders are associated with this employee. Please reassign or delete the orders first.`,
      };
    }

    const { error } = await supabase.from("employees").delete().eq("id", uuid);

    if (error) {
      console.error("Error deleting employee:", error);
      if (error.code === "23503") {
        // Foreign key violation
        return {
          success: false,
          error:
            "Cannot delete employee: There are orders or other records associated with this employee",
        };
      }
      return { success: false, error: "Failed to delete employee" };
    }

    return { success: true };
  } catch (err) {
    console.error("Error in deleteEmployee:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
};

// Product functions
export const fetchProducts = async (): Promise<Product[]> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning empty products array");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        iphone_details (*),
        charger_details (*),
        cable_details (*),
        airpod_details (*)
      `
      )
      .order("name");

    if (error) {
      console.error("Error fetching products:", error);
      return [];
    }

    return data.map((product) => {
      const baseProductData = {
        id: ensureUUID(product.id),
        name: product.name,
        description: product.description,
        price: parseFloat(String(product.price)) || 0,
        stock: parseInt(String(product.stock)) || 0,
        status: product.status || "available",
        category: product.category,
        createdAt: product.created_at
          ? new Date(product.created_at)
          : new Date(),
      };

      switch (product.category) {
        case "iPhone":
          return product.iphone_details
            ? ({
                ...baseProductData,
                category: "iPhone",
                color: product.iphone_details.color,
                storage: product.iphone_details.storage,
              } as iPhoneProduct)
            : baseProductData;
        case "Charger":
          return product.charger_details
            ? ({
                ...baseProductData,
                category: "Charger",
                wattage: product.charger_details.wattage,
                isFastCharging: product.charger_details.is_fast_charging,
              } as ChargerProduct)
            : baseProductData;
        case "Cable":
          return product.cable_details
            ? ({
                ...baseProductData,
                category: "Cable",
                type: product.cable_details.type,
                length: product.cable_details.length,
              } as CableProduct)
            : baseProductData;
        case "AirPod":
          return {
            ...baseProductData,
            category: "AirPod",
          } as AirPodProduct;
        default:
          return baseProductData;
      }
    });
  } catch (err) {
    console.error("Error in fetchProducts:", err);
    return [];
  }
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning null product");
    return null;
  }

  if (!id) {
    console.error("Product ID is required");
    return null;
  }

  try {
    const uuid = ensureUUID(id);
    const { data: completeProduct, error } = await supabase
      .from("products")
      .select(
        `
        *,
        iphone_details (*),
        charger_details (*),
        cable_details (*),
        airpod_details (*)
      `
      )
      .eq("id", uuid)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      return null;
    }

    // Convert to the appropriate product type
    const baseProductData = {
      id: ensureUUID(completeProduct.id),
      name: completeProduct.name,
      description: completeProduct.description,
      price: parseFloat(String(completeProduct.price)) || 0,
      stock: parseInt(String(completeProduct.stock)) || 0,
      status: completeProduct.status || "available",
      category: completeProduct.category,
      createdAt: completeProduct.created_at
        ? new Date(completeProduct.created_at)
        : new Date(),
    };

    switch (completeProduct.category) {
      case "iPhone":
        return completeProduct.iphone_details
          ? ({
              ...baseProductData,
              category: "iPhone",
              color: completeProduct.iphone_details.color,
              storage: completeProduct.iphone_details.storage,
            } as iPhoneProduct)
          : null;
      case "Charger":
        return completeProduct.charger_details
          ? ({
              ...baseProductData,
              category: "Charger",
              wattage: completeProduct.charger_details.wattage,
              isFastCharging: completeProduct.charger_details.is_fast_charging,
            } as ChargerProduct)
          : null;
      case "Cable":
        return completeProduct.cable_details
          ? ({
              ...baseProductData,
              category: "Cable",
              type: completeProduct.cable_details.type,
              length: completeProduct.cable_details.length,
            } as CableProduct)
          : null;
      case "AirPod":
        return {
          ...baseProductData,
          category: "AirPod",
        } as AirPodProduct;
      default:
        return null;
    }
  } catch (err) {
    console.error("Error in fetchProductById:", err);
    return null;
  }
};

export const createProduct = async (
  product: Omit<Product, "id" | "createdAt">
): Promise<Product | null> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning null for create product");
    return null;
  }

  try {
    const newId = uuidv4();

    // Base product data
    const baseData = {
      id: newId,
      name: product.name,
      description: product.description,
      price: parseFloat(String(product.price)) || 0,
      stock: parseInt(String(product.stock)) || 0,
      status: product.status || "available",
      category: product.category,
      created_at: new Date().toISOString(),
    };

    // First create the base product
    const { data: baseProduct, error: baseError } = await supabase
      .from("products")
      .insert([baseData])
      .select()
      .single();

    if (baseError) {
      console.error("Error creating base product:", baseError);
      return null;
    }

    // Then add category-specific details
    let detailsError = null;
    switch (product.category) {
      case "iPhone": {
        const iPhoneProduct = product as Omit<
          iPhoneProduct,
          "id" | "createdAt"
        >;
        const { error } = await supabase.from("iphone_details").insert([
          {
            product_id: newId,
            color: iPhoneProduct.color,
            storage: iPhoneProduct.storage,
          },
        ]);
        detailsError = error;
        break;
      }
      case "Charger": {
        const chargerProduct = product as Omit<
          ChargerProduct,
          "id" | "createdAt"
        >;
        const { error } = await supabase.from("charger_details").insert([
          {
            product_id: newId,
            wattage: chargerProduct.wattage,
            is_fast_charging: chargerProduct.isFastCharging,
          },
        ]);
        detailsError = error;
        break;
      }
      case "Cable": {
        const cableProduct = product as Omit<CableProduct, "id" | "createdAt">;
        const { error } = await supabase.from("cable_details").insert([
          {
            product_id: newId,
            type: cableProduct.type,
            length: cableProduct.length,
          },
        ]);
        detailsError = error;
        break;
      }
      case "AirPod": {
        const airPodProduct = product as Omit<
          AirPodProduct,
          "id" | "createdAt"
        >;
        const { error } = await supabase.from("airpod_details").insert([
          {
            product_id: newId,
          },
        ]);
        detailsError = error;
        break;
      }
    }

    if (detailsError) {
      console.error("Error creating product details:", detailsError);
      // Clean up the base product if details creation failed
      await supabase.from("products").delete().eq("id", newId);
      return null;
    }

    // Fetch the complete product with its details
    const { data: completeProduct, error: fetchError } = await supabase
      .from("products")
      .select(
        `
        *,
        iphone_details (*),
        charger_details (*),
        cable_details (*),
        airpod_details (*)
      `
      )
      .eq("id", newId)
      .single();

    if (fetchError) {
      console.error("Error fetching complete product:", fetchError);
      return null;
    }

    // Convert to the appropriate product type
    const baseProductData = {
      id: ensureUUID(completeProduct.id),
      name: completeProduct.name,
      description: completeProduct.description,
      price: parseFloat(String(completeProduct.price)) || 0,
      stock: parseInt(String(completeProduct.stock)) || 0,
      status: completeProduct.status || "available",
      category: completeProduct.category,
      createdAt: completeProduct.created_at
        ? new Date(completeProduct.created_at)
        : new Date(),
    };

    switch (completeProduct.category) {
      case "iPhone":
        return completeProduct.iphone_details
          ? ({
              ...baseProductData,
              category: "iPhone",
              color: completeProduct.iphone_details.color,
              storage: completeProduct.iphone_details.storage,
            } as iPhoneProduct)
          : null;
      case "Charger":
        return completeProduct.charger_details
          ? ({
              ...baseProductData,
              category: "Charger",
              wattage: completeProduct.charger_details.wattage,
              isFastCharging: completeProduct.charger_details.is_fast_charging,
            } as ChargerProduct)
          : null;
      case "Cable":
        return completeProduct.cable_details
          ? ({
              ...baseProductData,
              category: "Cable",
              type: completeProduct.cable_details.type,
              length: completeProduct.cable_details.length,
            } as CableProduct)
          : null;
      case "AirPod":
        return completeProduct.airpod_details
          ? ({
              ...baseProductData,
              category: "AirPod",
            } as AirPodProduct)
          : null;
      default:
        return null;
    }
  } catch (err) {
    console.error("Error in createProduct:", err);
    return null;
  }
};

export const updateProduct = async (
  id: string,
  product: Partial<Product>
): Promise<Product | null> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning null for update product");
    return null;
  }

  try {
    const uuid = ensureUUID(id);

    // First get the current product to know its category
    const { data: currentProduct, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", uuid)
      .single();

    if (fetchError) {
      console.error("Error fetching current product:", fetchError);
      return null;
    }

    // Base update data
    const baseData = {
      name: product.name,
      description: product.description,
      price:
        product.price !== undefined
          ? parseFloat(String(product.price))
          : undefined,
      stock:
        product.stock !== undefined
          ? parseInt(String(product.stock))
          : undefined,
      status: product.status,
    };

    // Remove undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(baseData).filter(([_, value]) => value !== undefined)
    );

    // Update base product
    const { data, error } = await supabase
      .from("products")
      .update(cleanedData)
      .eq("id", uuid)
      .select()
      .single();

    if (error) {
      console.error("Error updating product:", error);
      return null;
    }

    // Update category-specific details
    let detailsError = null;
    switch (currentProduct.category) {
      case "iPhone": {
        const iPhoneProduct = product as Partial<iPhoneProduct>;
        if (iPhoneProduct.color || iPhoneProduct.storage) {
          const { error } = await supabase
            .from("iphone_details")
            .update({
              color: iPhoneProduct.color,
              storage: iPhoneProduct.storage,
            })
            .eq("product_id", uuid);
          detailsError = error;
        }
        break;
      }
      case "Charger": {
        const chargerProduct = product as Partial<ChargerProduct>;
        if (
          chargerProduct.wattage ||
          chargerProduct.isFastCharging !== undefined
        ) {
          const { error } = await supabase
            .from("charger_details")
            .update({
              wattage: chargerProduct.wattage,
              is_fast_charging: chargerProduct.isFastCharging,
            })
            .eq("product_id", uuid);
          detailsError = error;
        }
        break;
      }
      case "Cable": {
        const cableProduct = product as Partial<CableProduct>;
        if (cableProduct.type || cableProduct.length) {
          const { error } = await supabase
            .from("cable_details")
            .update({
              type: cableProduct.type,
              length: cableProduct.length,
            })
            .eq("product_id", uuid);
          detailsError = error;
        }
        break;
      }
    }

    if (detailsError) {
      console.error("Error updating product details:", detailsError);
      return null;
    }

    // Fetch the complete product with its details
    const { data: completeProduct, error: fetchCompleteError } = await supabase
      .from("products")
      .select(
        `
        *,
        iphone_details (*),
        charger_details (*),
        cable_details (*),
        airpod_details (*)
      `
      )
      .eq("id", uuid)
      .single();

    if (fetchCompleteError) {
      console.error("Error fetching complete product:", fetchCompleteError);
      return null;
    }

    // Convert to the appropriate product type
    const baseProductData = {
      id: ensureUUID(completeProduct.id),
      name: completeProduct.name,
      description: completeProduct.description,
      price: parseFloat(String(completeProduct.price)) || 0,
      stock: parseInt(String(completeProduct.stock)) || 0,
      status: completeProduct.status || "available",
      category: completeProduct.category,
      createdAt: completeProduct.created_at
        ? new Date(completeProduct.created_at)
        : new Date(),
    };

    switch (completeProduct.category) {
      case "iPhone":
        return completeProduct.iphone_details
          ? ({
              ...baseProductData,
              category: "iPhone",
              color: completeProduct.iphone_details.color,
              storage: completeProduct.iphone_details.storage,
            } as iPhoneProduct)
          : null;
      case "Charger":
        return completeProduct.charger_details
          ? ({
              ...baseProductData,
              category: "Charger",
              wattage: completeProduct.charger_details.wattage,
              isFastCharging: completeProduct.charger_details.is_fast_charging,
            } as ChargerProduct)
          : null;
      case "Cable":
        return completeProduct.cable_details
          ? ({
              ...baseProductData,
              category: "Cable",
              type: completeProduct.cable_details.type,
              length: completeProduct.cable_details.length,
            } as CableProduct)
          : null;
      case "AirPod":
        return {
          ...baseProductData,
          category: "AirPod",
        } as AirPodProduct;
      default:
        return null;
    }
  } catch (err) {
    console.error("Error in updateProduct:", err);
    return null;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning false for delete product");
    return false;
  }

  try {
    const uuid = ensureUUID(id);
    const { error } = await supabase.from("products").delete().eq("id", uuid);

    if (error) {
      console.error("Error deleting product:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in deleteProduct:", err);
    return false;
  }
};

// Order functions
export const fetchOrders = async (): Promise<Order[]> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning empty orders array");
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          price
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      return [];
    }

    return data.map((order) => ({
      id: ensureUUID(order.id),
      customerId: ensureUUID(order.customer_id),
      customerName: order.customer_name || "",
      employeeId: ensureUUID(order.employee_id),
      employeeName: order.employee_name || "",
      total: parseFloat(String(order.total)) || 0,
      createdAt: order.created_at ? new Date(order.created_at) : new Date(),
      items: (order.order_items || []).map((item: any) => ({
        id: item.id,
        productId: ensureUUID(item.product_id),
        productName: item.product_name,
        quantity: parseInt(String(item.quantity)) || 1,
        price: parseFloat(String(item.price)) || 0,
      })),
    })) as Order[];
  } catch (err) {
    console.error("Error in fetchOrders:", err);
    return [];
  }
};

export const fetchOrderById = async (id: string): Promise<Order | null> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning null order");
    return null;
  }

  if (!id) {
    console.error("Order ID is required");
    return null;
  }

  try {
    const uuid = ensureUUID(id);

    // First check if the order exists
    const { count, error: countError } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("id", uuid);

    if (countError) {
      console.error("Error checking order existence:", countError);
      return null;
    }

    if (!count) {
      console.warn(`No order found with ID: ${uuid}`);
      return null;
    }

    // Then fetch the order with its items
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          price
        )
      `
      )
      .eq("id", uuid)
      .maybeSingle();

    if (error) {
      console.error("Error fetching order:", error);
      return null;
    }

    if (!data) {
      console.warn(`No order data found with ID: ${uuid}`);
      return null;
    }

    return {
      id: ensureUUID(data.id),
      customerId: ensureUUID(data.customer_id),
      customerName: data.customer_name || "",
      employeeId: ensureUUID(data.employee_id),
      employeeName: data.employee_name || "",
      status: data.status || "pending",
      total: parseFloat(String(data.total)) || 0,
      items: (data.order_items || []).map((item: any) => ({
        id: item.id || crypto.randomUUID(),
        productId: ensureUUID(item.product_id),
        productName: item.product_name || "Unknown Product",
        quantity: parseInt(String(item.quantity)) || 1,
        price: parseFloat(String(item.price)) || 0,
      })),
      createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    } as Order;
  } catch (err) {
    console.error("Error in fetchOrderById:", err);
    return null;
  }
};

export const createOrder = async (
  order: Omit<Order, "id" | "createdAt">
): Promise<Order | null> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning null for create order");
    return null;
  }

  try {
    // First validate stock availability for all items
    for (const item of order.items) {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.productId)
        .single();

      if (productError) {
        console.error("Error checking product stock:", productError);
        throw new Error(`Failed to check stock for product ${item.productId}`);
      }

      if (!product || product.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for product ${item.productName}. Available: ${
            product?.stock || 0
          }, Requested: ${item.quantity}`
        );
      }
    }

    const newId = uuidv4();

    // Prepare order data without items
    const orderData = {
      id: newId,
      customer_id: ensureUUID(order.customerId),
      customer_name: order.customerName,
      employee_id: ensureUUID(order.employeeId),
      employee_name: order.employeeName,
      total: parseFloat(String(order.total)) || 0,
      created_at: new Date().toISOString(),
    };

    // Create the order
    const { data: orderResult, error: orderError } = await supabase
      .from("orders")
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return null;
    }

    // Prepare and insert order items
    if (order.items && order.items.length > 0) {
      const orderItems = order.items.map((item) => ({
        id: item.id || crypto.randomUUID(),
        order_id: newId,
        product_id: ensureUUID(item.productId),
        product_name: item.productName,
        quantity: parseInt(String(item.quantity)) || 1,
        price: parseFloat(String(item.price)) || 0,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Error creating order items:", itemsError);
        // Attempt to delete the order since items failed
        await supabase.from("orders").delete().eq("id", newId);
        return null;
      }

      // Update product stock levels
      for (const item of order.items) {
        const { error: updateError } = await supabase.rpc("decrease_stock", {
          p_product_id: item.productId,
          p_quantity: item.quantity,
        });

        if (updateError) {
          console.error("Error updating product stock:", updateError);
          // Attempt to delete the order since stock update failed
          await supabase.from("orders").delete().eq("id", newId);
          throw new Error(
            `Failed to update stock for product ${item.productName}`
          );
        }
      }
    }

    // Fetch the complete order with items
    const { data: completeOrder, error: fetchError } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          price
        )
      `
      )
      .eq("id", newId)
      .single();

    if (fetchError) {
      console.error("Error fetching complete order:", fetchError);
      return null;
    }

    // Convert snake_case back to camelCase for the response
    return {
      id: ensureUUID(completeOrder.id),
      customerId: ensureUUID(completeOrder.customer_id),
      customerName: completeOrder.customer_name || "",
      employeeId: ensureUUID(completeOrder.employee_id),
      employeeName: completeOrder.employee_name || "",
      items: (completeOrder.order_items || []).map((item: any) => ({
        id: item.id,
        productId: ensureUUID(item.product_id),
        productName: item.product_name,
        quantity: parseInt(String(item.quantity)) || 1,
        price: parseFloat(String(item.price)) || 0,
      })),
      total: parseFloat(String(completeOrder.total)) || 0,
      createdAt: completeOrder.created_at
        ? new Date(completeOrder.created_at)
        : new Date(),
    } as Order;
  } catch (err) {
    console.error("Error in createOrder:", err);
    throw err;
  }
};

export const updateOrder = async (
  id: string,
  order: Partial<Order>
): Promise<Order | null> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning null for update order");
    return null;
  }

  try {
    const uuid = ensureUUID(id);

    // First get the original order to compare item quantities
    const { data: originalOrder, error: fetchError } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          price
        )
      `
      )
      .eq("id", uuid)
      .single();

    if (fetchError) {
      console.error("Error fetching original order:", fetchError);
      return null;
    }

    // Convert camelCase to snake_case for Supabase
    const updateData = {
      customer_id: order.customerId ? ensureUUID(order.customerId) : undefined,
      customer_name: order.customerName || undefined,
      employee_id: order.employeeId ? ensureUUID(order.employeeId) : undefined,
      employee_name: order.employeeName || undefined,
      total: typeof order.total === "number" ? order.total : undefined,
    };

    // Remove undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    // First update the order
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .update(cleanedData)
      .eq("id", uuid)
      .select()
      .single();

    if (orderError) {
      console.error("Error updating order:", orderError);
      return null;
    }

    if (!orderData) {
      console.error("No data returned after update");
      return null;
    }

    // Handle stock updates and order items
    let items = [];
    if (Array.isArray(order.items)) {
      type OrderItemMap = { quantity: number; id: string };

      // Create a map of original items for easy lookup
      const originalItems = new Map<string, OrderItemMap>(
        (originalOrder.order_items || []).map((item: any) => [
          item.product_id as string,
          {
            quantity: parseInt(String(item.quantity)) || 0,
            id: item.id as string,
          },
        ])
      );

      // Create a map of new items for easy lookup
      const newItems = new Map<string, OrderItemMap>(
        order.items.map((item) => [
          item.productId,
          {
            quantity: parseInt(String(item.quantity)) || 0,
            id: item.id,
          },
        ])
      );

      // Handle removed items - increase stock
      for (const [productId, originalItem] of originalItems.entries()) {
        if (!newItems.has(productId)) {
          // First get current stock
          const { data: product, error: getError } = await supabase
            .from("products")
            .select("stock")
            .eq("id", productId)
            .single();

          if (getError) {
            console.error("Error getting product stock:", getError);
            throw new Error(`Failed to get stock for product ${productId}`);
          }

          // Then update with new stock value
          const newStock = (product?.stock || 0) + originalItem.quantity;
          const { error: stockError } = await supabase
            .from("products")
            .update({ stock: newStock })
            .eq("id", productId);

          if (stockError) {
            console.error("Error updating stock for removed item:", stockError);
            throw new Error(
              `Failed to update stock for removed product ${productId}`
            );
          }
        }
      }

      // Handle new and modified items
      for (const item of order.items) {
        // Check if we have enough stock for quantity increases
        const originalItem = originalItems.get(item.productId);
        const originalQuantity = originalItem ? originalItem.quantity : 0;
        const newQuantity = parseInt(String(item.quantity)) || 0;
        const quantityDiff = newQuantity - originalQuantity;

        if (quantityDiff > 0) {
          // Need to check if we have enough stock for the increase
          const { data: product, error: stockCheckError } = await supabase
            .from("products")
            .select("stock")
            .eq("id", item.productId)
            .single();

          if (stockCheckError) {
            console.error("Error checking product stock:", stockCheckError);
            throw new Error(
              `Failed to check stock for product ${item.productId}`
            );
          }

          if (!product || product.stock < quantityDiff) {
            throw new Error(
              `Insufficient stock for product ${item.productName}. Available: ${
                product?.stock || 0
              }, Additional requested: ${quantityDiff}`
            );
          }
        }

        // Update stock based on quantity difference
        if (quantityDiff !== 0) {
          // First get current stock
          const { data: product, error: getError } = await supabase
            .from("products")
            .select("stock")
            .eq("id", item.productId)
            .single();

          if (getError) {
            console.error("Error getting product stock:", getError);
            throw new Error(
              `Failed to get stock for product ${item.productId}`
            );
          }

          // Calculate new stock value
          const currentStock = product?.stock || 0;
          const newStock =
            quantityDiff > 0
              ? currentStock - Math.abs(quantityDiff)
              : currentStock + Math.abs(quantityDiff);

          // Update with new stock value
          const { error: stockError } = await supabase
            .from("products")
            .update({ stock: newStock })
            .eq("id", item.productId);

          if (stockError) {
            console.error("Error updating product stock:", stockError);
            throw new Error(
              `Failed to update stock for product ${item.productName}`
            );
          }
        }
      }

      // Delete all existing items
      await supabase.from("order_items").delete().eq("order_id", uuid);

      // Insert new items
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .insert(
          order.items.map((item) => ({
            id: item.id || crypto.randomUUID(),
            order_id: uuid,
            product_id: ensureUUID(item.productId),
            product_name: item.productName,
            quantity: parseInt(String(item.quantity)) || 1,
            price: parseFloat(String(item.price)) || 0,
          }))
        )
        .select();

      if (itemsError) {
        console.error("Error updating order items:", itemsError);
        throw new Error("Failed to update order items");
      }

      items = itemsData.map((item) => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        price: item.price,
      }));
    }

    // Return the complete order with items
    return {
      id: ensureUUID(orderData.id),
      customerId: ensureUUID(orderData.customer_id),
      customerName: orderData.customer_name || "",
      employeeId: ensureUUID(orderData.employee_id),
      employeeName: orderData.employee_name || "",
      items: items,
      total: parseFloat(String(orderData.total)) || 0,
      createdAt: orderData.created_at
        ? new Date(orderData.created_at)
        : new Date(),
    } as Order;
  } catch (err) {
    console.error("Error in updateOrder:", err);
    throw err;
  }
};

export const deleteOrder = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning false for delete order");
    return { success: false, error: "Database not configured" };
  }

  try {
    const uuid = ensureUUID(id);

    // First delete associated order items
    const { error: itemsError } = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", uuid);

    if (itemsError) {
      console.error("Error deleting order items:", itemsError);
      return {
        success: false,
        error: "Failed to delete order items",
      };
    }

    // Then delete the order
    const { error: orderError } = await supabase
      .from("orders")
      .delete()
      .eq("id", uuid);

    if (orderError) {
      console.error("Error deleting order:", orderError);
      if (orderError.code === "23503") {
        // Foreign key violation
        return {
          success: false,
          error:
            "Cannot delete order: There are related records that must be deleted first",
        };
      }
      return { success: false, error: "Failed to delete order" };
    }

    return { success: true };
  } catch (err) {
    console.error("Error in deleteOrder:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
};

// Get customer purchase count
export const getCustomerPurchaseCount = async (
  customerId: string
): Promise<number> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning 0 for purchase count");
    return 0;
  }

  if (!customerId) {
    console.error("Customer ID is required for purchase count");
    return 0;
  }

  try {
    // Ensure customerId is a valid UUID
    if (!isValidUUID(customerId)) {
      console.error("Invalid UUID format for customer ID:", customerId);
      return 0;
    }

    // First verify the customer exists
    const { count: customerExists, error: customerError } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("id", customerId);

    if (customerError || !customerExists) {
      console.error("Customer not found:", customerId);
      return 0;
    }

    // Then count their orders
    const { count, error } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("customer_id", customerId);

    if (error) {
      console.error("Error fetching customer purchase count:", error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error("Error in getCustomerPurchaseCount:", err);
    return 0;
  }
};

// Get employee sales metrics
export const getEmployeeSalesMetrics = async (
  employeeId: string
): Promise<{ count: number; amount: number }> => {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured, returning zero metrics");
    return { count: 0, amount: 0 };
  }

  try {
    // First get the count of orders
    const { count, error: countError } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("employee_id", employeeId);

    if (countError) {
      console.error("Error counting employee orders:", countError);
      return { count: 0, amount: 0 };
    }

    // Then get the total amount
    const { data, error: amountError } = await supabase
      .from("orders")
      .select("total")
      .eq("employee_id", employeeId);

    if (amountError) {
      console.error("Error getting employee sales amount:", amountError);
      return { count: 0, amount: 0 };
    }

    const totalAmount = data.reduce((sum, order) => sum + order.total, 0);

    return {
      count: count || 0,
      amount: totalAmount,
    };
  } catch (err) {
    console.error("Error in getEmployeeSalesMetrics:", err);
    return { count: 0, amount: 0 };
  }
};
