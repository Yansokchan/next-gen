import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { FormLayout } from "@/components/ui/form-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Product,
  PRODUCT_CATEGORIES,
  IPHONE_COLORS,
  IPHONE_STORAGE,
  CHARGER_WATTAGE,
  CABLE_TYPES,
  CABLE_LENGTHS,
  iPhoneProduct,
  ChargerProduct,
  CableProduct,
  AirPodProduct,
} from "@/lib/types";
import { products } from "@/lib/data";
import { Card } from "@/components/ui/card";
import {
  Package,
  Tag,
  DollarSign,
  ClipboardList,
  FileText,
  LayoutGrid,
  CircleDot,
  Smartphone,
  BatteryCharging,
  Cable as CableIcon,
  Headphones,
  Layers,
  CheckCircle,
} from "lucide-react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useConfirmation } from "@/hooks/useConfirmation";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type ProductFormData = {
  name: string;
  description: string;
  price: number;
  category: "iPhone" | "Charger" | "Cable" | "AirPod";
  stock: number;
  status: "available" | "unavailable";
  // iPhone specific
  color?: string;
  storage?: string;
  // Charger specific
  wattage?: string;
  isFastCharging?: boolean;
  // Cable specific
  type?: string;
  length?: string;
};

const ProductNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    category: "iPhone",
    stock: 0,
    status: "available",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    // Handle different input types
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked as any, // Using any here since we know isFastCharging is boolean
      }));
      return;
    }

    if (name === "price" || name === "stock") {
      setFormData((prev) => ({
        ...prev,
        [name]: Number(value),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveProduct = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Create new product with category-specific fields
      let newProduct: Product;

      switch (formData.category) {
        case "iPhone":
          newProduct = {
            ...(formData as Omit<iPhoneProduct, "id" | "createdAt">),
            id: uuidv4(),
            createdAt: new Date(),
            color: formData.color || IPHONE_COLORS[0],
            storage: formData.storage || IPHONE_STORAGE[0],
          } as iPhoneProduct;
          break;
        case "Charger":
          newProduct = {
            ...(formData as Omit<ChargerProduct, "id" | "createdAt">),
            id: uuidv4(),
            createdAt: new Date(),
            wattage: formData.wattage || CHARGER_WATTAGE[0],
            isFastCharging: formData.isFastCharging || false,
          } as ChargerProduct;
          break;
        case "Cable":
          newProduct = {
            ...(formData as Omit<CableProduct, "id" | "createdAt">),
            id: uuidv4(),
            createdAt: new Date(),
            type: formData.type || CABLE_TYPES[0],
            length: formData.length || CABLE_LENGTHS[0],
          } as CableProduct;
          break;
        case "AirPod":
          newProduct = {
            ...(formData as Omit<AirPodProduct, "id" | "createdAt">),
            id: uuidv4(),
            createdAt: new Date(),
          } as AirPodProduct;
          break;
        default:
          throw new Error("Invalid product category");
      }

      // Add to products array (in a real app, this would be an API call)
      products.unshift(newProduct);

      toast({
        title: "Product created",
        description: "The product has been successfully created.",
      });

      navigate("/products");
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: "There was a problem creating the product.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveConfirmation = useConfirmation({
    title: "Create New Product",
    description: "Are you sure you want to create this product?",
    confirmText: "Create Product",
    onConfirm: saveProduct,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveConfirmation.open();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "iPhone":
        return <Smartphone className="h-4 w-4 text-blue-600" />;
      case "Charger":
        return <BatteryCharging className="h-4 w-4 text-blue-600" />;
      case "Cable":
        return <CableIcon className="h-4 w-4 text-blue-600" />;
      case "AirPod":
        return <Headphones className="h-4 w-4 text-blue-600" />;
      default:
        return <Package className="h-4 w-4 text-blue-600" />;
    }
  };

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

  return (
    <Layout
      title="New Product"
      description="Create a new product in your catalog."
    >
      <motion.div
        className="max-w-4xl mx-auto px-4 sm:px-16"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white via-white to-blue-50/30 backdrop-blur-xl ring-1 ring-gray-200/50 overflow-hidden">
          <FormLayout
            title={
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 animate-pulse">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  New Product
                </span>
              </div>
            }
            description="Add a new product to your catalog."
            onSubmit={handleSubmit}
            onCancel={() => navigate("/products")}
            className="p-6 sm:p-8"
            submitText={isSubmitting ? "Creating..." : "Create Product"}
            cancelText="Cancel"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div className="space-y-3" whileTap={{ scale: 0.995 }}>
                <Label htmlFor="name" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <Tag className="h-4 w-4 text-blue-600" />
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
                >
                  <Input
                    id="name"
                    name="name"
                    placeholder="Premium Product"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                  />
                </motion.div>
              </motion.div>

              <motion.div className="space-y-3" whileTap={{ scale: 0.995 }}>
                <Label htmlFor="category" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <Layers className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Category
                    </span>
                  </div>
                </Label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="blur"
                >
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleSelectChange("category", value)
                    }
                  >
                    <SelectTrigger className="h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(cat)}
                            {cat}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              </motion.div>

              <motion.div className="space-y-3" whileTap={{ scale: 0.995 }}>
                <Label htmlFor="price" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Price ($)
                    </span>
                  </div>
                </Label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="blur"
                >
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="99.99"
                    value={formData.price === 0 ? "" : formData.price}
                    onChange={handleInputChange}
                    required
                    className="h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                  />
                </motion.div>
              </motion.div>

              <motion.div className="space-y-3" whileTap={{ scale: 0.995 }}>
                <Label htmlFor="stock" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <ClipboardList className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Stock Quantity
                    </span>
                  </div>
                </Label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="blur"
                >
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    placeholder="100"
                    value={formData.stock === 0 ? "" : formData.stock}
                    onChange={handleInputChange}
                    required
                    className="h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                  />
                </motion.div>
              </motion.div>

              <motion.div className="space-y-3" whileTap={{ scale: 0.995 }}>
                <Label htmlFor="status" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Status
                    </span>
                  </div>
                </Label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="blur"
                >
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleSelectChange("status", value)
                    }
                  >
                    <SelectTrigger className="h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
              </motion.div>

              {/* Category specific fields */}
              {formData.category === "iPhone" && (
                <>
                  <motion.div className="space-y-3" whileTap={{ scale: 0.995 }}>
                    <Label
                      htmlFor="color"
                      className="text-gray-700 font-medium"
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                          <CircleDot className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          Color
                        </span>
                      </div>
                    </Label>
                    <motion.div
                      variants={inputVariants}
                      whileFocus="focus"
                      whileTap="blur"
                    >
                      <Select
                        value={formData.color}
                        onValueChange={(value) =>
                          handleSelectChange("color", value)
                        }
                      >
                        <SelectTrigger className="h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm">
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                        <SelectContent>
                          {IPHONE_COLORS.map((color) => (
                            <SelectItem key={color} value={color}>
                              {color}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  </motion.div>

                  <motion.div className="space-y-3" whileTap={{ scale: 0.995 }}>
                    <Label
                      htmlFor="storage"
                      className="text-gray-700 font-medium"
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                          <Smartphone className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          Storage
                        </span>
                      </div>
                    </Label>
                    <motion.div
                      variants={inputVariants}
                      whileFocus="focus"
                      whileTap="blur"
                    >
                      <Select
                        value={formData.storage}
                        onValueChange={(value) =>
                          handleSelectChange("storage", value)
                        }
                      >
                        <SelectTrigger className="h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm">
                          <SelectValue placeholder="Select storage" />
                        </SelectTrigger>
                        <SelectContent>
                          {IPHONE_STORAGE.map((storage) => (
                            <SelectItem key={storage} value={storage}>
                              {storage}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  </motion.div>
                </>
              )}

              {formData.category === "Charger" && (
                <>
                  <motion.div className="space-y-3" whileTap={{ scale: 0.995 }}>
                    <Label
                      htmlFor="wattage"
                      className="text-gray-700 font-medium"
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                          <BatteryCharging className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          Wattage
                        </span>
                      </div>
                    </Label>
                    <motion.div
                      variants={inputVariants}
                      whileFocus="focus"
                      whileTap="blur"
                    >
                      <Select
                        value={formData.wattage}
                        onValueChange={(value) =>
                          handleSelectChange("wattage", value)
                        }
                      >
                        <SelectTrigger className="h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm">
                          <SelectValue placeholder="Select wattage" />
                        </SelectTrigger>
                        <SelectContent>
                          {CHARGER_WATTAGE.map((wattage) => (
                            <SelectItem key={wattage} value={wattage}>
                              {wattage}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  </motion.div>
                </>
              )}

              {formData.category === "Cable" && (
                <>
                  <motion.div className="space-y-3" whileTap={{ scale: 0.995 }}>
                    <Label htmlFor="type" className="text-gray-700 font-medium">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                          <CableIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          Type
                        </span>
                      </div>
                    </Label>
                    <motion.div
                      variants={inputVariants}
                      whileFocus="focus"
                      whileTap="blur"
                    >
                      <Select
                        value={formData.type}
                        onValueChange={(value) =>
                          handleSelectChange("type", value)
                        }
                      >
                        <SelectTrigger className="h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {CABLE_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  </motion.div>

                  <motion.div className="space-y-3" whileTap={{ scale: 0.995 }}>
                    <Label
                      htmlFor="length"
                      className="text-gray-700 font-medium"
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                          <CableIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          Length
                        </span>
                      </div>
                    </Label>
                    <motion.div
                      variants={inputVariants}
                      whileFocus="focus"
                      whileTap="blur"
                    >
                      <Select
                        value={formData.length}
                        onValueChange={(value) =>
                          handleSelectChange("length", value)
                        }
                      >
                        <SelectTrigger className="h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm">
                          <SelectValue placeholder="Select length" />
                        </SelectTrigger>
                        <SelectContent>
                          {CABLE_LENGTHS.map((length) => (
                            <SelectItem key={length} value={length}>
                              {length}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  </motion.div>
                </>
              )}

              <motion.div
                className="space-y-3 md:col-span-2"
                whileTap={{ scale: 0.995 }}
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
                >
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter a detailed description of the product..."
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    className="focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm min-h-[120px] resize-none"
                  />
                </motion.div>
              </motion.div>
            </div>
          </FormLayout>
        </Card>
      </motion.div>
      <ConfirmationDialog {...saveConfirmation.dialogProps} />
    </Layout>
  );
};

export default ProductNew;
