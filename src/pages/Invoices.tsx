import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, Plus, FileText, Download, Printer, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Invoice } from "@/types/firebase";
import { useToast } from "@/hooks/use-toast";

const statusClasses = {
  Paid: "bg-success/10 text-success",
  Pending: "bg-warning/10 text-warning",
  Overdue: "bg-destructive/10 text-destructive",
  Draft: "bg-muted text-muted-foreground",
};

export default function Invoices() {
  const location = useLocation();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  useEffect(() => {
    if (location.pathname === "/invoices/new") {
      setIsAddOpen(true);
    }
  }, [location.pathname]);
  const [newInvoice, setNewInvoice] = useState<Omit<Invoice, "id">>({
    invoiceNumber: "",
    customer: "",
    date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    dueDate: "",
    amount: 0,
    status: "Pending",
  });

  const { data: invoices, loading, add } = useFirestoreCollection<Invoice>(COLLECTIONS.INVOICES);
  const { toast } = useToast();

  const handleAddInvoice = async () => {
    try {
      await add({
        ...newInvoice,
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      });
      setIsAddOpen(false);
      setNewInvoice({ invoiceNumber: "", customer: "", date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }), dueDate: "", amount: 0, status: "Pending" });
      toast({ title: "Invoice created" });
    } catch (error) {
      toast({ title: "Error creating invoice", variant: "destructive" });
    }
  };

  const handleViewInvoice = (invoiceId: string) => {
    navigate(`/invoices/view/${invoiceId}`);
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      // Create a simple invoice content for download
      const content = `INVOICE\n${'='.repeat(50)}\n\nInvoice Number: ${invoice.invoiceNumber}\nCustomer: ${invoice.customer}\nDate: ${invoice.date}\nDue Date: ${invoice.dueDate}\nAmount: ₹${invoice.amount?.toLocaleString()}\nStatus: ${invoice.status}\n\n${'='.repeat(50)}\nThank you for your business!`;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({ title: "Invoice downloaded successfully" });
    } catch (error) {
      toast({ title: "Unable to download invoice", variant: "destructive" });
    }
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    // Open print-friendly window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice - ${invoice.invoiceNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
              h1 { color: #333; border-bottom: 3px solid #000; padding-bottom: 15px; }
              .invoice-details { margin: 30px 0; padding: 20px; background: #f9f9f9; border-radius: 8px; }
              .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
              .label { font-weight: bold; color: #666; }
              .value { color: #333; font-weight: 500; }
              .amount { font-size: 24px; color: #000; font-weight: bold; }
              .footer { margin-top: 40px; text-align: center; color: #999; font-size: 14px; }
              @media print {
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>INVOICE</h1>
            <div class="invoice-details">
              <div class="detail-row">
                <span class="label">Invoice Number:</span>
                <span class="value">${invoice.invoiceNumber}</span>
              </div>
              <div class="detail-row">
                <span class="label">Customer:</span>
                <span class="value">${invoice.customer}</span>
              </div>
              <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">${invoice.date}</span>
              </div>
              <div class="detail-row">
                <span class="label">Due Date:</span>
                <span class="value">${invoice.dueDate}</span>
              </div>
              <div class="detail-row">
                <span class="label">Status:</span>
                <span class="value">${invoice.status}</span>
              </div>
              <div class="detail-row">
                <span class="label">Amount:</span>
                <span class="amount">₹${invoice.amount?.toLocaleString()}</span>
              </div>
            </div>
            <div class="footer">
              <p>Thank you for your business!</p>
              <button onclick="window.print()" style="margin-top: 20px; padding: 10px 30px; cursor: pointer;">Print</button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAmount = invoices.reduce((acc, i) => acc + (i.amount || 0), 0);
  const pendingAmount = invoices.filter(i => i.status === "Pending").reduce((acc, i) => acc + (i.amount || 0), 0);
  const overdueAmount = invoices.filter(i => i.status === "Overdue").reduce((acc, i) => acc + (i.amount || 0), 0);

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
          <h1 className="page-title text-foreground">Invoices</h1>
          <p className="text-muted-foreground mt-1">
            Generate and manage customer invoices
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Customer Name</Label>
                <Input value={newInvoice.customer} onChange={(e) => setNewInvoice({ ...newInvoice, customer: e.target.value })} />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input value={newInvoice.dueDate} onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })} placeholder="e.g. Jan 24, 2025" />
              </div>
              <div>
                <Label>Amount (₹)</Label>
                <Input type="number" value={newInvoice.amount} onChange={(e) => setNewInvoice({ ...newInvoice, amount: parseInt(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={newInvoice.status} onValueChange={(v: "Paid" | "Pending" | "Overdue" | "Draft") => setNewInvoice({ ...newInvoice, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddInvoice} className="w-full">Create Invoice</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-xl border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Total Invoices</span>
          </div>
          <p className="text-2xl font-bold font-heading text-foreground">{invoices.length}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border/50">
          <p className="text-sm text-muted-foreground">Total Amount</p>
          <p className="text-2xl font-bold font-heading text-foreground">₹{totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border/50">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold font-heading text-warning">₹{pendingAmount.toLocaleString()}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border/50">
          <p className="text-sm text-muted-foreground">Overdue</p>
          <p className="text-2xl font-bold font-heading text-destructive">₹{overdueAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search invoices..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="hidden md:table-cell">Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No invoices found. Create your first invoice!
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-secondary/30">
                    <TableCell className="font-mono text-sm">{invoice.invoiceNumber}</TableCell>
                    <TableCell className="font-medium">{invoice.customer}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {invoice.date}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {invoice.dueDate}
                    </TableCell>
                    <TableCell className="font-semibold">₹{invoice.amount?.toLocaleString()}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusClasses[invoice.status as keyof typeof statusClasses] || statusClasses.Pending
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => handleViewInvoice(invoice.id)}
                          title="View invoice"
                          aria-label="View invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => handleDownloadInvoice(invoice)}
                          title="Download invoice"
                          aria-label="Download invoice"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hidden sm:inline-flex" 
                          onClick={() => handlePrintInvoice(invoice)}
                          title="Print invoice"
                          aria-label="Print invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
