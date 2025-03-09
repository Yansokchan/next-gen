import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { FormLayout } from "@/components/ui/form-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Customer } from "@/lib/types";
import { customers } from "@/lib/data";
import { createCustomer } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

const CustomerNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<Customer>>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Try to create customer via Supabase
      const newCustomer = await createCustomer(
        formData as Omit<Customer, "id" | "createdAt">
      );

      if (newCustomer) {
        toast({
          title: "Customer created",
          description: "The customer has been successfully created.",
        });

        navigate("/customers");
        return;
      }

      // Fallback to local data if Supabase fails
      const fallbackCustomer: Customer = {
        ...(formData as any),
        id: uuidv4(),
        createdAt: new Date(),
      };

      // Add to customers array
      customers.unshift(fallbackCustomer);

      toast({
        title: "Customer created",
        description: "The customer has been successfully created (local only).",
      });

      navigate("/customers");
    } catch (error) {
      console.error("Error creating customer:", error);
      toast({
        title: "Error",
        description: "There was a problem creating the customer.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout title="New Customer" description="Create a new customer record.">
      <FormLayout
        title="Customer Information"
        description="Add a new customer to your database."
        onSubmit={handleSubmit}
        backPath="/customers"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="John Smith"
              value={formData.name}
              onChange={handleChange}
              required
              className="focus-ring"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="focus-ring"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={handleChange}
              required
              className="focus-ring"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              placeholder="123 Main St, City, Country"
              value={formData.address}
              onChange={handleChange}
              required
              className="focus-ring"
            />
          </div>
        </div>
      </FormLayout>
    </Layout>
  );
};

export default CustomerNew;
