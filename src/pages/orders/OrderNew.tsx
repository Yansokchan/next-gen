import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Order } from "@/lib/types";
import { Plus, Trash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchCustomers,
  fetchProducts,
  fetchEmployees,
  createOrder,
} from "@/lib/supabase";

const OrderNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [items, setItems] = useState<
    Array<{
      id: string;
      productId: string;
      productName: string;
      quantity: number;
      price: number;
    }>
  >([
    {
      id: crypto.randomUUID(),
      productId: "",
      productName: "",
      quantity: 1,
      price: 0,
    },
  ]);
  const [customerId, setCustomerId] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  // Fetch customers, products, and employees
  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  });

  // Filter out products with no stock
  const availableProducts = products.filter(
    (product) => product.stock > 0 && product.status === "available"
  );

  const addItem = () => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        productId: "",
        productName: "",
        quantity: 1,
        price: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    } else {
      toast({
        title: "Cannot remove item",
        description: "Orders must have at least one item",
        variant: "destructive",
      });
    }
  };

  const updateItemPrice = (id: string, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setItems(
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                productId,
                productName: product.name,
                price: product.price,
                quantity: 1, // Reset quantity when product changes
              }
            : item
        )
      );
    }
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    const item = items.find((i) => i.id === id);
    const product = item ? products.find((p) => p.id === item.productId) : null;

    if (!product) {
      toast({
        title: "Error",
        description: "Please select a product first",
        variant: "destructive",
      });
      return;
    }

    if (quantity > product.stock) {
      toast({
        title: "Invalid quantity",
        description: `Only ${product.stock} units available in stock`,
        variant: "destructive",
      });
      return;
    }

    setItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(1, Math.floor(quantity)),
            }
          : item
      )
    );
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      if (!item.productId) return sum;
      return sum + (item.price || 0) * (item.quantity || 1);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Validate form
    if (!customerId) {
      toast({
        title: "Customer required",
        description: "Please select a customer for this order",
        variant: "destructive",
      });
      return;
    }

    if (!employeeId) {
      toast({
        title: "Employee required",
        description: "Please select an employee who processed this order",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0 || items.some((item) => !item.productId)) {
      toast({
        title: "Products required",
        description: "Please add at least one product to the order",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate total
      const total = calculateTotal();

      // Find the customer and employee
      const customer = customers.find((c) => c.id === customerId);
      const employee = employees.find((e) => e.id === employeeId);

      if (!customer || !employee) {
        throw new Error("Customer or employee not found");
      }

      // Create order
      const newOrder = await createOrder({
        customerId,
        customerName: customer.name,
        employeeId,
        employeeName: employee.name,
        items: items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName || "",
          quantity: item.quantity || 1,
          price: item.price || 0,
        })),
        total,
      });

      if (newOrder) {
        toast({
          title: "Order created",
          description: `Order #${newOrder.id
            .substring(0, 8)
            .toUpperCase()} created successfully`,
        });

        navigate(`/orders/${newOrder.id}`);
      } else {
        throw new Error("Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Creation failed",
        description:
          error instanceof Error
            ? error.message
            : "There was a problem creating the order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingCustomers || isLoadingProducts || isLoadingEmployees) {
    return (
      <Layout title="Create Order" description="Create a new customer order">
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Create Order" description="Create a new customer order">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Customer</label>
              <Select onValueChange={setCustomerId} value={customerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Processed By
              </label>
              <Select onValueChange={setEmployeeId} value={employeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} - {employee.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Order Items</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
              >
                <Plus size={16} className="mr-1" /> Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <Card key={item.id}>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                      <div className="sm:col-span-6">
                        <label className="block text-sm font-medium mb-1">
                          Product
                        </label>
                        <Select
                          onValueChange={(value) =>
                            updateItemPrice(item.id, value)
                          }
                          value={item.productId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableProducts.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - ${product.price.toFixed(2)}{" "}
                                (Stock: {product.stock})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-sm font-medium mb-1">
                          Quantity
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItemQuantity(
                              item.id,
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-1">
                          Price
                        </label>
                        <div className="text-sm py-2">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>

                      <div className="sm:col-span-1 flex items-end justify-end h-full">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Order Summary</h3>
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-1">
                  {items.map((item) => {
                    const product = products.find(
                      (p) => p.id === item.productId
                    );
                    const itemTotal = (product?.price || 0) * item.quantity;

                    if (!product) return null;

                    return (
                      <div key={item.id} className="flex justify-between">
                        <span>
                          {product.name} x {item.quantity}
                        </span>
                        <span>${itemTotal.toFixed(2)}</span>
                      </div>
                    );
                  })}

                  <div className="border-t mt-2 pt-2 font-medium flex justify-between">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/orders")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Order"}
          </Button>
        </div>
      </form>
    </Layout>
  );
};

export default OrderNew;
