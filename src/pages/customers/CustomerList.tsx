import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  Users2,
  Mail,
  Phone,
  Calendar,
  Loader2,
  Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fetchCustomers, deleteCustomer } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const CustomerList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  const {
    data: customers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });

  const columns = [
    {
      accessorKey: "name",
      header: () => (
        <div className="flex items-center gap-2">
          <Users2 className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-700">Name</span>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "email",
      header: () => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-700">Email</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-gray-600">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: () => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-700">Phone</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-gray-600">{row.original.phone}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-700">Created</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-gray-600">
            {format(new Date(row.original.createdAt), "MMM d, yyyy")}
          </span>
        </div>
      ),
    },
  ];

  const handleDelete = (id: string) => {
    setCustomerToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    const result = await deleteCustomer(customerToDelete);
    if (result) {
      toast({
        title: "Customer deleted",
        description: "The customer has been successfully deleted.",
      });
    } else {
      toast({
        title: "Cannot delete customer",
        description: "Failed to delete the customer. Please try again.",
        variant: "destructive",
      });
    }
    setShowDeleteDialog(false);
    setCustomerToDelete(null);
  };

  if (isLoading) {
    return (
      <Layout
        title="Customers"
        description="Manage our customer information and details."
      >
        <div className="max-w-6xl mx-auto px-4">
          <Card className="shadow-lg border-0 ring-1 ring-gray-200">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                    <Users2 className="h-7 w-7 text-blue-600" />
                    Customer List
                  </h2>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-gray-600">Loading customers...</span>
                  </div>
                </div>

                <Button
                  onClick={() => navigate("/customers/new")}
                  size="lg"
                  className="gap-2 bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <UserPlus className="h-5 w-5" />
                  Add Customer
                </Button>
              </div>
            </div>

            <Separator className="bg-gray-200" />

            <div className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
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
        title="Customers"
        description="Manage our customer information and details."
      >
        <div className="max-w-6xl mx-auto px-4">
          <Card className="shadow-lg border-0 ring-1 ring-gray-200">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                    <Users2 className="h-7 w-7 text-blue-600" />
                    Customer List
                  </h2>
                  <p className="text-red-600">Error loading customers</p>
                </div>

                <Button
                  onClick={() => navigate("/customers/new")}
                  size="lg"
                  className="gap-2 bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <UserPlus className="h-5 w-5" />
                  Add Customer
                </Button>
              </div>
            </div>

            <Separator className="bg-gray-200" />

            <div className="p-6">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-600">
                  There was a problem loading the customer list. Please try
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
    <Layout
      title="Customers"
      description="Manage our customer information and details."
    >
      <div className="max-w-6xl mx-auto px-4">
        <Card className="shadow-lg border-0 ring-1 ring-gray-200">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                  <Users2 className="h-7 w-7 text-blue-600" />
                  Customer List
                </h2>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="rounded-lg bg-white text-blue-600 border-blue-100 shadow-sm"
                  >
                    {customers.length} customers total
                  </Badge>
                </div>
              </div>

              <Button
                onClick={() => navigate("/customers/new")}
                size="lg"
                className="gap-2 bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <UserPlus className="h-5 w-5" />
                Add Customer
              </Button>
            </div>
          </div>

          <Separator className="bg-gray-200" />

          <div className="p-6">
            <DataTable
              data={customers}
              columns={columns}
              getRowId={(row) => row.id}
              onDelete={handleDelete}
              searchable
              searchKeys={["name", "email", "phone"]}
              basePath="/customers"
            />
          </div>
        </Card>

        <ConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setCustomerToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Customer"
          description="Are you sure you want to delete this customer? This action cannot be undone."
          confirmText="Delete"
          variant="destructive"
        />
      </div>
    </Layout>
  );
};

export default CustomerList;
