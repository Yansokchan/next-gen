import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { FormLayout } from "@/components/ui/form-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Employee } from "@/lib/types";
import { employees } from "@/lib/data";
import { createEmployee } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { Card } from "@/components/ui/card";
import {
  User,
  Mail,
  Phone,
  MapPin,
  UserPlus,
  Briefcase,
  Building2,
  DollarSign,
} from "lucide-react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useConfirmation } from "@/hooks/useConfirmation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

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
    status: "active",
  });

  const departments = ["Engineering", "Marketing", "Sales", "Support", "HR"];
  const positions = ["Manager", "Senior", "Junior", "Intern", "Lead"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const saveEmployee = async () => {
    try {
      // Try to create employee via Supabase
      const newEmployee = await createEmployee(
        formData as Omit<Employee, "id" | "hireDate">
      );

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
        ...(formData as any),
        id: uuidv4(),
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
        variant: "destructive",
      });
    }
  };

  const saveConfirmation = useConfirmation({
    title: "Create New Employee",
    description: "Are you sure you want to create this employee?",
    confirmText: "Create Employee",
    onConfirm: saveEmployee,
    variant: "default",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    saveConfirmation.open();
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } },
  };

  return (
    <Layout title="New Employee" description="Create a new employee record.">
      <motion.div
        className="max-w-4xl mx-auto px-4 sm:px-16"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-xl ring-1 ring-gray-200/50 overflow-hidden">
          <FormLayout
            title={
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 animate-pulse">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  New Employee
                </span>
              </div>
            }
            description="Add a new employee to your organization."
            onSubmit={handleSubmit}
            backPath="/employees"
            className="p-6 sm:p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div className="space-y-3" whileTap={{ scale: 0.995 }}>
                <Label htmlFor="name" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Full Name
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
                    placeholder="Jane Smith"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="focus-ring border-gray-200 h-12 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                  />
                </motion.div>
              </motion.div>

              <motion.div className="space-y-3" whileTap={{ scale: 0.995 }}>
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Email Address
                    </span>
                  </div>
                </Label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="blur"
                >
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="jane@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="focus-ring border-gray-200 h-12 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                  />
                </motion.div>
              </motion.div>

              <motion.div className="space-y-3" whileTap={{ scale: 0.995 }}>
                <Label htmlFor="position" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Position
                    </span>
                  </div>
                </Label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="blur"
                >
                  <Select
                    value={formData.position}
                    onValueChange={(value) =>
                      handleSelectChange("position", value)
                    }
                  >
                    <SelectTrigger
                      id="position"
                      className="h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                    >
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              </motion.div>

              <motion.div className="space-y-3" whileTap={{ scale: 0.995 }}>
                <Label
                  htmlFor="department"
                  className="text-gray-700 font-medium"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <Building2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Department
                    </span>
                  </div>
                </Label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="blur"
                >
                  <Select
                    value={formData.department}
                    onValueChange={(value) =>
                      handleSelectChange("department", value)
                    }
                  >
                    <SelectTrigger
                      id="department"
                      className="h-12 focus-ring border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                    >
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>
              </motion.div>

              <motion.div
                className="space-y-3 md:col-span-2"
                whileTap={{ scale: 0.995 }}
              >
                <Label htmlFor="address" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Address
                    </span>
                  </div>
                </Label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="blur"
                >
                  <Input
                    id="address"
                    name="address"
                    placeholder="123 Main St, City, Country"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="focus-ring border-gray-200 h-12 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                  />
                </motion.div>
              </motion.div>

              <motion.div className="space-y-3" whileTap={{ scale: 0.995 }}>
                <Label htmlFor="phone" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <Phone className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Phone Number
                    </span>
                  </div>
                </Label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="blur"
                >
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="focus-ring border-gray-200 h-12 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
                  />
                </motion.div>
              </motion.div>

              <motion.div className="space-y-3" whileTap={{ scale: 0.995 }}>
                <Label htmlFor="salary" className="text-gray-700 font-medium">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      Salary
                    </span>
                  </div>
                </Label>
                <motion.div
                  variants={inputVariants}
                  whileFocus="focus"
                  whileTap="blur"
                >
                  <Input
                    id="salary"
                    name="salary"
                    type="number"
                    placeholder="50000"
                    value={formData.salary}
                    onChange={handleNumericChange}
                    required
                    className="focus-ring border-gray-200 h-12 shadow-sm transition-all duration-200 hover:shadow-md bg-white/50 backdrop-blur-sm"
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

export default EmployeeNew;
