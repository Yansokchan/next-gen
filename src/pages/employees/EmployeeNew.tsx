
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { FormLayout } from "@/components/ui/form-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Employee } from "@/lib/types";
import { employees } from "@/lib/data";
import { createEmployee } from "@/lib/supabase";

const EmployeeNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: "",
    email: "",
    phone: "",
    address: "",
    position: "",
    department: "",
    salary: 40000,
  });
  
  const departments = ["Engineering", "Marketing", "Sales", "Support", "HR"];
  const positions = ["Manager", "Senior", "Junior", "Intern", "Lead"];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Try to create employee via Supabase
      const newEmployee = await createEmployee(formData as Omit<Employee, 'id' | 'hireDate'>);
      
      if (newEmployee) {
        toast({
          title: "Employee created",
          description: "The employee has been successfully created.",
        });
        
        navigate("/employees");
        return;
      }
      
      // Fallback to local data if Supabase fails
      const fallbackEmployee: Employee = {
        ...formData as any,
        id: Math.random().toString(36).substring(2, 10),
        hireDate: new Date(),
      };
      
      // Add to employees array
      employees.unshift(fallbackEmployee);
      
      toast({
        title: "Employee created",
        description: "The employee has been successfully created (local only).",
      });
      
      navigate("/employees");
    } catch (error) {
      console.error("Error creating employee:", error);
      toast({
        title: "Error",
        description: "There was a problem creating the employee.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Layout 
      title="New Employee" 
      description="Create a new employee record."
    >
      <FormLayout
        title="Employee Information"
        description="Add a new employee to your organization."
        onSubmit={handleSubmit}
        backPath="/employees"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name"
              name="name"
              placeholder="Jane Smith"
              value={formData.name}
              onChange={handleChange}
              required
              className="focus-ring"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email"
              name="email"
              type="email"
              placeholder="jane@company.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="focus-ring"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone"
              name="phone"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={handleChange}
              required
              className="focus-ring"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input 
              id="address"
              name="address"
              placeholder="123 Main St, City, State"
              value={formData.address}
              onChange={handleChange}
              required
              className="focus-ring"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select 
              value={formData.department}
              onValueChange={(value) => handleSelectChange("department", value)}
            >
              <SelectTrigger id="department" className="focus-ring">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Select 
              value={formData.position}
              onValueChange={(value) => handleSelectChange("position", value)}
            >
              <SelectTrigger id="position" className="focus-ring">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((pos) => (
                  <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="salary">Salary</Label>
            <Input 
              id="salary"
              name="salary"
              type="number"
              placeholder="50000"
              value={formData.salary}
              onChange={handleNumericChange}
              required
              className="focus-ring"
            />
          </div>
        </div>
      </FormLayout>
    </Layout>
  );
};

export default EmployeeNew;
