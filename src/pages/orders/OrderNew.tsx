import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Order } from "@/lib/types";
import {
  Plus,
  Trash,
  ShoppingCart,
  User,
  UserCircle,
  Calculator,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchCustomers,
  fetchProducts,
  fetchEmployees,
  createOrder,
} from "@/lib/supabase";
import { motion } from "framer-motion";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useConfirmation } from "@/hooks/useConfirmation";
import { Combobox } from "@/components/ui/combobox";

const OrderNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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

  // Filter employees to only show Sales department
  const salesEmployees = employees.filter(
    (employee) => employee.department === "Sales"
  );

  // Filter out products with no stock
  const availableProducts = products.filter(
    (product) => product.stock > 0 && product.status === "available"
  );

  // Format customers for combobox
  const customerOptions = customers.map((customer) => ({
    value: customer.id,
    label: customer.name,
  }));

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
    if (items.length === 1) {
      toast({
        title: "Cannot remove item",
        description: "Order must have at least one item",
        variant: "destructive",
      });
      return;
    }
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (
    id: string,
    field: "productId" | "quantity",
    value: string | number
  ) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          if (field === "productId") {
            const product = products.find((p) => p.id === value);
            return {
              ...item,
              productId: value as string,
              productName: product?.name || "",
              price: product?.price || 0,
            };
          }
          // Handle quantity field
          if (field === "quantity") {
            return {
              ...item,
              quantity: Math.max(1, Number(value)), // Ensure it's a number and at least 1
            };
          }
        }
        return item;
      })
    );
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCreateOrder = async () => {
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

  const saveConfirmation = useConfirmation({
    title: "Create New Order",
    description: "Are you sure you want to create this order?",
    confirmText: "Create Order",
    onConfirm: handleCreateOrder,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    saveConfirmation.open();
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
    focus: {
      scale: 1.02,
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 },
    },
    blur: {
      scale: 1,
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.2 },
    },
    hover: {
      y: -2,
      transition: { duration: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    hover: {
      y: -4,
      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
      transition: { duration: 0.2 },
    },
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
      <motion.div
        className="max-w-4xl mx-auto px-4 sm:px-16"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-white to-blue-50/30 backdrop-blur-xl ring-1 ring-gray-200/50 overflow-hidden p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 animate-pulse">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                New Order
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div className="space-y-3" variants={inputVariants}>
                <label className="block text-sm font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Customer
                    </span>
                  </div>
                </label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="blur"
                  className="transform-gpu"
                >
                  <Combobox
                    items={customerOptions || []}
                    value={customerId}
                    onValueChange={setCustomerId}
                    placeholder="Search customer..."
                    searchPlaceholder="Type customer name..."
                    emptyText="No customers found"
                    isLoading={isLoadingCustomers}
                  />
                </motion.div>
              </motion.div>

              <motion.div className="space-y-3" variants={inputVariants}>
                <label className="block text-sm font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <UserCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Processed By
                    </span>
                  </div>
                </label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="blur"
                  className="transform-gpu"
                >
                  <Select onValueChange={setEmployeeId} value={employeeId}>
                    <SelectTrigger className="h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm">
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {salesEmployees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              </motion.div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                    <Calculator className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    Order Items
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={addItem}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="grid grid-cols-1 items-center md:grid-cols-[2fr,1fr,auto] gap-4 p-4 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div
                      variants={inputVariants}
                      whileFocus="focus"
                      whileTap="blur"
                      className="transform-gpu"
                    >
                      <Select
                        value={item.productId}
                        onValueChange={(value) =>
                          updateItem(item.id, "productId", value)
                        }
                      >
                        <SelectTrigger className="h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm">
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - ${product.price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>

                    <motion.div
                      variants={inputVariants}
                      whileFocus="focus"
                      whileTap="blur"
                      className="transform-gpu"
                    >
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "quantity",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                      />
                    </motion.div>

                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="h-8 w-8 hover:bg-red-600 transition-colors duration-200"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <motion.div
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-sm font-medium text-gray-600">
                    Total Amount
                  </div>
                  <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    ${calculateTotal().toFixed(2)}
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 min-w-[150px]"
              >
                {isSubmitting ? "Creating..." : "Create Order"}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
      <ConfirmationDialog {...saveConfirmation.dialogProps} />
    </Layout>
  );
};

export default OrderNew;
