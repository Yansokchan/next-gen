
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Product } from "@/lib/types";
import { getProductById } from "@/lib/data";

const ProductEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    category: "",
    stock: 0,
    status: "available",
  });
  
  const categories = ["Electronics", "Clothing", "Food", "Home", "Office"];
  
  useEffect(() => {
    const product = getProductById(id || "");
    
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        status: product.status,
      });
    } else {
      navigate("/products");
      toast({
        title: "Product not found",
        description: "The requested product could not be found.",
        variant: "destructive",
      });
    }
  }, [id, navigate, toast]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "price" || name === "stock") {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate form submission
    setTimeout(() => {
      // In a real app, this would be an API call
      toast({
        title: "Product updated",
        description: "The product has been successfully updated.",
      });
      
      navigate(`/products/${id}`);
    }, 600);
  };
  
  return (
    <Layout 
      title="Edit Product" 
      description="Update product information."
    >
      <FormLayout
        title="Product Information"
        description="Update product details and inventory."
        onSubmit={handleSubmit}
        backPath={`/products/${id}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input 
              id="name"
              name="name"
              placeholder="Premium Headphones"
              value={formData.name}
              onChange={handleChange}
              required
              className="focus-ring"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category}
              onValueChange={(value) => handleSelectChange("category", value)}
            >
              <SelectTrigger id="category" className="focus-ring">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input 
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="99.99"
              value={formData.price}
              onChange={handleChange}
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
              placeholder="100"
              value={formData.stock}
              onChange={handleChange}
              required
              className="focus-ring"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status}
              onValueChange={(value) => handleSelectChange("status", value as "available" | "unavailable")}
            >
              <SelectTrigger id="status" className="focus-ring">
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
              placeholder="Enter a detailed description of the product..."
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="resize-none focus-ring"
            />
          </div>
        </div>
      </FormLayout>
    </Layout>
  );
};

export default ProductEdit;
