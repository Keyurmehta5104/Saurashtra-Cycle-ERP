import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Search, Plus, Phone, Mail, MapPin, MoreVertical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { COLLECTIONS } from "@/lib/firebaseCollections";
import { Customer } from "@/types/firebase";
import { useToast } from "@/hooks/use-toast";

const typeClasses = {
  Premium: "bg-accent/10 text-accent",
  Regular: "bg-primary/10 text-primary",
  New: "bg-success/10 text-success",
};

export default function Customers() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  useEffect(() => {
    if (location.pathname === "/customers/new") {
      setIsAddOpen(true);
    }
  }, [location.pathname]);
  const [newCustomer, setNewCustomer] = useState<Omit<Customer, "id">>({
    name: "",
    email: "",
    phone: "",
    address: "",
    type: "New",
    totalOrders: 0,
    totalSpent: 0,
    lastOrder: "",
  });

  const { data: customers, loading, add } = useFirestoreCollection<Customer>(COLLECTIONS.CUSTOMERS);
  const { toast } = useToast();

  const handleAddCustomer = async () => {
    try {
      await add(newCustomer);
      setIsAddOpen(false);
      setNewCustomer({ name: "", email: "", phone: "", address: "", type: "New", totalOrders: 0, totalSpent: 0, lastOrder: "" });
      toast({ title: "Customer added successfully" });
    } catch (error) {
      toast({ title: "Error adding customer", variant: "destructive" });
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-title text-foreground">Customers</h1>
          <p className="text-muted-foreground mt-1">
            Manage your customer database
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} placeholder="+91 98765 43210" />
              </div>
              <div>
                <Label>Address</Label>
                <Input value={newCustomer.address} onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })} />
              </div>
              <div>
                <Label>Customer Type</Label>
                <Select value={newCustomer.type} onValueChange={(v: "Premium" | "Regular" | "New") => setNewCustomer({ ...newCustomer, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddCustomer} className="w-full">Add Customer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border/50">
          <p className="text-sm text-muted-foreground">Total Customers</p>
          <p className="text-2xl font-bold font-heading text-foreground">{customers.length}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border/50">
          <p className="text-sm text-muted-foreground">Premium</p>
          <p className="text-2xl font-bold font-heading text-foreground">{customers.filter(c => c.type === "Premium").length}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border/50">
          <p className="text-sm text-muted-foreground">Regular</p>
          <p className="text-2xl font-bold font-heading text-foreground">{customers.filter(c => c.type === "Regular").length}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border/50">
          <p className="text-sm text-muted-foreground">New</p>
          <p className="text-2xl font-bold font-heading text-foreground">{customers.filter(c => c.type === "New").length}</p>
        </div>
      </div>
      
      {/* Customer Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-4 rounded-xl border border-border/50">
          <h3 className="font-semibold mb-3">Customer Distribution</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Premium</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-secondary rounded-full h-2">
                  <div 
                    className="bg-accent h-2 rounded-full" 
                    style={{ width: `${customers.length > 0 ? (customers.filter(c => c.type === "Premium").length / customers.length) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{customers.filter(c => c.type === "Premium").length}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Regular</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${customers.length > 0 ? (customers.filter(c => c.type === "Regular").length / customers.length) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{customers.filter(c => c.type === "Regular").length}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">New</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-secondary rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full" 
                    style={{ width: `${customers.length > 0 ? (customers.filter(c => c.type === "New").length / customers.length) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{customers.filter(c => c.type === "New").length}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-4 rounded-xl border border-border/50">
          <h3 className="font-semibold mb-3">Customer Value</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Revenue</span>
              <span className="text-sm font-medium">₹{customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Avg Order Value</span>
              <span className="text-sm font-medium">₹{customers.length > 0 ? (customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0)).toFixed(2) : '0.00'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Top Customer</span>
              <span className="text-sm font-medium">{customers.length > 0 ? customers.reduce((prev, current) => (current.totalSpent || 0) > (prev.totalSpent || 0) ? current : prev).name : '-'}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Customer Cards */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No customers found. Add your first customer!
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-card rounded-xl border border-border/50 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {customer.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {customer.name}
                    </h3>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        typeClasses[customer.type as keyof typeof typeClasses] || typeClasses.New
                      }`}
                    >
                      {customer.type}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{customer.address}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Orders</p>
                  <p className="font-semibold text-foreground">{customer.totalOrders}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Spent</p>
                  <p className="font-semibold text-foreground">₹{customer.totalSpent?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Order</p>
                  <p className="font-semibold text-foreground text-xs">{customer.lastOrder || "-"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
