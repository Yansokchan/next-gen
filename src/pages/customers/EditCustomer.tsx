import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useConfirmation } from "@/hooks/useConfirmation";
import { fetchCustomerById, updateCustomer } from "@/lib/supabase";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function EditCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Omit<Customer, "id">>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Fetch customer data
  const { data: customer } = useQuery({
    queryKey: ["customer", id],
    queryFn: () => fetchCustomerById(id!),
    enabled: !!id,
  });

  // Update form data when customer data is available
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      });
    }
  }, [customer]);

  // Update mutation
  const mutation = useMutation({
    mutationFn: (data: Customer) => updateCustomer(data.id, data),
    onSuccess: () => {
      navigate("/customers");
    },
  });

  // Save confirmation dialog
  const saveConfirmation = useConfirmation({
    title: "Save Changes",
    description:
      "Are you sure you want to save these changes to the customer information?",
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

  if (!customer) {
    return <div>Loading...</div>;
  }

  return (
    <Layout title="Edit Customer" description="Update customer information">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Edit Customer</h1>
          <Button variant="outline" onClick={() => navigate("/customers")}>
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
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
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
