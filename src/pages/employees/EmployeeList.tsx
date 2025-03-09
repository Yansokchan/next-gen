import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { DataTable, Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  Users2,
  Briefcase,
  Building2,
  Calendar,
  Loader2,
  Search,
} from "lucide-react";
import { fetchEmployees, deleteEmployee } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { Employee } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const EmployeeList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [employeeList, setEmployeeList] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const employees = await fetchEmployees();
        setEmployeeList(employees);
      } catch (error) {
        console.error("Error loading employees:", error);
        toast({
          title: "Error",
          description: "Failed to load employees. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadEmployees();
  }, [toast]);

  const columns: Column<Employee>[] = [
    {
      header: () => (
        <div className="flex items-center gap-2">
          <Users2 className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-700">Name</span>
        </div>
      ),
      accessorKey: "name",
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">{row.original.name}</span>
      ),
    },
    {
      header: () => (
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-700">Position</span>
        </div>
      ),
      accessorKey: "position",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-gray-600">{row.original.position}</span>
        </div>
      ),
    },
    {
      header: () => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-700">Department</span>
        </div>
      ),
      accessorKey: "department",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-gray-600">{row.original.department}</span>
        </div>
      ),
    },
    {
      header: () => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-700">Hire Date</span>
        </div>
      ),
      accessorKey: "hireDate",
      cell: ({ row }) => {
        try {
          return (
            <div className="flex items-center gap-2">
              <span className="text-gray-600">
                {format(new Date(row.original.hireDate), "MMM d, yyyy")}
              </span>
            </div>
          );
        } catch (error) {
          console.error("Error formatting date:", error);
          return "Invalid Date";
        }
      },
    },
  ];

  const handleDelete = (id: string) => {
    setEmployeeToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;

    const result = await deleteEmployee(employeeToDelete);
    if (result) {
      toast({
        title: "Employee deleted",
        description: "The employee has been successfully deleted.",
      });
    } else {
      toast({
        title: "Cannot delete employee",
        description: "Failed to delete the employee. Please try again.",
        variant: "destructive",
      });
    }
    setShowDeleteDialog(false);
    setEmployeeToDelete(null);
  };

  return (
    <Layout
      title="Employees"
      description="Manage your employee information and records."
    >
      <div className="max-w-6xl mx-auto px-4">
        <Card className="shadow-lg border-0 ring-1 ring-gray-200">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                  <Users2 className="h-7 w-7 text-blue-600" />
                  Employee List
                </h2>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-gray-600">Loading employees...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="rounded-lg bg-white text-blue-600 border-blue-100 shadow-sm"
                    >
                      {employeeList.length} employees total
                    </Badge>
                  </div>
                )}
              </div>

              <Button
                onClick={() => navigate("/employees/new")}
                size="lg"
                className="gap-2 bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <UserPlus className="h-5 w-5" />
                Add Employee
              </Button>
            </div>
          </div>

          <Separator className="bg-gray-200" />

          <div className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <DataTable
                data={employeeList}
                columns={columns}
                getRowId={(row) => row.id}
                onDelete={handleDelete}
                searchable
                searchKeys={["name", "position", "department"]}
                basePath="/employees"
              />
            )}
          </div>
        </Card>

        <ConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setEmployeeToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Employee"
          description="Are you sure you want to delete this employee? This action cannot be undone."
          confirmText="Delete"
          variant="destructive"
        />
      </div>
    </Layout>
  );
};

export default EmployeeList;
