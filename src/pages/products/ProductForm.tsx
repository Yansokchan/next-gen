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

  return (
    <Layout
      title={id ? "Edit Product" : "New Product"}
      description={
        id
          ? "Update product information."
          : "Create a new product in your catalog."
      }
    >
      <FormLayout
        title="Product Information"
        description={
          id
            ? "Update product details and inventory."
            : "Add a new product to your inventory."
        }
        onSubmit={handleSubmit}
        backPath={id ? `/products/${id}` : "/products"}
        isSubmitting={isSubmitting}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as ProductCategory)}
              disabled={!!id}
            >
              <SelectTrigger className="focus-ring">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={product?.name}
              placeholder="iPhone 15 Pro"
              required
              className="focus-ring"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product?.price}
              placeholder="999.99"
              required
              className="focus-ring"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock Quantity</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              min="0"
              defaultValue={product?.stock}
              placeholder="100"
              required
              className="focus-ring"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={product?.status || "available"}>
              <SelectTrigger className="focus-ring">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={product?.description}
              placeholder="Enter a detailed description of the product..."
              rows={4}
              className="resize-none focus-ring"
              required
            />
          </div>

          {category === "iPhone" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Select name="color" defaultValue={(product as any)?.color}>
                  <SelectTrigger className="focus-ring">
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage">Storage</Label>
                <Select name="storage" defaultValue={(product as any)?.storage}>
                  <SelectTrigger className="focus-ring">
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
              </div>
            </>
          )}

          {category === "Charger" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="wattage">Wattage</Label>
                <Select name="wattage" defaultValue={(product as any)?.wattage}>
                  <SelectTrigger className="focus-ring">
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
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isFastCharging"
                  name="isFastCharging"
                  defaultChecked={(product as any)?.isFastCharging}
                />
                <Label htmlFor="isFastCharging">Fast Charging</Label>
              </div>
            </>
          )}

          {category === "Cable" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select name="type" defaultValue={(product as any)?.type}>
                  <SelectTrigger className="focus-ring">
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="length">Length</Label>
                <Select name="length" defaultValue={(product as any)?.length}>
                  <SelectTrigger className="focus-ring">
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
              </div>
            </>
          )}

          {category === "AirPod" && (
            <div className="space-y-4">
              {/* AirPod has no additional fields */}
            </div>
          )}
        </div>
      </FormLayout>
    </Layout>
  );
}
