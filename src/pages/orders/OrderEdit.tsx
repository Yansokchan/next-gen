import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  ArrowLeft,
  Plus,
  Trash,
  ShoppingCart,
  User,
  UserCircle,
  Package,
  DollarSign,
} from "lucide-react";
import {
  fetchOrderById,
  fetchCustomers,
  fetchProducts,
  fetchEmployees,
  updateOrder,
} from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useConfirmation } from "@/hooks/useConfirmation";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";

const OrderEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [items, setItems] = useState<
    Array<{
      id: string;
      productId: string;
      productName: string;
      quantity: number;
      price: number;
    }>
  >([]);
  const [customerId, setCustomerId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Fetch order data
  const {
    data: order,
    isLoading: isLoadingOrder,
    error: orderError,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrderById(id || ""),
    enabled: !!id,
  });

  // Fetch customers, products, and employees
  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  });

  // Update form state when order data is loaded
  useEffect(() => {
    if (order) {
      setItems(order.items || []);
      setCustomerId(order.customerId || "");
      setEmployeeId(order.employeeId || "");
      setHasChanges(false);
    }
  }, [order]);

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
    setHasChanges(true);
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (itemToDelete && items.length > 1) {
      setItems(items.filter((item) => item.id !== itemToDelete));
      setHasChanges(true);
    } else {
      toast({
        title: "Cannot remove item",
        description: "Orders must have at least one item",
        variant: "destructive",
      });
    }
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };

  const updateItemPrice = (id: string, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setItems(
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                productId: product.id,
                productName: product.name,
                price: product.price,
                quantity: 1,
              }
            : item
        )
      );
      setHasChanges(true);
    }
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    const validQuantity = Math.max(1, Math.floor(quantity));
    setItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: validQuantity,
            }
          : item
      )
    );
    setHasChanges(true);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      if (!item.productId) return sum;
      return sum + (item.price || 0) * (item.quantity || 1);
    }, 0);
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

  const fieldVariants = {
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

  // Filter employees to only show Sales department
  const salesEmployees = employees.filter(
    (employee) => employee.department === "Sales"
  );

  // Format customers for combobox
  const customerOptions = customers.map((customer) => ({
    value: customer.id,
    label: customer.name,
  }));

  const confirmUpdate = async () => {
    if (!id || isSubmitting) return;

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

    // Find the customer and employee
    const customer = customers.find((c) => c.id === customerId);
    const employee = employees.find((e) => e.id === employeeId);

    if (!customer) {
      toast({
        title: "Error",
        description: "Selected customer not found",
        variant: "destructive",
      });
      return;
    }

    if (!employee) {
      toast({
        title: "Error",
        description: "Selected employee not found",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate total
      const total = calculateTotal();

      // Update order
      const updatedOrder = await updateOrder(id, {
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

      if (updatedOrder) {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["order", id] });

        toast({
          title: "Order updated",
          description: `Order #${updatedOrder.id
            .substring(0, 8)
            .toUpperCase()} updated successfully`,
        });

        navigate(`/orders/${id}`);
      } else {
        throw new Error("Failed to update order");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Update failed",
        description:
          "There was a problem updating the order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateConfirmation = useConfirmation({
    title: "Update Order",
    description: "Are you sure you want to update this order?",
    confirmText: "Update Order",
    onConfirm: confirmUpdate,
    variant: "default",
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfirmation.open();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (isLoadingOrder) {
    return (
      <Layout title="Loading..." description="Fetching order information...">
        <motion.div
          className="max-w-4xl mx-auto px-4 sm:px-16"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-white to-blue-50/30 backdrop-blur-xl ring-1 ring-gray-200/50 overflow-hidden p-6 sm:p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </Card>
        </motion.div>
      </Layout>
    );
  }

  if (orderError || !order) {
    return (
      <Layout>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p>Failed to load order details</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Edit Order" description="Update order information.">
      <motion.div
        className="max-w-4xl mx-auto px-4 sm:px-16"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-white to-blue-50/30 backdrop-blur-xl ring-1 ring-gray-200/50 overflow-hidden p-6 sm:p-8">
          <form onSubmit={handleUpdate} className="space-y-8">
            <motion.div
              className="flex items-center gap-3 mb-6"
              variants={fieldVariants}
            >
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 animate-pulse">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Edit Order
              </span>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
              variants={containerVariants}
            >
              <motion.div className="space-y-3" variants={inputVariants}>
                <Label htmlFor="customer" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Customer
                    </span>
                  </div>
                </Label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="blur"
                  className="transform-gpu"
                >
                  <Combobox
                    items={customerOptions || []}
                    value={customerId}
                    onValueChange={(value) => {
                      setCustomerId(value);
                      setHasChanges(true);
                    }}
                    placeholder="Search customer..."
                    searchPlaceholder="Type customer name..."
                    emptyText="No customers found"
                    isLoading={isLoadingCustomers}
                  />
                </motion.div>
              </motion.div>

              <motion.div className="space-y-3" variants={inputVariants}>
                <Label htmlFor="employee" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <UserCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Employee
                    </span>
                  </div>
                </Label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="blur"
                  className="transform-gpu"
                >
                  <Select
                    value={employeeId}
                    onValueChange={(value) => {
                      setEmployeeId(value);
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger className="h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm">
                      <SelectValue placeholder="Select employee" />
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
            </motion.div>

            <motion.div className="space-y-4" variants={containerVariants}>
              <div className="flex items-center justify-between">
                <Label className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Order Items
                    </span>
                  </div>
                </Label>
                <Button
                  type="button"
                  onClick={addItem}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  className="grid grid-cols-12 gap-4 items-center bg-white/50 backdrop-blur-sm p-4 rounded-lg border border-gray-200 shadow-sm"
                  variants={fieldVariants}
                >
                  <div className="col-span-5">
                    <Select
                      value={item.productId}
                      onValueChange={(value) => updateItemPrice(item.id, value)}
                    >
                      <SelectTrigger className="h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - ${product.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItemQuantity(item.id, parseInt(e.target.value))
                      }
                      className="h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                  <div className="col-span-3 text-right font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <div className="col-span-2 text-right">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDelete(item.id)}
                      className="h-12 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}

              <motion.div
                className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-indigo-50/30 rounded-lg"
                variants={fieldVariants}
              >
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-700">Total</span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  ${calculateTotal().toFixed(2)}
                </span>
              </motion.div>
            </motion.div>

            <motion.div
              className="flex justify-end gap-4 pt-6 border-t border-gray-100"
              variants={fieldVariants}
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/orders")}
                className="min-w-[100px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 min-w-[150px]"
              >
                {isSubmitting ? "Updating..." : "Update Order"}
              </Button>
            </motion.div>
          </form>
        </Card>
      </motion.div>
      <ConfirmationDialog {...updateConfirmation.dialogProps} />
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Item"
        description="Are you sure you want to remove this item from the order?"
        confirmText="Delete Item"
        variant="destructive"
      />
    </Layout>
  );
};

export default OrderEdit;
