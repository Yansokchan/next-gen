import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Customer } from "@/lib/types";
import { fetchCustomerById, updateCustomer } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Home, UserCircle, ArrowLeft } from "lucide-react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useConfirmation } from "@/hooks/useConfirmation";

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

  const {
    data: customer,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      try {
        if (!id) return null;
        return await fetchCustomerById(id);
      } catch (err) {
        console.error("Error fetching customer:", err);
        return null;
      }
    },
    enabled: !!id,
  });

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
    focus: {
      scale: 1.02,
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 },
    },
    blur: {
      scale: 1,
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.2 },
    },
    hover: {
      y: -2,
      transition: { duration: 0.2 },
    },
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    hover: {
      y: -4,
      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
      transition: { duration: 0.2 },
    },
  };

  const updateConfirmation = useConfirmation({
    title: "Update Customer",
    description: "Are you sure you want to update this customer's information?",
    confirmText: "Update Customer",
    onConfirm: async () => {
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
          description:
            "There was a problem updating the customer. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfirmation.open();
  };

  if (isLoading) {
    return (
      <Layout title="Loading..." description="Fetching customer information...">
        <motion.div
          className="max-w-4xl mx-auto px-4 sm:px-16"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-white to-blue-50/30 backdrop-blur-xl ring-1 ring-gray-200/50 overflow-hidden p-6 sm:p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </Card>
        </motion.div>
      </Layout>
    );
  }

  return (
    <Layout title="Edit Customer" description="Update customer information.">
      <motion.div
        className="max-w-4xl mx-auto px-4 sm:px-16"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-white to-blue-50/30 backdrop-blur-xl ring-1 ring-gray-200/50 overflow-hidden p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <motion.div
              className="flex items-center gap-3 mb-6"
              variants={fieldVariants}
            >
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 animate-pulse">
                <UserCircle className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Edit Customer
              </span>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
              variants={containerVariants}
            >
              <motion.div className="space-y-3" variants={inputVariants}>
                <Label htmlFor="name" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Full Name
                    </span>
                  </div>
                </Label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="blur"
                  className="transform-gpu"
                >
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Smith"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                  />
                </motion.div>
              </motion.div>

              <motion.div className="space-y-3" variants={inputVariants}>
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Email Address
                    </span>
                  </div>
                </Label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="blur"
                  className="transform-gpu"
                >
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                  />
                </motion.div>
              </motion.div>

              <motion.div className="space-y-3" variants={inputVariants}>
                <Label htmlFor="phone" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <Phone className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Phone Number
                    </span>
                  </div>
                </Label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="blur"
                  className="transform-gpu"
                >
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                  />
                </motion.div>
              </motion.div>

              <motion.div
                className="space-y-3 md:col-span-2"
                variants={inputVariants}
              >
                <Label htmlFor="address" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <Home className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Address
                    </span>
                  </div>
                </Label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="blur"
                  className="transform-gpu"
                >
                  <Input
                    id="address"
                    name="address"
                    placeholder="123 Main St, City, Country"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                  />
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              className="flex justify-end gap-4 pt-6 border-t border-gray-100"
              variants={fieldVariants}
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/customers")}
                className="min-w-[100px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 min-w-[150px]"
              >
                {isSubmitting ? "Updating..." : "Update Customer"}
              </Button>
            </motion.div>
          </form>
        </Card>
      </motion.div>
      <ConfirmationDialog {...updateConfirmation.dialogProps} />
    </Layout>
  );
};

export default CustomerEdit;
