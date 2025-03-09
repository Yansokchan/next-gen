import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Package,
  Battery,
  Cable,
  Headphones,
  DollarSign,
  Loader2,
  Box,
  Tag,
  Folder,
  Text,
  Info,
  CircleDollarSign,
  PackageCheck,
  Activity,
  FileText,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { Product, ProductCategory } from "@/lib/types";
import { fetchProducts, deleteProduct } from "@/lib/supabase";
import { format } from "date-fns";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useConfirmation } from "@/hooks/useConfirmation";
import { Separator } from "@/components/ui/separator";

function ProductList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  // Delete confirmation dialog
  const deleteConfirmation = useConfirmation({
    title: "Delete Product",
    description:
      "Are you sure you want to delete this product? This action cannot be undone.",
    confirmText: "Delete",
    cancelText: "Cancel",
    variant: "destructive",
    onConfirm: async () => {
      if (deleteConfirmation.data) {
        await deleteMutation.mutateAsync(deleteConfirmation.data);
      }
    },
  });

  const handleDelete = (productId: string) => {
    deleteConfirmation.open(productId);
  };

  const getCategoryIcon = (category: ProductCategory) => {
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
        return <Package className="h-4 w-4 text-primary" />;
    }
  };

  const getProductDetails = (product: Product) => {
    switch (product.category) {
      case "iPhone":
        return `${product.color} - ${product.storage}`;
      case "Charger":
        return `${product.wattage} - ${
          product.isFastCharging ? "Fast Charging" : "Standard"
        }`;
      case "Cable":
        return `${product.type} - ${product.length}`;
      case "AirPod":
        return product.name;
      default:
        return "";
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

  const columns: Column<Product>[] = [
    {
      accessorKey: "category",
      header: () => (
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-700">Category</span>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">
          {row.original.category}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: () => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-700">Name</span>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "details",
      header: () => (
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-700">Details</span>
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-gray-600">{getProductDetails(row.original)}</span>
      ),
    },
    {
      accessorKey: "price",
      header: () => (
        <div className="flex items-center justify-center w-full gap-2">
          <CircleDollarSign className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-700">Price</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center w-full">
          <span className="font-medium text-gray-900">
            ${row.original.price.toFixed(2)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "stock",
      header: () => (
        <div className="flex items-center justify-center w-full gap-2">
          <PackageCheck className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-700">Stock</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center w-full">
          <Badge
            variant={
              row.original.stock === 0
                ? "destructive"
                : row.original.stock < 10
                ? "outline"
                : "secondary"
            }
            className={`${
              row.original.stock === 0
                ? "bg-red-100 text-red-800 hover:bg-red-100/80"
                : row.original.stock < 10
                ? "bg-amber-100 text-amber-800 hover:bg-amber-100/80"
                : "bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80"
            }`}
          >
            {row.original.stock}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: () => (
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-700">Status</span>
        </div>
      ),
      cell: ({ row }) => {
        const isAvailable = row.original.status === "available";
        const hasStock = row.original.stock > 0;
        return (
          <Badge
            variant={isAvailable && hasStock ? "secondary" : "destructive"}
            className={`gap-2 ${
              isAvailable && hasStock
                ? "bg-emerald-100 hover:bg-emerald-100/80 text-emerald-800"
                : "bg-red-100 hover:bg-red-100/80 text-red-800"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-current" />
            {isAvailable && hasStock ? "Available" : "Unavailable"}
            {isAvailable && !hasStock && " (Out of Stock)"}
          </Badge>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <Layout title="Products" description="Loading products...">
        <div className="max-w-6xl mx-auto px-4">
          <Card className="shadow-lg border-0 ring-1 ring-gray-200">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                    <Package className="h-7 w-7 text-blue-600" />
                    Product List
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-gray-600">Loading products...</span>
                    </div>
                  </div>
                </div>

                <Button
                  disabled
                  size="lg"
                  className="gap-2 bg-white text-blue-600 border-blue-200 opacity-50 cursor-not-allowed"
                >
                  <Plus className="h-5 w-5" />
                  Add Product
                </Button>
              </div>
            </div>

            <Separator className="bg-gray-200" />

            <div className="p-6">
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-lg animate-pulse"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                    <div className="w-24 h-8 bg-gray-200 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Products" description="Manage your product catalog">
      <div className="max-w-6xl mx-auto px-4">
        <Card className="shadow-lg border-0 ring-1 ring-gray-200">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                  <Package className="h-7 w-7 text-blue-600" />
                  Product List
                </h2>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="rounded-lg bg-white text-blue-600 border-blue-100 shadow-sm"
                  >
                    {products.length} products total
                  </Badge>
                </div>
              </div>

              <Button
                onClick={() => navigate("/products/new")}
                size="lg"
                className="gap-2 bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Plus className="h-5 w-5" />
                Add Product
              </Button>
            </div>
          </div>

          <Separator className="bg-gray-200" />

          <div className="p-6">
            <DataTable
              columns={columns}
              data={products}
              searchKeys={["name", "category"]}
              basePath="/products"
              onDelete={handleDelete}
            />
          </div>
        </Card>

        <ConfirmationDialog {...deleteConfirmation.dialogProps} />
      </div>
    </Layout>
  );
}

export default ProductList;
