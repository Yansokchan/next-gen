import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useConfirmation } from "@/hooks/useConfirmation";
import { fetchProductById, updateProduct } from "@/lib/supabase";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Package, DollarSign, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Omit<Product, "id">>({
    name: "",
    price: 0,
    description: "",
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

  // Fetch product data
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProductById(id!),
    enabled: !!id,
    onSuccess: (data) => {
      if (data) {
        setFormData({
          name: data.name,
          price: data.price,
          description: data.description,
        });
      }
    },
  });

  // Update mutation
  const mutation = useMutation({
    mutationFn: (data: Product) => updateProduct(data.id, data),
    onSuccess: () => {
      toast({
        title: "Product updated",
        description: "The product has been successfully updated.",
      });
      navigate("/products");
    },
    onError: () => {
      toast({
        title: "Update failed",
        description:
          "There was a problem updating the product. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Save confirmation dialog
  const saveConfirmation = useConfirmation({
    title: "Save Changes",
    description:
      "Are you sure you want to save these changes? This action cannot be undone.",
    confirmText: "Save Changes",
    onConfirm: async () => {
      if (id) {
        setIsSubmitting(true);
        try {
          await mutation.mutateAsync({
            id,
            ...formData,
          });
        } finally {
          setIsSubmitting(false);
        }
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveConfirmation.open();
  };

  if (isLoading) {
    return (
      <Layout title="Loading..." description="Fetching product information...">
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

  if (!product) {
    return (
      <Layout title="Error" description="Product not found">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p>Failed to load product details</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Edit Product" description="Update product information">
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
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Edit Product
              </span>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
              variants={containerVariants}
            >
              <motion.div
                className="space-y-3"
                variants={inputVariants}
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
              >
                <Label htmlFor="name" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Product Name
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
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                  />
                </motion.div>
              </motion.div>

              <motion.div
                className="space-y-3"
                variants={inputVariants}
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
              >
                <Label htmlFor="price" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Price
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
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value),
                      })
                    }
                    required
                    className="h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                  />
                </motion.div>
              </motion.div>

              <motion.div
                className="space-y-3 md:col-span-2"
                variants={inputVariants}
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
              >
                <Label
                  htmlFor="description"
                  className="text-gray-700 font-medium"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Description
                    </span>
                  </div>
                </Label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="blur"
                  className="transform-gpu"
                >
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    className="focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm min-h-[120px] resize-none"
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
                onClick={() => navigate("/products")}
                className="min-w-[100px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 min-w-[150px]"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </motion.div>
          </form>
        </Card>
      </motion.div>
      <ConfirmationDialog {...saveConfirmation.dialogProps} />
    </Layout>
  );
}
