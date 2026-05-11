import { useState } from 'react';
import { CreditCard, IndianRupee, Calendar, Search, ArrowRight, CheckCircle2, AlertCircle, History, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebaseCollections';
import { SaleOrder } from '@/types/firebase';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc, arrayUnion, increment, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export default function PaymentSchedules() {
  const { toast } = useToast();
  const { user, isStaff } = useAuth();
  const { data: salesData, loading: salesLoading } = useFirestoreCollection<SaleOrder>(COLLECTIONS.SALES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState<SaleOrder | null>(null);
  
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter for partial or pending sales
  const pendingSales = (salesData || [])
    .filter(sale => sale.payment !== 'Paid')
    .filter(sale => 
      sale.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.orderId?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleAddPayment = async () => {
    if (!selectedSale || paymentAmount <= 0) return;

    setIsProcessing(true);
    try {
      const saleRef = doc(db, COLLECTIONS.SALES, selectedSale.id);
      const newAmountPaid = (selectedSale.amountPaid || 0) + paymentAmount;
      const isNowPaid = newAmountPaid >= selectedSale.grandTotal;

      await updateDoc(saleRef, {
        amountPaid: increment(paymentAmount),
        payment: isNowPaid ? 'Paid' : 'Partial',
        paymentHistory: arrayUnion({
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          amount: paymentAmount,
          method: paymentMethod,
          notes: paymentNotes
        }),
        updatedAt: Timestamp.now()
      });

      toast({ title: "Payment recorded successfully!" });
      setSelectedSale(null);
      setPaymentAmount(0);
      setPaymentNotes('');
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to record payment", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (salesLoading) return <div className="flex items-center justify-center h-96"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="page-title">EMI & Payment Logistics</h1>
          <p className="text-muted-foreground text-sm">Track installments and manage payment collections for high-value sales.</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-lg">
           <div className="text-right">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Outstanding</p>
             <p className="text-sm font-bold text-rose-600">
               ₹{pendingSales.reduce((sum, sale) => sum + ((Number(sale?.grandTotal) || 0) - (Number(sale?.amountPaid) || 0)), 0).toLocaleString()}
             </p>
           </div>
           <div className="w-px h-8 bg-slate-200" />
           <CreditCard className="w-8 h-8 text-slate-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Pending Payments List */}
        <div className="lg:col-span-3 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by Customer or Order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-enhanced h-12"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {pendingSales.length === 0 ? (
               <div className="col-span-full text-center py-20 card-enhanced border-dashed">
                  <CheckCircle2 className="w-12 h-12 text-green-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold uppercase tracking-widest">All Payments Collected</p>
               </div>
             ) : (
               pendingSales.map(sale => {
                 const remaining = (Number(sale?.grandTotal) || 0) - (Number(sale?.amountPaid) || 0);
                 const progress = (Number(sale?.grandTotal) || 0) > 0 ? ((Number(sale?.amountPaid) || 0) / (Number(sale?.grandTotal) || 0)) * 100 : 0;
                 return (
                   <div key={sale.id} className="card-enhanced p-5 flex flex-col justify-between hover:border-primary/40 transition-all group">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                           <div className="bg-slate-100 p-2 rounded text-[10px] font-mono text-slate-500">{sale.orderId}</div>
                           <Badge variant={sale.payment === 'Pending' ? 'destructive' : 'outline'} className="text-[10px] font-black">
                             {sale.payment.toUpperCase()}
                           </Badge>
                        </div>
                        <h3 className="font-black text-slate-900 group-hover:text-primary transition-colors">{sale.customerName}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">Purchase Date: {sale.date}</p>
                        
                        <div className="mt-6 space-y-2">
                           <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                              <span className="text-slate-500">Collection Progress</span>
                              <span className="text-slate-900">{progress.toFixed(0)}%</span>
                           </div>
                           <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                           </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                         <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Remaining Balance</p>
                            <p className="text-lg font-black text-rose-600">₹{remaining.toLocaleString()}</p>
                         </div>
                          {isStaff && (
                            <Button size="sm" className="btn-primary h-9 px-4 text-[10px] font-bold uppercase tracking-widest" onClick={() => setSelectedSale(sale)}>
                               Add Payment
                            </Button>
                          )}
                      </div>
                   </div>
                 );
               })
             )}
          </div>
        </div>

        {/* Right: Payment Logs Widget */}
        <div className="space-y-6">
           <div className="card-enhanced p-6">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-6">
                 <History className="w-4 h-4 text-slate-400" />
                 Recent Collections
              </h2>
              <div className="space-y-4">
                 {salesData?.filter(s => s.paymentHistory && s.paymentHistory.length > 0)
                   .sort((a, b) => new Date(b.updatedAt?.toDate() || 0).getTime() - new Date(a.updatedAt?.toDate() || 0).getTime())
                   .slice(0, 5)
                   .map(sale => (
                     sale.paymentHistory?.slice(-1).map((pay, idx) => (
                        <div key={`${sale.id}-${idx}`} className="flex items-start gap-3 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                           <div className="bg-green-50 p-2 rounded">
                              <IndianRupee className="w-3.5 h-3.5 text-green-600" />
                           </div>
                           <div>
                              <p className="text-xs font-bold text-slate-900">₹{pay.amount.toLocaleString()}</p>
                              <p className="text-[10px] text-slate-500">from {sale.customerName}</p>
                              <p className="text-[9px] text-slate-400 uppercase font-medium mt-0.5">{pay.date} • {pay.method}</p>
                           </div>
                        </div>
                     ))
                   ))}
              </div>
           </div>

           <div className="bg-slate-900 text-white p-6 rounded-lg shadow-xl relative overflow-hidden">
              <AlertCircle className="absolute -right-4 -top-4 w-24 h-24 text-white/5 rotate-12" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-slate-400">Recovery Tips</h3>
              <ul className="space-y-3">
                 <li className="flex gap-2 items-start">
                    <div className="w-1 h-1 rounded-full bg-primary mt-1.5" />
                    <p className="text-[10px] text-slate-300 leading-relaxed">Follow up 2 days before the estimated EMI date for better collection rates.</p>
                 </li>
                 <li className="flex gap-2 items-start">
                    <div className="w-1 h-1 rounded-full bg-primary mt-1.5" />
                    <p className="text-[10px] text-slate-300 leading-relaxed">Offer a 2% "Early Bird" discount for full payments on premium cycles.</p>
                 </li>
              </ul>
           </div>
        </div>
      </div>

      {/* Payment Entry Dialog */}
      <Dialog open={!!selectedSale} onOpenChange={(open) => !open && setSelectedSale(null)}>
        <DialogContent className="max-w-md">
           <DialogHeader>
              <DialogTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                 <Plus className="w-5 h-5 text-primary" />
                 Record New Payment
              </DialogTitle>
           </DialogHeader>
           {selectedSale && (
             <div className="space-y-6 mt-4">
                <div className="bg-slate-50 p-4 rounded border border-slate-100">
                   <div className="flex justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Customer</span>
                      <span className="text-xs font-bold">{selectedSale.customerName}</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Total Bill</span>
                      <span className="text-xs font-bold">₹{selectedSale.grandTotal.toLocaleString()}</span>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Amount to Pay (₹)</Label>
                      <div className="relative">
                         <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                         <Input 
                          type="number" 
                          value={paymentAmount} 
                          onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                          className="pl-10 h-12 text-lg font-black"
                          placeholder="Enter amount"
                         />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Payment Method</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                         <SelectTrigger className="h-10">
                            <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="UPI">UPI / GPay</SelectItem>
                            <SelectItem value="Card">Credit/Debit Card</SelectItem>
                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                            <SelectItem value="Cheque">Cheque</SelectItem>
                         </SelectContent>
                      </Select>
                   </div>

                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Notes</Label>
                      <textarea 
                        className="w-full mt-1 min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={paymentNotes} 
                        onChange={(e) => setPaymentNotes(e.target.value)}
                        placeholder="e.g. 2nd Installment, cheque no #123..."
                      />
                   </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-3">
                   <Button variant="outline" className="flex-1 h-11 text-xs font-bold uppercase tracking-widest" onClick={() => setSelectedSale(null)}>Cancel</Button>
                   <Button 
                    className="flex-[2] btn-primary h-11 text-xs font-black uppercase tracking-[0.2em] shadow-lg"
                    onClick={handleAddPayment}
                    disabled={isProcessing || paymentAmount <= 0}
                   >
                     {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Collection'}
                   </Button>
                </div>
             </div>
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
