import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import {
  Edit,
  ArrowLeft,
  ShoppingCart,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchCustomerById, getCustomerPurchaseCount } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { getCustomerById } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const CustomerView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: customer, isLoading: isLoadingCustomer } = useQuery({
    queryKey: ["customer", id],
    queryFn: () => getCustomerById(id || ""),
    enabled: !!id,
  });

  const { data: purchaseCount, isLoading: isLoadingPurchases } = useQuery({
    queryKey: ["customer-purchases", id],
    queryFn: () => getCustomerPurchaseCount(id || ""),
    enabled: !!id,
  });

  if (isLoadingCustomer) {
    return (
      <Layout title="Customer Details">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Button variant="outline" disabled>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading...
            </Button>
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/4 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full md:col-span-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!customer) {
    return (
      <Layout title="Customer Not Found">
        <div className="space-y-6">
          <Button
            variant="outline"
            onClick={() => navigate("/customers")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Customers
          </Button>

          <Card className="border-destructive/50">
            <CardContent className="pt-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <h3 className="text-lg font-semibold">Customer Not Found</h3>
                <p className="text-muted-foreground">
                  The requested customer could not be found.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Customer Details"
      description="View detailed customer information."
    >
      <div className="space-y-8 max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => navigate("/customers")}
            className="gap-2 text-base"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Customers
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/customers/${id}/edit`)}
              className="gap-2 text-base hover:bg-blue-50"
            >
              <Edit className="h-5 w-5 text-blue-600" />
              <span className="text-blue-600">Edit</span>
            </Button>
          </div>
        </div>

        <Card className="shadow-lg border-0 ring-1 ring-gray-200">
          <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white rounded-full shadow-sm">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-gray-900">
                    {customer.name}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <CardDescription className="text-base">
                    Customer since{" "}
                    {format(new Date(customer.createdAt), "MMMM d, yyyy")}
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="gap-2 py-2 px-4 text-base bg-white shadow-sm"
              >
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                {isLoadingPurchases ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                ) : (
                  `${purchaseCount || 0} Orders`
                )}
              </Badge>
            </div>
          </CardHeader>

          <Separator className="bg-gray-200" />

          <CardContent className="pt-8 pb-8 px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Email Address
                    </p>
                    <p className="text-lg font-medium text-gray-900">
                      {customer.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Phone Number
                    </p>
                    <p className="text-lg font-medium text-gray-900">
                      {customer.phone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Address
                    </p>
                    <p className="text-lg font-medium text-gray-900">
                      {customer.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Customer ID
                    </p>
                    <p className="text-base font-mono text-gray-600">
                      {customer.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CustomerView;
