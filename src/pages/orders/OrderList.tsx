import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Loader2,
  Hash,
  User,
  CircleDollarSign,
  Calendar,
  ActivitySquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { fetchOrders, deleteOrder, fetchCustomerById } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Order } from "@/lib/types";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Separator } from "@/components/ui/separator";

const OrderList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const orders = await fetchOrders();
      const ordersWithCustomers = await Promise.all(
        orders.map(async (order) => {
          const customer = await fetchCustomerById(order.customerId);
          return {
            ...order,
            customerName: customer?.name || "Unknown Customer",
          };
        })
      );
      return ordersWithCustomers;
    },
  });

  const columns: Column<Order>[] = [
    {
      accessorKey: "id",
      header: () => (
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-700">Order ID</span>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">
          {row.original.id.toUpperCase().substring(0, 8)}
        </span>
      ),
    },
    {
      accessorKey: "customerName",
      header: () => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-700">Customer</span>
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-gray-900">{row.original.customerName}</span>
      ),
    },
    {
      accessorKey: "total",
      header: () => (
        <div className="flex items-center justify-center w-full gap-2">
          <CircleDollarSign className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-700">Total</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center w-full">
          <span className="font-medium text-gray-900">
            ${row.original.total.toFixed(2)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-700">Date</span>
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-gray-600">
          {format(new Date(row.original.createdAt), "MMM d, yyyy")}
        </span>
      ),
    },
  ];

  const handleDelete = (id: string) => {
    setOrderToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;

    const result = await deleteOrder(orderToDelete);
    if (result.success) {
      toast({
        title: "Order deleted",
        description: "The order has been successfully deleted.",
      });
    } else {
      toast({
        title: "Cannot delete order",
        description:
          result.error || "Failed to delete the order. Please try again.",
        variant: "destructive",
      });
    }
    setShowDeleteDialog(false);
    setOrderToDelete(null);
  };

  if (isLoading) {
    return (
      <Layout
        title="Orders"
        description="Manage customer orders and processing."
      >
        <div className="max-w-6xl mx-auto px-4">
          <Card className="shadow-lg border-0 ring-1 ring-gray-200">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                    <ShoppingCart className="h-7 w-7 text-blue-600" />
                    Order List
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-gray-600">Loading orders...</span>
                    </div>
                  </div>
                </div>

                <Button
                  disabled
                  size="lg"
                  className="gap-2 bg-white text-blue-600 border-blue-200 opacity-50 cursor-not-allowed"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Create Order
                </Button>
              </div>
            </div>

            <Separator className="bg-gray-200" />

            <div className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-lg animate-pulse"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                    <div className="w-24 h-8 bg-gray-200 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        title="Orders"
        description="Manage customer orders and processing."
      >
        <div className="max-w-6xl mx-auto px-4">
          <Card className="shadow-lg border-0 ring-1 ring-gray-200">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                    <ShoppingCart className="h-7 w-7 text-blue-600" />
                    Order List
                  </h2>
                  <p className="text-gray-600">Error loading orders</p>
                </div>

                <Button
                  onClick={() => navigate("/orders/new")}
                  size="lg"
                  className="gap-2 bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Create Order
                </Button>
              </div>
            </div>

            <Separator className="bg-gray-200" />

            <div className="p-6">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-800">
                  There was a problem loading the order list. Please try
                  refreshing the page.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Orders" description="Manage customer orders and processing.">
      <div className="max-w-6xl mx-auto px-4">
        <Card className="shadow-lg border-0 ring-1 ring-gray-200">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                  <ShoppingCart className="h-7 w-7 text-blue-600" />
                  Order List
                </h2>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="rounded-lg bg-white text-blue-600 border-blue-100 shadow-sm"
                  >
                    {orders.length} orders total
                  </Badge>
                </div>
              </div>

              <Button
                onClick={() => navigate("/orders/new")}
                size="lg"
                className="gap-2 bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <ShoppingCart className="h-5 w-5" />
                Create Order
              </Button>
            </div>
          </div>

          <Separator className="bg-gray-200" />

          <div className="p-6">
            <DataTable
              columns={columns}
              data={orders}
              searchKeys={["id", "customerName"]}
              basePath="/orders"
              onDelete={handleDelete}
            />
          </div>
        </Card>

        <ConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setOrderToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Order"
          description="Are you sure you want to delete this order? This action cannot be undone."
          confirmText="Delete"
          variant="destructive"
        />
      </div>
    </Layout>
  );
};

export default OrderList;
