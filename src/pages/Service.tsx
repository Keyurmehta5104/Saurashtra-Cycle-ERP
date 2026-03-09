import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Search, Plus, Wrench, Clock, CheckCircle2, AlertCircle, Loader2, BarChart3, TrendingUp, Users, DollarSign, User, Calendar, Settings, CheckCircle2 as CheckCircle2Icon, XCircle } from "lucide-react";
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
import { ServiceJob } from "@/types/firebase";
import { useToast } from "@/hooks/use-toast";
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
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("jobs"); // jobs, analytics
  
  // Status update state
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<"Pending" | "In Progress" | "Completed" | "Awaiting Parts">();
  
  // Payment update state
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [newPaymentStatus, setNewPaymentStatus] = useState<"Paid" | "Unpaid" | "Partial">();
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  
  useEffect(() => {
    if (location.pathname === "/service/new") {
      setIsAddOpen(true);
    }
  }, [location.pathname]);
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

  const { data: serviceJobs, loading, add, update } = useFirestoreCollection<ServiceJob>(COLLECTIONS.SERVICES);
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
        jobId: `SRV-${Date.now().toString().slice(-6)}`,
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
      job.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.jobId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.cycle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pending = serviceJobs.filter(j => j.status === "Pending").length;
  const inProgress = serviceJobs.filter(j => j.status === "In Progress").length;
  const completed = serviceJobs.filter(j => j.status === "Completed").length;
  const awaitingParts = serviceJobs.filter(j => j.status === "Awaiting Parts").length;

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
          <div className="flex gap-1 bg-secondary rounded-lg p-1">
            <button 
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "jobs" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab("jobs")}
            >
              Service Jobs
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "analytics" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab("analytics")}
            >
              Analytics
            </button>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Service Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>New Service Job</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Customer Name</Label>
                    <Input value={newJob.customer} onChange={(e) => setNewJob({ ...newJob, customer: e.target.value })} />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={newJob.phone} onChange={(e) => setNewJob({ ...newJob, phone: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Cycle Model</Label>
                  <Input value={newJob.cycle} onChange={(e) => setNewJob({ ...newJob, cycle: e.target.value })} placeholder="e.g. Hero Sprint Pro 26T" />
                </div>
                <div>
                  <Label>Issue Description</Label>
                  <Input value={newJob.issue} onChange={(e) => setNewJob({ ...newJob, issue: e.target.value })} placeholder="e.g. Brake adjustment + Chain replacement" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Expected Completion</Label>
                    <Input value={newJob.expectedDate} onChange={(e) => setNewJob({ ...newJob, expectedDate: e.target.value })} placeholder="e.g. Dec 28, 2024" />
                  </div>
                  <div>
                    <Label>Estimated Cost (₹)</Label>
                    <Input type="number" value={newJob.estimatedCost} onChange={(e) => setNewJob({ ...newJob, estimatedCost: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priority</Label>
                    <Select value={newJob.priority} onValueChange={(v: "High" | "Medium" | "Low") => setNewJob({ ...newJob, priority: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Technician</Label>
                    <Input value={newJob.technician} onChange={(e) => setNewJob({ ...newJob, technician: e.target.value })} />
                  </div>
                </div>
                <Button onClick={handleAddJob} className="w-full">Create Service Job</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Service Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{serviceAnalytics.monthlyRevenue ? Object.values(serviceAnalytics.monthlyRevenue).reduce((sum, val) => sum + val, 0).toLocaleString() : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  from completed service jobs
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{serviceJobs.length}</div>
                <p className="text-xs text-muted-foreground">
                  service jobs processed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{serviceJobs.filter(j => j.status !== "Completed").length}</div>
                <p className="text-xs text-muted-foreground">
                  in progress or pending
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Technician</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.entries(serviceAnalytics.technicianPerformance).length > 0
                    ? Object.entries(serviceAnalytics.technicianPerformance)
                        .sort((a, b) => b[1].completed - a[1].completed)[0][0]
                    : "-"}
                </div>
                <p className="text-xs text-muted-foreground">
                  most completed jobs
                </p>
              </CardContent>
            </Card>
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
            <div className="bg-card p-4 rounded-xl border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-warning" />
                <span className="text-sm text-muted-foreground">Pending</span>
              </div>
              <p className="text-2xl font-bold font-heading text-foreground">{pending}</p>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">In Progress</span>
              </div>
              <p className="text-2xl font-bold font-heading text-foreground">{inProgress}</p>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <span className="text-sm text-muted-foreground">Completed</span>
              </div>
              <p className="text-2xl font-bold font-heading text-foreground">{completed}</p>
            </div>
            <div className="bg-card p-4 rounded-xl border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-accent" />
                <span className="text-sm text-muted-foreground">Awaiting Parts</span>
              </div>
              <p className="text-2xl font-bold font-heading text-foreground">{awaitingParts}</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search service jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
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
                    className="bg-card rounded-xl border border-border/50 shadow-sm p-5 hover:shadow-md transition-shadow"
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
                                    try {
                                      await update(job.id, { status: newStatus });
                                      toast({ title: "Status updated successfully" });
                                      setEditingStatusId(null);
                                      setNewStatus(undefined);
                                    } catch (error) {
                                      toast({ title: "Error updating status", variant: "destructive" });
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


    </div>
  );
}
