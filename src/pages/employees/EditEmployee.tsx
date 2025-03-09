import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useConfirmation } from "@/hooks/useConfirmation";
import { fetchEmployeeById, updateEmployee } from "@/lib/supabase";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { format, parseISO, startOfDay } from "date-fns";
import { Employee } from "@/lib/types";

interface FormData {
  name: string;
  email: string;
  position: string;
  department: string;
  hireDate: string;
}

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    position: "",
    department: "",
    hireDate: "",
  });

  // Fetch employee data
  const { data: employee } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => fetchEmployeeById(id!),
    enabled: !!id,
  });

  // Update form data when employee data is available
  useEffect(() => {
    if (employee) {
      // Format the Date object to YYYY-MM-DD for the input
      const hireDateFormatted = format(employee.hireDate, "yyyy-MM-dd");

      setFormData({
        name: employee.name,
        email: employee.email,
        position: employee.position,
        department: employee.department,
        hireDate: hireDateFormatted,
      });
    }
  }, [employee]);

  // Update mutation
  const mutation = useMutation({
    mutationFn: (data: FormData & { id: string }) => {
      // Create a UTC date at midnight for the selected date
      const date = new Date(data.hireDate);
      const utcDate = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
      );

      return updateEmployee(data.id, {
        ...data,
        hireDate: utcDate,
      });
    },
    onSuccess: () => {
      navigate("/employees");
    },
  });

  // Save confirmation dialog
  const saveConfirmation = useConfirmation({
    title: "Save Changes",
    description:
      "Are you sure you want to save these changes to the employee information?",
    confirmText: "Save Changes",
    onConfirm: async () => {
      if (id) {
        await mutation.mutateAsync({
          id,
          ...formData,
        });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveConfirmation.open();
  };

  if (!employee) {
    return <div>Loading...</div>;
  }

  return (
    <Layout title="Edit Employee" description="Update employee information">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Edit Employee</h1>
          <Button variant="outline" onClick={() => navigate("/employees")}>
            Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) =>
                setFormData({ ...formData, position: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hireDate">Hire Date</Label>
            <Input
              id="hireDate"
              type="date"
              value={formData.hireDate}
              onChange={(e) =>
                setFormData({ ...formData, hireDate: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>

        <ConfirmationDialog {...saveConfirmation.dialogProps} />
      </Card>
    </Layout>
  );
}
