import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./lib/AuthContext";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import PasswordProtection from "./pages/PasswordProtection";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Customer pages
import CustomerList from "./pages/customers/CustomerList";
import CustomerNew from "./pages/customers/CustomerNew";
import CustomerView from "./pages/customers/CustomerView";
import CustomerEdit from "./pages/customers/CustomerEdit";

// Employee pages
import EmployeeList from "./pages/employees/EmployeeList";
import EmployeeNew from "./pages/employees/EmployeeNew";
import EmployeeView from "./pages/employees/EmployeeView";
import EmployeeEdit from "./pages/employees/EmployeeEdit";

// Product pages
import ProductList from "./pages/products/ProductList";
import ProductForm from "./pages/products/ProductForm";
import EditProduct from "./pages/products/EditProduct";
import ProductView from "./pages/products/ProductView";
import ProductNew from "./pages/products/ProductNew";

// Order pages
import OrderList from "./pages/orders/OrderList";
import OrderNew from "./pages/orders/OrderNew";
import OrderView from "./pages/orders/OrderView";
import OrderEdit from "./pages/orders/OrderEdit";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Routes>
              <Route path="/password" element={<PasswordProtection />} />
              <Route path="/" element={<ProtectedRoute />}>
                <Route index element={<Index />} />
                <Route path="customers" element={<CustomerList />} />
                <Route path="customers/new" element={<CustomerNew />} />
                <Route path="customers/:id" element={<CustomerView />} />
                <Route path="customers/:id/edit" element={<CustomerEdit />} />
                <Route path="employees" element={<EmployeeList />} />
                <Route path="employees/new" element={<EmployeeNew />} />
                <Route path="employees/:id" element={<EmployeeView />} />
                <Route path="employees/:id/edit" element={<EmployeeEdit />} />
                <Route path="products" element={<ProductList />} />
                <Route path="products/new" element={<ProductForm />} />
                <Route path="products/:id" element={<ProductView />} />
                <Route path="products/:id/edit" element={<ProductForm />} />
                <Route path="orders" element={<OrderList />} />
                <Route path="orders/new" element={<OrderNew />} />
                <Route path="orders/:id" element={<OrderView />} />
                <Route path="orders/:id/edit" element={<OrderEdit />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
