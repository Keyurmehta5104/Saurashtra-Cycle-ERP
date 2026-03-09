import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInvoices } from "@/hooks/useFirestore";
import { Invoice } from "@/types/firebase";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusClasses = {
  Paid: "bg-success/10 text-success",
  Pending: "bg-warning/10 text-warning",
  Overdue: "bg-destructive/10 text-destructive",
  Draft: "bg-muted text-muted-foreground",
};

export default function InvoiceView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: invoices, loading } = useInvoices();
  
  // Find the specific invoice by ID
  const invoice = (invoices as Invoice[]).find(inv => inv.id === id);

  const handleDownload = () => {
    if (!invoice) return;
    
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
  };

  const handlePrint = () => {
    if (!invoice) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice - ${invoice.invoiceNumber}</title>\n            <style>
              body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
              h1 { color: #333; border-bottom: 3px solid #000; padding-bottom: 15px; }
              .invoice-details { margin: 30px 0; padding: 20px; background: #f9f9f9; border-radius: 8px; }
              .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
              .label { font-weight: bold; color: #666; }
              .value { color: #333; font-weight: 500; }
              .amount { font-size: 24px; color: #000; font-weight: bold; }
              .footer { margin-top: 40px; text-align: center; color: #999; font-size: 14px; }
              @media print { button { display: none; } }
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
      setTimeout(() => printWindow.print(), 250);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-muted-foreground">Invoice not found</p>
          <Button onClick={() => navigate("/invoices")} className="mt-4">
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => navigate("/invoices")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Invoice Details</CardTitle>
            <Badge className={statusClasses[invoice.status as keyof typeof statusClasses] || statusClasses.Pending}>
              {invoice.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Invoice Number</h3>
              <p className="text-lg font-semibold">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Customer</h3>
              <p className="text-lg font-semibold">{invoice.customer}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Date</h3>
              <p className="text-lg font-semibold">{invoice.date}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Due Date</h3>
              <p className="text-lg font-semibold">{invoice.dueDate}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Amount</h3>
                <p className="text-3xl font-bold text-primary">₹{invoice.amount?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
