import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  Edit,
  Trash,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Briefcase,
  Building2,
  Calendar,
  User,
  AlertCircle,
  Loader2,
  CircleDot,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchEmployeeById,
  getEmployeeSalesMetrics,
  updateEmployee,
} from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useConfirmation } from "@/hooks/useConfirmation";

const EmployeeView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: employee, isLoading: isLoadingEmployee } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => fetchEmployeeById(id || ""),
    enabled: !!id,
  });

  const { data: salesMetrics, isLoading: isLoadingSales } = useQuery({
    queryKey: ["employee-sales", id],
    queryFn: () => getEmployeeSalesMetrics(id || ""),
    enabled: !!id,
  });

  const queryClient = useQueryClient();

  const toggleStatus = useMutation({
    mutationFn: async () => {
      if (!employee || !id) return null;
      const newStatus = employee.status === "active" ? "inactive" : "active";
      return await updateEmployee(id, { status: newStatus });
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["employee", id] });
      await queryClient.cancelQueries({ queryKey: ["employees"] });

      // Snapshot the previous value
      const previousEmployee = queryClient.getQueryData(["employee", id]);

      // Optimistically update to the new value
      if (employee) {
        const optimisticEmployee = {
          ...employee,
          status: employee.status === "active" ? "inactive" : "active",
        };

        // Update both queries optimistically
        queryClient.setQueryData(["employee", id], optimisticEmployee);
        queryClient.setQueryData(["employees"], (old: any) => {
          if (!old) return old;
          return old.map((emp: any) =>
            emp.id === id ? optimisticEmployee : emp
          );
        });
      }

      // Return a context object with the snapshotted value
      return { previousEmployee };
    },
    onError: (err, newEmployee, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousEmployee) {
        queryClient.setQueryData(["employee", id], context.previousEmployee);
        queryClient.setQueryData(["employees"], (old: any) => {
          if (!old) return old;
          return old.map((emp: any) =>
            emp.id === id ? context.previousEmployee : emp
          );
        });
      }

      toast({
        title: "Update failed",
        description: "Failed to update employee status. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      if (data) {
        toast({
          title: "Status updated",
          description: `Employee is now ${data.status}.`,
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ["employee", id] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  const statusConfirmation = useConfirmation({
    title:
      employee?.status === "active"
        ? "Set Employee as Inactive"
        : "Set Employee as Active",
    description:
      employee?.status === "active"
        ? "Are you sure you want to set this employee as inactive? This will prevent them from being assigned to new tasks."
        : "Are you sure you want to set this employee as active? This will allow them to be assigned to new tasks.",
    confirmText:
      employee?.status === "active" ? "Set as Inactive" : "Set as Active",
    onConfirm: () => toggleStatus.mutate(),
    variant: employee?.status === "active" ? "destructive" : "default",
  });

  if (isLoadingEmployee) {
    return (
      <Layout title="Employee Details">
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
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!employee) {
    return (
      <Layout title="Employee Not Found">
        <div className="space-y-6">
          <Button
            variant="outline"
            onClick={() => navigate("/employees")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Employees
          </Button>

          <Card className="border-destructive/50">
            <CardContent className="pt-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <h3 className="text-lg font-semibold">Employee Not Found</h3>
                <p className="text-muted-foreground">
                  The requested employee could not be found.
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
      title="Employee Details"
      description="View detailed employee information."
    >
      <div className="space-y-8 max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => navigate("/employees")}
            className="gap-2 text-base"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Employees
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/employees/${id}/edit`)}
              className="gap-2 text-base hover:bg-blue-50"
            >
              <Edit className="h-5 w-5 text-blue-600" />
              <span className="text-blue-600">Edit</span>
            </Button>
            <Button
              variant={employee.status === "active" ? "destructive" : "default"}
              onClick={() => statusConfirmation.open()}
              className="gap-2 text-base"
              disabled={toggleStatus.isPending}
            >
              <CircleDot className="h-5 w-5" />
              {toggleStatus.isPending
                ? "Updating..."
                : employee.status === "active"
                ? "Set as Inactive"
                : "Set as Active"}
            </Button>
          </div>
        </div>

        {/* Employee Details Card */}
        <Card className="shadow-lg border-0 ring-1 ring-gray-200">
          <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white rounded-full shadow-sm">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-3xl font-bold text-gray-900">
                      {employee.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="h-4 w-4" />
                      <CardDescription className="text-base flex items-center gap-2">
                        {employee.position}
                        <span>•</span>
                        <span className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {employee.department}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <Badge
                  variant={
                    employee.status === "active" ? "default" : "secondary"
                  }
                  className={`mt-2 ${
                    employee.status === "active"
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <CircleDot
                    className={`h-3 w-3 mr-1 ${
                      employee.status === "active"
                        ? "text-green-500"
                        : "text-gray-500"
                    }`}
                  />
                  {employee.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
              <Badge
                variant="secondary"
                className="gap-2 py-2 px-4 text-base bg-white shadow-sm"
              >
                <Calendar className="h-5 w-5 text-blue-600" />
                {(() => {
                  try {
                    const date = new Date(employee.hireDate);
                    return isNaN(date.getTime())
                      ? "Invalid Date"
                      : format(date, "MMM d, yyyy");
                  } catch (error) {
                    return "Invalid Date";
                  }
                })()}
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
                      {employee.email}
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
                      {employee.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Salary
                    </p>
                    <p className="text-lg font-medium text-gray-900">
                      ${employee.salary.toLocaleString()}
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
                      {employee.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Employee ID
                    </p>
                    <p className="text-base font-mono text-gray-600">
                      {employee.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales Performance Card */}
        <Card className="shadow-lg border-0 ring-1 ring-gray-200">
          <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Sales Performance
              </CardTitle>
            </div>
          </CardHeader>

          <Separator className="bg-gray-200" />

          <CardContent className="pt-8 pb-8 px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <ShoppingCart className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-400 mb-1">
                    Orders Processed
                  </p>
                  {isLoadingSales ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                      <span className="text-base">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-3xl font-bold text-purple-500">
                      {salesMetrics?.count || 0}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-400 mb-1">
                    Total Sales Amount
                  </p>
                  {isLoadingSales ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-green-500" />
                      <span className="text-base">Loading...</span>
                    </div>
                  ) : (
                    <p className="text-3xl font-bold text-green-500">
                      ${(salesMetrics?.amount || 0).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <ConfirmationDialog {...statusConfirmation.dialogProps} />
    </Layout>
  );
};

export default EmployeeView;
