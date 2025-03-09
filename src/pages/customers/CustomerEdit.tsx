
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { FormLayout } from "@/components/ui/form-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Customer } from "@/lib/types";
import { fetchCustomerById, updateCustomer } from "@/lib/supabase";

const CustomerEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: customer, isLoading, error } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      try {
        if (!id) return null;
        return await fetchCustomerById(id);
      } catch (err) {
        console.error("Error fetching customer:", err);
        return null;
      }
    },
    enabled: !!id
  });
  
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      });
    } else if (error || (!isLoading && !customer)) {
      navigate("/customers");
      toast({
        title: "Customer not found",
        description: "The requested customer could not be found.",
        variant: "destructive",
      });
    }
  }, [customer, error, isLoading, navigate, toast]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const updatedCustomer = await updateCustomer(id, formData);
      
      if (updatedCustomer) {
        toast({
          title: "Customer updated",
          description: "The customer has been successfully updated.",
        });
        
        navigate(`/customers/${id}`);
      } else {
        throw new Error("Failed to update customer");
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating the customer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <Layout title="Loading..." description="Fetching customer information...">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout 
      title="Edit Customer" 
      description="Update customer information."
    >
      <FormLayout
        title="Customer Information"
        description="Update customer details and preferences."
        onSubmit={handleSubmit}
        backPath={`/customers/${id}`}
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

export default CustomerEdit;
