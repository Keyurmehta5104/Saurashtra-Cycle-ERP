import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Search, Plus, Wrench, Clock, CheckCircle2, AlertCircle, Loader2, BarChart3, TrendingUp, Users, DollarSign, User, Calendar, Settings, CheckCircle2 as CheckCircle2Icon, XCircle, Printer, Bike, Phone, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { ServiceJob, SaleOrder } from "@/types/firebase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getNextNumber } from "@/lib/autoInvoiceNumber";
import { ServiceReceipt } from "@/components/service/ServiceReceipt";
import { JobCardPrint } from "@/components/service/JobCardPrint";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const statusConfig = {
  Completed: { icon: CheckCircle2, class: "bg-success/10 text-success border-success/20" },
  "In Progress": { icon: Wrench, class: "bg-primary/10 text-primary border-primary/20" },
  Pending: { icon: Clock, class: "bg-warning/10 text-warning border-warning/20" },
  "Awaiting Parts": { icon: AlertCircle, class: "bg-accent/10 text-accent border-accent/20" },
};

const COLORS = [
  "hsl(173, 58%, 39%)",
  "hsl(24, 95%, 53%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(210, 40%, 50%)",
  "hsl(340, 82%, 52%)",
  "hsl(280, 65%, 60%)",
];

const priorityClasses = {
  High: "bg-destructive/10 text-destructive",
  Medium: "bg-warning/10 text-warning",
  Low: "bg-muted text-muted-foreground",
};

export default function Service() {
  const { user, isStaff } = useAuth();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("jobs"); // jobs, analytics
  const [isGeneratingNumber, setIsGeneratingNumber] = useState(false);

  // Status update state
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<"Pending" | "In Progress" | "Completed" | "Awaiting Parts">();
  
  // Payment update state
  // Payment update state
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [newPaymentStatus, setNewPaymentStatus] = useState<"Paid" | "Unpaid" | "Partial">();
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  // Completion Workflow State
  const [completingJob, setCompletingJob] = useState<ServiceJob | null>(null);
  const [completionData, setCompletionData] = useState({
    actualCost: 0,
    partsUsed: "",
    completionNotes: "",
    paymentCollected: 0,
  });

  // Printing State
  const [printingJob, setPrintingJob] = useState<ServiceJob | null>(null);
  const [printingJobCard, setPrintingJobCard] = useState<ServiceJob | null>(null);

  useEffect(() => {
    if (location.pathname === "/service/new") {
      setIsAddOpen(true);
    }
  }, [location.pathname]);

  // Auto-generate Service Job ID each time the dialog opens
  useEffect(() => {
    if (isAddOpen) {
      setIsGeneratingNumber(true);
      getNextNumber("service")
        .then((num) => {
          setNewJob((prev) => ({ ...prev, jobId: num }));
        })
        .catch((err) => {
          console.error("Failed to generate service job ID:", err);
        })
        .finally(() => setIsGeneratingNumber(false));
    }
  }, [isAddOpen]);
  const [newJob, setNewJob] = useState<Omit<ServiceJob, "id">>({
    jobId: "",
    customer: "",
    phone: "",
    cycle: "",
    issue: "",
    receivedDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    expectedDate: "",
    status: "Pending",
    priority: "Medium",
    estimatedCost: 0,
    technician: "",
  });

  const { data: serviceJobs = [], loading, add, update } = useFirestoreCollection<ServiceJob>(COLLECTIONS.SERVICES);
  const { data: salesData = [] } = useFirestoreCollection<SaleOrder>(COLLECTIONS.SALES);
  const { toast } = useToast();

  // Define types for service analytics
  type TechnicianPerformance = Record<string, { completed: number; inProgress: number; totalRevenue: number }>;
  type MonthlyRevenue = Record<string, number>;
  type ServiceTypeDistribution = Record<string, number>;
  type CustomerServiceHistory = Record<string, { totalJobs: number; totalSpent: number; lastService: string }>;

  // Calculate service analytics
  const serviceAnalytics = useMemo(() => {
    // Technician performance
    const technicianPerformance = serviceJobs.reduce((acc: TechnicianPerformance, job) => {
      if (!job.technician) return acc;
      if (!acc[job.technician]) {
        acc[job.technician] = { completed: 0, inProgress: 0, totalRevenue: 0 };
      }
      if (job.status === "Completed") {
        acc[job.technician].completed++;
        acc[job.technician].totalRevenue += job.estimatedCost || 0;
      } else if (job.status === "In Progress") {
        acc[job.technician].inProgress++;
      }
      return acc;
    }, {} as TechnicianPerformance);

    // Revenue by month
    const monthlyRevenue = serviceJobs.reduce((acc: MonthlyRevenue, job) => {
      if (job.status !== "Completed" || !job.estimatedCost) return acc;
      
      const date = new Date(job.receivedDate);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      acc[monthKey] = (acc[monthKey] || 0) + job.estimatedCost;
      return acc;
    }, {} as MonthlyRevenue);

    // Service type distribution
    const serviceTypeDistribution = serviceJobs.reduce((acc: ServiceTypeDistribution, job) => {
      const serviceType = job.issue || "Other";
      acc[serviceType] = (acc[serviceType] || 0) + 1;
      return acc;
    }, {} as ServiceTypeDistribution);

    // Customer service history
    const customerServiceHistory = serviceJobs.reduce((acc: CustomerServiceHistory, job) => {
      const customer = job.customer || "Unknown";
      if (!acc[customer]) {
        acc[customer] = { totalJobs: 0, totalSpent: 0, lastService: job.receivedDate };
      }
      acc[customer].totalJobs++;
      acc[customer].totalSpent += job.estimatedCost || 0;
      return acc;
    }, {} as CustomerServiceHistory);

    return {
      technicianPerformance,
      monthlyRevenue,
      serviceTypeDistribution,
      customerServiceHistory,
    };
  }, [serviceJobs]);

  // Prepare chart data
  const monthlyRevenueData = Object.entries(serviceAnalytics.monthlyRevenue)
    .map(([month, revenue]) => ({ month, revenue }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const serviceTypeData = Object.entries(serviceAnalytics.serviceTypeDistribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 service types

  const handleAddJob = async () => {
    try {
      await add({
        ...newJob,
      });
      setIsAddOpen(false);
      setNewJob({ jobId: "", customer: "", phone: "", cycle: "", issue: "", receivedDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }), expectedDate: "", status: "Pending", priority: "Medium", estimatedCost: 0, technician: "" });
      toast({ title: "Service job created" });
    } catch (error) {
      toast({ title: "Error creating job", variant: "destructive" });
    }
  };

  const filteredJobs = serviceJobs.filter(
    (job) =>
      (job.customer?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (job.jobId?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (job.cycle?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const handleCompleteJob = async () => {
    if (!completingJob) return;
    try {
      await update(completingJob.id, {
        status: "Completed",
        actualCost: completionData.actualCost,
        partsUsed: completionData.partsUsed,
        completionNotes: completionData.completionNotes,
        amountPaid: completionData.paymentCollected > 0 ? completionData.paymentCollected : completingJob.amountPaid,
        payment: completionData.paymentCollected > 0 ? (completionData.paymentCollected >= completionData.actualCost ? "Paid" : "Partial") : completingJob.payment,
        deliveredDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      });
      toast({ title: "Job marked as completed successfully!" });
      setCompletingJob(null);
      setCompletionData({ actualCost: 0, partsUsed: "", completionNotes: "", paymentCollected: 0 });
    } catch (error) {
      toast({ title: "Error completing job", variant: "destructive" });
    }
  };

  const pending = serviceJobs.filter(j => j.status === "Pending").length;
  const inProgress = serviceJobs.filter(j => j.status === "In Progress").length;
  const completed = serviceJobs.filter(j => j.status === "Completed").length;
  const awaitingParts = serviceJobs.filter(j => j.status === "Awaiting Parts").length;

  // Logic for Service Reminders (Cycle sold 3-4 months ago)
  const serviceReminders = useMemo(() => {
    const today = new Date();
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const fourMonthsAgo = new Date(today);
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);

    return salesData.filter(sale => {
      if (!sale.date) return false;
      const saleDate = new Date(sale.date);
      const isCorrectTimeWindow = saleDate <= threeMonthsAgo && saleDate >= fourMonthsAgo;
      
      // Check if they've already had a service
      const hasHadService = serviceJobs.some(job => 
        job.phone === sale.customerPhone || job.customer === sale.customerName
      );

      return isCorrectTimeWindow && !hasHadService;
    });
  }, [salesData, serviceJobs]);

  const handlePrint = (job: ServiceJob) => {
    setPrintingJob(job);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handlePrintJobCard = (job: ServiceJob) => {
    setPrintingJobCard(job);
    setTimeout(() => {
      window.print();
    }, 500);
  };

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
          <h1 className="page-title text-foreground">Service Center</h1>
          <p className="text-muted-foreground mt-1">
            Track repair and maintenance jobs
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-0.5 bg-muted rounded-md p-0.5 border border-border">
            <button 
              className={`px-4 py-2 rounded-[0.35rem] text-xs font-bold uppercase tracking-wider transition-all ${activeTab === "jobs" ? "bg-white text-primary shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab("jobs")}
            >
              Live Jobs
            </button>
            <button 
              className={`px-4 py-2 rounded-[0.35rem] text-xs font-bold uppercase tracking-wider transition-all relative ${activeTab === "reminders" ? "bg-white text-primary shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab("reminders")}
            >
              Reminders
              {serviceReminders.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] flex items-center justify-center rounded-full border border-white shadow-sm">
                  {serviceReminders.length}
                </span>
              )}
            </button>
            <button 
              className={`px-4 py-2 rounded-[0.35rem] text-xs font-bold uppercase tracking-wider transition-all ${activeTab === "analytics" ? "bg-white text-primary shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab("analytics")}
            >
              Analytics
            </button>
          </div>
          {isStaff && (
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  New Service Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">New Service Job</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                  {/* Left Column: Customer & Job Info */}
                  <div className="space-y-6">
                    <div className="bg-secondary/30 p-4 rounded-xl border border-border/50 space-y-4">
                      <h3 className="font-semibold text-primary flex items-center gap-2">
                        <User className="w-4 h-4" /> Customer Details
                      </h3>
                      <div>
                        <Label className="text-xs text-muted-foreground">Job ID</Label>
                        <div className="relative mt-1">
                          <Input
                            value={newJob.jobId}
                            readOnly
                            className="bg-secondary/50 font-mono font-semibold text-primary cursor-default border-dashed"
                            placeholder={isGeneratingNumber ? "Generating..." : "SRV-XXXX"}
                          />
                          {isGeneratingNumber && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Customer Name *</Label>
                          <Input className="mt-1" value={newJob.customer} onChange={(e) => setNewJob({ ...newJob, customer: e.target.value })} placeholder="John Doe" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Phone *</Label>
                          <Input className="mt-1" value={newJob.phone} onChange={(e) => setNewJob({ ...newJob, phone: e.target.value })} placeholder="9876543210" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-secondary/30 p-4 rounded-xl border border-border/50 space-y-4">
                      <h3 className="font-semibold text-primary flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Schedule & Assignment
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Expected Completion</Label>
                          <Input className="mt-1" type="date" value={newJob.expectedDate} onChange={(e) => setNewJob({ ...newJob, expectedDate: e.target.value })} />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Technician</Label>
                          <Input className="mt-1" value={newJob.technician} onChange={(e) => setNewJob({ ...newJob, technician: e.target.value })} placeholder="Assign to..." />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Priority Level</Label>
                        <Select value={newJob.priority} onValueChange={(v: "High" | "Medium" | "Low") => setNewJob({ ...newJob, priority: v })}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Cycle & Issue Details */}
                  <div className="space-y-6">
                    <div className="bg-secondary/30 p-4 rounded-xl border border-border/50 space-y-4 h-full">
                      <h3 className="font-semibold text-primary flex items-center gap-2">
                        <Wrench className="w-4 h-4" /> Technical Details
                      </h3>
                      <div>
                        <Label className="text-xs text-muted-foreground">Cycle Model *</Label>
                        <Input className="mt-1" value={newJob.cycle} onChange={(e) => setNewJob({ ...newJob, cycle: e.target.value })} placeholder="e.g. Hero Sprint Pro 26T" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Issue Description *</Label>
                        <textarea 
                          className="w-full mt-1 min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          value={newJob.issue} 
                          onChange={(e) => setNewJob({ ...newJob, issue: e.target.value })} 
                          placeholder="Detailed description of the problems..."
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Estimated Cost (₹)</Label>
                        <Input className="mt-1 font-semibold text-lg" type="number" value={newJob.estimatedCost} onChange={(e) => setNewJob({ ...newJob, estimatedCost: parseInt(e.target.value) || 0 })} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddJob} disabled={!newJob.customer || !newJob.cycle || !newJob.issue}>
                    Create Service Job
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Service Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="metric-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Revenue</p>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">
                ₹{(serviceAnalytics.monthlyRevenue ? Object.values(serviceAnalytics.monthlyRevenue).reduce((sum, val) => sum + (Number(val) || 0), 0) : 0).toLocaleString()}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">from completed jobs</p>
            </div>
            <div className="metric-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Jobs</p>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{serviceJobs.length}</div>
              <p className="text-[10px] text-muted-foreground mt-1">jobs processed</p>
            </div>
            <div className="metric-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Jobs</p>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{serviceJobs.filter(j => j.status !== "Completed").length}</div>
              <p className="text-[10px] text-muted-foreground mt-1">in progress/pending</p>
            </div>
            <div className="metric-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Top Technician</p>
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">
                {Object.entries(serviceAnalytics.technicianPerformance).length > 0
                  ? Object.entries(serviceAnalytics.technicianPerformance)
                      .sort((a, b) => b[1].completed - a[1].completed)[0][0]
                  : "-"}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">most completed jobs</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Monthly Service Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `₹${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`} />
                      <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Revenue"]} />
                      <Bar dataKey="revenue" fill="hsl(173, 58%, 39%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Service Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Service Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={serviceTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {serviceTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, "Jobs"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Technician Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Technician Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-muted-foreground font-medium">Technician</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Completed</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">In Progress</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Revenue Generated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(serviceAnalytics.technicianPerformance).map(([tech, data], index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-3 font-medium">{tech}</td>
                        <td className="py-3">{data.completed}</td>
                        <td className="py-3">{data.inProgress}</td>
                        <td className="py-3 font-semibold">₹{data.totalRevenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "jobs" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="metric-card">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-warning" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pending</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{pending}</p>
            </div>
            <div className="metric-card">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="w-5 h-5 text-primary" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">In Progress</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{inProgress}</p>
            </div>
            <div className="metric-card">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Completed</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{completed}</p>
            </div>
            <div className="metric-card">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Awaiting Parts</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{awaitingParts}</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search service jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-enhanced"
            />
          </div>

          {/* Service Cards */}
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No service jobs found. Create your first job!
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => {
                const StatusIcon = statusConfig[job.status as keyof typeof statusConfig]?.icon || Clock;
                return (
                  <div
                    key={job.id}
                    className="card-enhanced p-5 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-mono text-sm text-muted-foreground">
                            {job.jobId}
                          </span>
                          <Badge
                            variant="outline"
                            className={priorityClasses[job.priority as keyof typeof priorityClasses] || priorityClasses.Medium}
                          >
                            {job.priority}
                          </Badge>
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                              statusConfig[job.status as keyof typeof statusConfig]?.class || statusConfig.Pending.class
                            }`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {job.status}
                          </div>
                        </div>
                        <h3 className="font-semibold text-foreground">{job.customer}</h3>
                        <p className="text-sm text-muted-foreground">{job.phone}</p>
                        <div className="mt-3 p-3 bg-secondary/50 rounded-lg">
                          <p className="text-sm font-medium text-foreground">{job.cycle}</p>
                          <p className="text-sm text-muted-foreground mt-1">{job.issue}</p>
                        </div>
                      </div>
                      <div className="flex md:flex-col items-center md:items-end gap-4 md:gap-2 text-sm">
                        <div className="text-right">
                          <p className="text-muted-foreground">Received</p>
                          <p className="font-medium text-foreground">{job.receivedDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">Est. Cost</p>
                          <p className="font-semibold text-foreground">₹{job.estimatedCost?.toLocaleString()}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="relative">
                            {editingStatusId === job.id ? (
                              <div className="flex gap-1">
                                <Select value={newStatus} onValueChange={(v: "Pending" | "In Progress" | "Completed" | "Awaiting Parts") => setNewStatus(v)}>
                                  <SelectTrigger className="w-28">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                    <SelectItem value="Awaiting Parts">Awaiting Parts</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button size="sm" onClick={async () => {
                                  if (newStatus) {
                                    if (newStatus === "Completed") {
                                      setEditingStatusId(null);
                                      setNewStatus(undefined);
                                      setCompletingJob(job);
                                      setCompletionData({ ...completionData, actualCost: job.estimatedCost || 0 });
                                    } else {
                                      try {
                                        await update(job.id, { status: newStatus });
                                        toast({ title: "Status updated successfully" });
                                        setEditingStatusId(null);
                                        setNewStatus(undefined);
                                      } catch (error) {
                                        toast({ title: "Error updating status", variant: "destructive" });
                                      }
                                    }
                                  }
                                }}>
                                  <CheckCircle2Icon className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => {
                                  setEditingStatusId(null);
                                  setNewStatus(undefined);
                                }}>
                                  <XCircle className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => {
                                setEditingStatusId(job.id);
                                setNewStatus(job.status);
                              }}>
                                <Settings className="w-3 h-3" />
                                Status
                              </Button>
                            )}
                          </div>
                          <div className="relative">
                            {editingPaymentId === job.id ? (
                              <div className="flex gap-1">
                                <Select value={newPaymentStatus} onValueChange={(v: "Paid" | "Unpaid" | "Partial") => setNewPaymentStatus(v)}>
                                  <SelectTrigger className="w-24">
                                    <SelectValue placeholder="Select payment" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                                    <SelectItem value="Partial">Partial</SelectItem>
                                    <SelectItem value="Paid">Paid</SelectItem>
                                  </SelectContent>
                                </Select>
                                {newPaymentStatus === "Partial" && (
                                  <Input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                                    placeholder="Amount"
                                    className="w-20"
                                  />
                                )}
                                <Button size="sm" onClick={async () => {
                                  if (newPaymentStatus) {
                                    try {
                                      const updateData: { payment: "Paid" | "Unpaid" | "Partial"; amountPaid?: number } = { payment: newPaymentStatus };
                                      if (newPaymentStatus === "Partial" && paymentAmount > 0) {
                                        updateData.amountPaid = paymentAmount;
                                      }
                                      await update(job.id, updateData);
                                      toast({ title: "Payment status updated successfully" });
                                      setEditingPaymentId(null);
                                      setNewPaymentStatus(undefined);
                                      setPaymentAmount(0);
                                    } catch (error) {
                                      toast({ title: "Error updating payment status", variant: "destructive" });
                                    }
                                  }
                                }}>
                                  <CheckCircle2Icon className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => {
                                  setEditingPaymentId(null);
                                  setNewPaymentStatus(undefined);
                                  setPaymentAmount(0);
                                }}>
                                  <XCircle className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => {
                                setEditingPaymentId(job.id);
                                setNewPaymentStatus(job.payment || "Unpaid");
                              }}>
                                <Settings className="w-3 h-3" />
                                Payment
                              </Button>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handlePrintJobCard(job)}
                              className="text-[10px] font-bold uppercase tracking-widest px-3 h-8"
                            >
                              <Printer className="w-3 h-3 mr-1.5 text-slate-500" />
                              Job Card
                            </Button>
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              onClick={() => setPrintingJob(job)}
                              disabled={job.status !== "Completed"}
                              className="text-[10px] font-bold uppercase tracking-widest px-3 h-8"
                            >
                              <Printer className="w-3 h-3 mr-1.5" />
                              Receipt
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "reminders" && (
        <div className="space-y-6">
           <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl flex items-start gap-4">
              <div className="bg-amber-500 p-2 rounded-lg text-white">
                 <Bell className="w-5 h-5" />
              </div>
              <div>
                 <h3 className="text-sm font-black text-amber-900 uppercase tracking-tight">Predictive Service Reminders</h3>
                 <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                   These customers purchased a bicycle 3-4 months ago and haven't returned for their first service. 
                   Proactive outreach can increase customer lifetime value by 35%.
                 </p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {serviceReminders.length === 0 ? (
                <div className="col-span-full py-20 text-center card-enhanced bg-slate-50/50">
                   <CheckCircle2Icon className="w-12 h-12 text-green-200 mx-auto mb-4" />
                   <p className="text-slate-500 font-bold uppercase tracking-widest">No pending reminders</p>
                </div>
              ) : (
                serviceReminders.map(sale => (
                  <div key={sale.id} className="card-enhanced p-5 border-l-4 border-l-amber-400">
                     <div className="flex justify-between items-start mb-4">
                        <div className="bg-slate-100 p-2 rounded">
                           <Bike className="w-4 h-4 text-slate-500" />
                        </div>
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 border-amber-200">
                           First Service Due
                        </Badge>
                     </div>
                     <h4 className="text-sm font-black text-slate-900">{sale.customerName}</h4>
                     <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-tighter">Purchased: {sale.date}</p>
                     
                     <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                           <Phone className="w-3.5 h-3.5 text-slate-400" />
                           <span className="text-xs font-bold text-slate-600">{sale.customerPhone}</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 text-[10px] font-black uppercase text-primary hover:bg-primary/5"
                          onClick={() => {
                            setNewJob({ ...newJob, customer: sale.customerName || "", phone: sale.customerPhone || "", cycle: `${sale.brand || ''} ${sale.model || ''}`.trim(), issue: "First Free Service" });
                            setIsAddOpen(true);
                          }}
                        >
                          Book Now
                        </Button>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>
      )}

      {/* Complete Job Dialog */}
      <Dialog open={!!completingJob} onOpenChange={(open) => !open && setCompletingJob(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Service Job</DialogTitle>
          </DialogHeader>
          {completingJob && (
            <div className="space-y-4 mt-2">
              <div className="bg-secondary/30 p-3 rounded-lg border border-border/50 text-sm">
                <span className="font-semibold">{completingJob.customer}</span>'s {completingJob.cycle}
              </div>
              <div>
                <Label>Actual Cost (₹)</Label>
                <Input 
                  type="number" 
                  value={completionData.actualCost} 
                  onChange={(e) => setCompletionData({ ...completionData, actualCost: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Payment Collected Now (₹)</Label>
                <Input 
                  type="number" 
                  value={completionData.paymentCollected} 
                  onChange={(e) => setCompletionData({ ...completionData, paymentCollected: parseInt(e.target.value) || 0 })}
                  placeholder="Leave 0 if unpaid"
                />
              </div>
              <div>
                <Label>Parts Replaced / Used</Label>
                <Input 
                  value={completionData.partsUsed} 
                  onChange={(e) => setCompletionData({ ...completionData, partsUsed: e.target.value })}
                  placeholder="e.g. Brake pads, Inner tube"
                />
              </div>
              <div>
                <Label>Completion Notes</Label>
                <textarea 
                  className="w-full mt-1 min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={completionData.completionNotes} 
                  onChange={(e) => setCompletionData({ ...completionData, completionNotes: e.target.value })}
                  placeholder="Any notes for the customer..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setCompletingJob(null)}>Cancel</Button>
                <Button onClick={handleCompleteJob} className="bg-success hover:bg-success/90 text-white">
                  <CheckCircle2Icon className="w-4 h-4 mr-2" />
                  Mark as Completed
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Printing Modal for Service Receipt */}
      <Dialog open={!!printingJob} onOpenChange={(open) => !open && setPrintingJob(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Service Receipt</span>
              <Button onClick={() => window.print()} className="mr-6">
                <Printer className="w-4 h-4 mr-2" /> Print Receipt
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="print-section bg-white border border-gray-200 rounded-lg overflow-hidden">
            <ServiceReceipt job={printingJob!} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Printing Modal for Job Card */}
      <Dialog open={!!printingJobCard} onOpenChange={(open) => !open && setPrintingJobCard(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Intake Job Card</span>
              <Button onClick={() => window.print()} className="mr-6">
                <Printer className="w-4 h-4 mr-2" /> Print Job Card
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="print-section bg-white border border-gray-200 rounded-lg overflow-hidden">
            <JobCardPrint job={printingJobCard!} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
