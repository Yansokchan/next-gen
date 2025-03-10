import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Trash,
  User,
  Package,
  Calendar,
  DollarSign,
  ShoppingCart,
  Mail,
  Building2,
  FileText,
  Phone,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchOrderById,
  fetchCustomerById,
  fetchEmployeeById,
  deleteOrder,
} from "@/lib/supabase";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const OrderView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: order,
    isLoading: isLoadingOrder,
    error: orderError,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrderById(id || ""),
    enabled: !!id,
  });

  const { data: customer, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ["customer", order?.customerId],
    queryFn: () => fetchCustomerById(order?.customerId || ""),
    enabled: !!order?.customerId,
  });

  const { data: employee, isLoading: isLoadingEmployee } = useQuery({
    queryKey: ["employee", order?.employeeId],
    queryFn: () => fetchEmployeeById(order?.employeeId || ""),
    enabled: !!order?.employeeId,
  });

  const handleDelete = async () => {
    if (!id) return;

    const result = await deleteOrder(id);

    if (result.success) {
      toast({
        title: "Order deleted",
        description: "The order has been successfully deleted.",
      });

      // Invalidate orders query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      navigate("/orders");
    } else {
      toast({
        title: "Cannot delete order",
        description:
          result.error || "Failed to delete the order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-yellow-100 hover:bg-yellow-100/80 text-yellow-800",
      processing: "bg-blue-100 hover:bg-blue-100/80 text-blue-800",
      completed: "bg-emerald-100 hover:bg-emerald-100/80 text-emerald-800",
      cancelled: "bg-red-100 hover:bg-red-100/80 text-red-800",
    };

    return (
      <Badge
        variant="secondary"
        className={`gap-2 py-1.5 px-3 text-base ${variants[status]}`}
      >
        <span className="h-2 w-2 rounded-full bg-current" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoadingOrder || !order) {
    return (
      <Layout title="Order Details" description="Loading order information...">
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => navigate("/orders")}
              className="gap-2 text-base"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Orders
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[200px]" />
          </div>

          <Skeleton className="h-[300px]" />
        </div>
      </Layout>
    );
  }

  if (orderError) {
    return (
      <Layout
        title="Order Not Found"
        description="The requested order could not be found."
      >
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => navigate("/orders")}
              className="gap-2 text-base"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Orders
            </Button>
          </div>

          <Card className="border-destructive/50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Package className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-red-600">
                  Order Not Found
                </h3>
                <p className="text-muted-foreground text-center max-w-md">
                  The order you're looking for doesn't exist or you don't have
                  permission to view it.
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate("/orders")}
                  className="mt-2"
                >
                  View All Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={`Order #${order.id.slice(0, 8).toUpperCase()}`}
      description={`Created on ${format(new Date(order.createdAt), "PPP")}`}
    >
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => navigate("/orders")}
            className="gap-2 text-base"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Orders
          </Button>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/orders/${order.id}/edit`)}
              className="gap-2 text-base hover:bg-blue-50"
            >
              <Edit className="h-5 w-5 text-blue-600" />
              <span className="text-blue-600">Edit Order</span>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 text-base hover:bg-red-50 border-red-200"
                >
                  <Trash className="h-5 w-5 text-red-600" />
                  <span className="text-red-600">Delete Order</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Order</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the order and remove all associated data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-lg border-0 ring-1 ring-gray-200">
            <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Order Details
                </CardTitle>
              </div>
            </CardHeader>
            <Separator className="bg-gray-200" />
            <CardContent className="pt-6">
              <dl className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Order ID
                    </dt>
                    <dd className="text-base font-medium text-gray-900">
                      {order.id.toUpperCase().substring(0, 8)}
                    </dd>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date</dt>
                    <dd className="text-base font-medium text-gray-900">
                      {format(new Date(order.createdAt), "PPP")}
                    </dd>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total</dt>
                    <dd className="text-xl font-bold text-gray-900">
                      ${order.total.toFixed(2)}
                    </dd>
                  </div>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 ring-1 ring-gray-200">
            <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Customer Details
                </CardTitle>
              </div>
            </CardHeader>
            <Separator className="bg-gray-200" />
            <CardContent className="pt-6">
              {isLoadingCustomer ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-3/4" />
                  <Skeleton className="h-12 w-1/2" />
                </div>
              ) : customer ? (
                <dl className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Name
                      </dt>
                      <dd className="text-base font-medium text-gray-900">
                        {customer.name}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Email
                      </dt>
                      <dd className="text-base font-medium text-gray-900">
                        {customer.email}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Phone className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Phone
                      </dt>
                      <dd className="text-base font-medium text-gray-900">
                        {customer.phone}
                      </dd>
                    </div>
                  </div>
                </dl>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    Customer information not available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 ring-1 ring-gray-200">
            <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Processed By
                </CardTitle>
              </div>
            </CardHeader>
            <Separator className="bg-gray-200" />
            <CardContent className="pt-6">
              {isLoadingEmployee ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-3/4" />
                  <Skeleton className="h-12 w-1/2" />
                </div>
              ) : employee ? (
                <dl className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Name
                      </dt>
                      <dd className="text-base font-medium text-gray-900">
                        {employee.name}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Department
                      </dt>
                      <dd className="text-base font-medium text-gray-900">
                        {employee.department}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Email
                      </dt>
                      <dd className="text-base font-medium text-gray-900">
                        {employee.email}
                      </dd>
                    </div>
                  </div>
                </dl>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    Employee information not available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg border-0 ring-1 ring-gray-200">
          <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900">
                Order Items
              </CardTitle>
            </div>
          </CardHeader>
          <Separator className="bg-gray-200" />
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left pb-4 font-medium text-gray-500">
                      Product
                    </th>
                    <th className="text-right pb-4 font-medium text-gray-500">
                      Price
                    </th>
                    <th className="text-right pb-4 font-medium text-gray-500">
                      Quantity
                    </th>
                    <th className="text-right pb-4 font-medium text-gray-500">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(order.items || []).map((item) => (
                    <tr key={item.id} className="group hover:bg-gray-50/50">
                      <td className="py-4">
                        <div className="font-medium text-gray-900">
                          {item.productName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {item.productId.substring(0, 8).toUpperCase()}
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        <div className="font-medium text-gray-900">
                          ${item.price.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">per unit</div>
                      </td>
                      <td className="py-4 text-right">
                        <div className="font-medium text-gray-900">
                          {item.quantity}
                        </div>
                        <div className="text-sm text-gray-500">units</div>
                      </td>
                      <td className="py-4 text-right font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200">
                    <td
                      colSpan={3}
                      className="py-4 text-right font-medium text-gray-500"
                    >
                      Subtotal
                    </td>
                    <td className="py-4 text-right text-gray-900 font-medium">
                      ${order.total.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={3}
                      className="py-4 text-right font-medium text-gray-900"
                    >
                      Total
                    </td>
                    <td className="py-4 text-right text-lg font-bold text-gray-900">
                      ${order.total.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default OrderView;
