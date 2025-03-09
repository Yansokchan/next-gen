import { useState, useEffect } from "react";
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

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Omit<Product, "id">>({
    name: "",
    price: 0,
    description: "",
  });

  // Fetch product data
  const { data: product } = useQuery({
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
      navigate("/products");
    },
  });

  // Save confirmation dialog
  const saveConfirmation = useConfirmation({
    title: "Save Changes",
    description:
      "Are you sure you want to save these changes? This action cannot be undone.",
    confirmText: "Save",
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

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <Button variant="outline" onClick={() => navigate("/products")}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: parseFloat(e.target.value) })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
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
    </div>
  );
}
