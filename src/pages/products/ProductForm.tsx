import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Product,
  ProductCategory,
  PRODUCT_CATEGORIES,
  IPHONE_COLORS,
  IPHONE_STORAGE,
  CHARGER_WATTAGE,
  CABLE_TYPES,
  CABLE_LENGTHS,
  iPhoneColor,
  iPhoneStorage,
  ChargerWattage,
  CableType,
  CableLength,
} from "@/lib/types";
import { createProduct, updateProduct, fetchProductById } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
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

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState<ProductCategory>("iPhone");

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      try {
        if (!id) return null;
        return await fetchProductById(id);
      } catch (err) {
        console.error("Error fetching product:", err);
        return null;
      }
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (product) {
      setCategory(product.category);
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const baseProduct = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        stock: parseInt(formData.get("stock") as string),
        status: formData.get("status") as "available" | "unavailable",
        category,
      };

      let productData;
      switch (category) {
        case "iPhone":
          productData = {
            ...baseProduct,
            color: formData.get("color") as iPhoneColor,
            storage: formData.get("storage") as iPhoneStorage,
          };
          break;
        case "Charger":
          productData = {
            ...baseProduct,
            wattage: formData.get("wattage") as ChargerWattage,
            isFastCharging: formData.get("isFastCharging") === "true",
          };
          break;
        case "Cable":
          productData = {
            ...baseProduct,
            type: formData.get("type") as CableType,
            length: formData.get("length") as CableLength,
          };
          break;
        case "AirPod": {
          const airPodData = {
            ...baseProduct,
            category: "AirPod",
          };
          productData = airPodData;
          break;
        }
        default:
          throw new Error("Invalid product category");
      }

      if (id) {
        await updateProduct(id, productData);
        toast({
          title: "Product updated",
          description: "The product has been successfully updated.",
        });
        navigate(`/products/${id}`);
      } else {
        const newProduct = await createProduct(productData);
        toast({
          title: "Product created",
          description: "The product has been successfully created.",
        });
        navigate("/products");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout title="Loading..." description="Fetching product information...">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </Layout>
    );
  }

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

  return (
    <Layout
      title={id ? "Edit Product" : "New Product"}
      description={
        id
          ? "Update product information."
          : "Create a new product in your catalog."
      }
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
                  {id ? "Edit Product" : "New Product"}
                </span>
              </div>
            }
            description={
              id
                ? "Update product details and inventory."
                : "Add a new product to your inventory."
            }
            onSubmit={handleSubmit}
            backPath={id ? `/products/${id}` : "/products"}
            isSubmitting={isSubmitting}
            className="p-6 sm:p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    value={category}
                    onValueChange={(value) =>
                      setCategory(value as ProductCategory)
                    }
                    disabled={!!id}
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
                    defaultValue={product?.name}
                    placeholder="iPhone 15 Pro"
                    required
                    className="h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                  />
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
                    step="0.01"
                    min="0"
                    defaultValue={product?.price}
                    placeholder="999.99"
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
                    defaultValue={product?.stock}
                    placeholder="100"
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
                    name="status"
                    defaultValue={product?.status || "available"}
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

              {category === "iPhone" && (
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
                        name="color"
                        defaultValue={(product as any)?.color}
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
                        name="storage"
                        defaultValue={(product as any)?.storage}
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

              {category === "Charger" && (
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
                        name="wattage"
                        defaultValue={(product as any)?.wattage}
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

                  <motion.div className="space-y-3" whileTap={{ scale: 0.995 }}>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isFastCharging"
                        name="isFastCharging"
                        defaultChecked={(product as any)?.isFastCharging}
                      />
                      <Label
                        htmlFor="isFastCharging"
                        className="text-gray-700 font-medium"
                      >
                        Fast Charging
                      </Label>
                    </div>
                  </motion.div>
                </>
              )}

              {category === "Cable" && (
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
                      <Select name="type" defaultValue={(product as any)?.type}>
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
                        name="length"
                        defaultValue={(product as any)?.length}
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
                    defaultValue={product?.description}
                    placeholder="Enter a detailed description of the product..."
                    rows={4}
                    className="focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm min-h-[120px] resize-none"
                    required
                  />
                </motion.div>
              </motion.div>
            </div>
          </FormLayout>
        </Card>
      </motion.div>
    </Layout>
  );
}
