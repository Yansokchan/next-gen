import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { fetchProductById } from "@/lib/supabase";
import {
  Product,
  iPhoneProduct,
  ChargerProduct,
  CableProduct,
  AirPodProduct,
} from "@/lib/types";
import { format } from "date-fns";
import {
  ArrowLeft,
  Edit,
  Package,
  Tag,
  DollarSign,
  Calendar,
  Box,
  Battery,
  Cable,
  Headphones,
  Palette,
  HardDrive,
  Zap,
  Ruler,
  AlertCircle,
  Loader2,
  FileText,
  ScrollText,
} from "lucide-react";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      const data = await fetchProductById(productId);
      if (data) {
        setProduct({
          ...data,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        });
      }
    } catch (error) {
      console.error("Error loading product:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;
      if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        return "Invalid Date";
      }
      return format(dateObj, "MMM d, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "iPhone":
        return <Package className="h-4 w-4 text-primary" />;
      case "Charger":
        return <Battery className="h-4 w-4 text-primary" />;
      case "Cable":
        return <Cable className="h-4 w-4 text-primary" />;
      case "AirPod":
        return <Headphones className="h-4 w-4 text-primary" />;
      default:
        return <Box className="h-4 w-4 text-primary" />;
    }
  };

  const getProductDetails = () => {
    if (!product) return null;

    switch (product.category) {
      case "iPhone": {
        const iPhoneProduct = product as iPhoneProduct;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Palette className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Color
                </p>
                <p className="text-sm font-medium">{iPhoneProduct.color}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <HardDrive className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Storage
                </p>
                <p className="text-sm font-medium">{iPhoneProduct.storage}</p>
              </div>
            </div>
          </div>
        );
      }
      case "Charger": {
        const chargerProduct = product as ChargerProduct;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Wattage
                </p>
                <p className="text-sm font-medium">{chargerProduct.wattage}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Battery className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Fast Charging
                </p>
                <p className="text-sm font-medium">
                  {chargerProduct.isFastCharging ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>
        );
      }
      case "Cable": {
        const cableProduct = product as CableProduct;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Cable className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Type
                </p>
                <p className="text-sm font-medium">{cableProduct.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Ruler className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Length
                </p>
                <p className="text-sm font-medium">{cableProduct.length}</p>
              </div>
            </div>
          </div>
        );
      }
      case "AirPod": {
        return (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Headphones className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Category
              </p>
              <p className="text-sm font-medium">{product.category}</p>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Layout title="Product Details">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Button variant="outline" disabled>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading...
            </Button>
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/4 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout title="Product Not Found">
        <div className="space-y-6">
          <Button
            variant="outline"
            onClick={() => navigate("/products")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Button>

          <Card className="border-destructive/50">
            <CardContent className="pt-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <h3 className="text-lg font-semibold">Product Not Found</h3>
                <p className="text-muted-foreground">
                  The requested product could not be found.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title="Product Details"
      description={`View details for ${product.name}`}
    >
      <div className="space-y-8 max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => navigate("/products")}
            className="gap-2 text-base"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Products
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate(`/products/${id}/edit`)}
            className="gap-2 text-base hover:bg-blue-50"
          >
            <Edit className="h-5 w-5 text-blue-600" />
            <span className="text-blue-600">Edit Product</span>
          </Button>
        </div>

        <Card className="shadow-lg border-0 ring-1 ring-gray-200">
          <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white rounded-full shadow-sm">
                    {getCategoryIcon(product.category)}
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-3xl font-bold text-gray-900">
                      {product.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Tag className="h-4 w-4" />
                      <CardDescription className="text-base">
                        {product.category}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge
                  variant={
                    product.status === "available" && product.stock > 0
                      ? "secondary"
                      : "destructive"
                  }
                  className={`gap-2 py-2 px-4 text-base ${
                    product.status === "available" && product.stock > 0
                      ? "bg-emerald-100 hover:bg-emerald-100/80 text-emerald-800"
                      : "bg-red-100 hover:bg-red-100/80 text-red-800"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {product.status === "available" && product.stock > 0
                    ? "Available"
                    : "Unavailable"}
                  {product.status === "available" &&
                    product.stock === 0 &&
                    " (Out of Stock)"}
                </Badge>
                <Badge
                  variant="outline"
                  className="font-mono py-1 px-3 text-base bg-white shadow-sm"
                >
                  {product.stock} in stock
                </Badge>
              </div>
            </div>
          </CardHeader>

          <Separator className="bg-gray-200" />

          <CardContent className="pt-8 pb-8 px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Price
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Created At
                    </p>
                    <p className="text-lg font-medium text-gray-900">
                      {formatDate(product.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <ScrollText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Description
                  </p>
                  <p className="text-lg font-medium text-gray-900">
                    {product.description}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 ring-1 ring-gray-200">
          <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Box className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Product Specifications
              </CardTitle>
            </div>
          </CardHeader>

          <Separator className="bg-gray-200" />

          <CardContent className="pt-8 pb-8 px-8">
            {(() => {
              if (!product) return null;

              switch (product.category) {
                case "iPhone": {
                  const iPhoneProduct = product as iPhoneProduct;
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                          <Palette className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">
                            Color
                          </p>
                          <p className="text-lg font-medium text-gray-900">
                            {iPhoneProduct.color}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                          <HardDrive className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">
                            Storage
                          </p>
                          <p className="text-lg font-medium text-gray-900">
                            {iPhoneProduct.storage}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                case "Charger": {
                  const chargerProduct = product as ChargerProduct;
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                          <Zap className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">
                            Wattage
                          </p>
                          <p className="text-lg font-medium text-gray-900">
                            {chargerProduct.wattage}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                          <Battery className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">
                            Fast Charging
                          </p>
                          <p className="text-lg font-medium text-gray-900">
                            {chargerProduct.isFastCharging ? "Yes" : "No"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                case "Cable": {
                  const cableProduct = product as CableProduct;
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                          <Cable className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">
                            Type
                          </p>
                          <p className="text-lg font-medium text-gray-900">
                            {cableProduct.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                          <Ruler className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">
                            Length
                          </p>
                          <p className="text-lg font-medium text-gray-900">
                            {cableProduct.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                case "AirPod": {
                  return (
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <Headphones className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                          Category
                        </p>
                        <p className="text-lg font-medium text-gray-900">
                          {product.category}
                        </p>
                      </div>
                    </div>
                  );
                }
                default:
                  return null;
              }
            })()}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
