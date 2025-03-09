
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  onSubmit?: (e: React.FormEvent) => void | Promise<void>;
  onCancel?: () => void;
  backPath?: string;
  isSubmitting?: boolean;
  submitText?: string;
  cancelText?: string;
  className?: string;
}

export function FormLayout({
  children,
  title,
  description,
  onSubmit,
  onCancel,
  backPath,
  isSubmitting = false,
  submitText = "Save",
  cancelText = "Cancel",
  className,
}: FormLayoutProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [internalSubmitting, setInternalSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSubmit) {
      setInternalSubmitting(true);
      try {
        await onSubmit(e);
      } catch (error) {
        console.error("Form submission error:", error);
        toast({
          title: "Error",
          description: "There was a problem submitting the form.",
          variant: "destructive",
        });
      } finally {
        setInternalSubmitting(false);
      }
    }
  };
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (backPath) {
      navigate(backPath);
    }
  };
  
  const submitting = isSubmitting || internalSubmitting;
  
  return (
    <Card className={cn("w-full max-w-3xl mx-auto transition-all animate-scale-in glass-card", className)}>
      {(title || description) && (
        <CardHeader>
          {title && <h2 className="text-2xl font-semibold">{title}</h2>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </CardHeader>
      )}
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {children}
        </CardContent>
        
        <CardFooter className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={submitting}
          >
            {cancelText}
          </Button>
          
          <Button
            type="submit"
            disabled={submitting}
            className="min-w-[100px]"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              submitText
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
