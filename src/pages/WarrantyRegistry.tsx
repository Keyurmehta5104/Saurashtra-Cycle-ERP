import { useState, useMemo } from 'react';
import { ShieldCheck, Search, Bike, User, Calendar, FileText, Printer, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebaseCollections';
import { SaleOrder } from '@/types/firebase';

export default function WarrantyRegistry() {
  const { data: salesData, loading: salesLoading } = useFirestoreCollection<SaleOrder>(COLLECTIONS.SALES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState<SaleOrder | null>(null);

  // Filter sales that have a frame number and match search
  const registry = useMemo(() => {
    return (salesData || [])
      .filter(sale => sale.frameNo && sale.frameNo.trim() !== '')
      .filter(sale => 
        sale.frameNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.orderId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [salesData, searchQuery]);

  const getWarrantyStatus = (saleDate: string) => {
    const purchaseDate = new Date(saleDate);
    const today = new Date();
    const oneYearLater = new Date(purchaseDate);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1); // Default 1 year warranty

    if (today > oneYearLater) {
      return { status: 'Expired', color: 'text-rose-600 bg-rose-50 border-rose-200', icon: XCircle };
    }
    
    // Check if expiring in next 30 days
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    if (oneYearLater < thirtyDaysFromNow) {
      return { status: 'Expiring Soon', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: AlertCircle };
    }

    return { status: 'Active', color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle };
  };

  if (salesLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 max-w-[1400px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="page-title">Warranty & Frame Registry</h1>
          <p className="text-muted-foreground text-sm">Verify cycle ownership and warranty status via Frame Number.</p>
        </div>
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 px-4 py-3 rounded-lg">
          <ShieldCheck className="w-6 h-6 text-blue-600" />
          <div className="text-sm font-bold text-blue-900 uppercase tracking-tighter">Trusted Digital Registry</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Search and List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by Frame Number or Customer Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-enhanced h-12 text-base"
            />
          </div>

          <div className="space-y-3">
            {registry.length === 0 ? (
              <div className="text-center py-20 card-enhanced bg-slate-50/50">
                <Bike className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No cycles found in registry.</p>
                <p className="text-xs text-slate-400 mt-1">Make sure frame numbers are entered during checkout.</p>
              </div>
            ) : (
              registry.map(sale => {
                const config = getWarrantyStatus(sale.date);
                const StatusIcon = config.icon;
                return (
                  <div 
                    key={sale.id} 
                    onClick={() => setSelectedSale(sale)}
                    className={`card-enhanced p-5 cursor-pointer transition-all hover:border-primary group ${selectedSale?.id === sale.id ? 'border-primary ring-1 ring-primary/10 bg-primary/5' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-100 p-3 rounded group-hover:bg-primary/10 transition-colors">
                          <Bike className="w-5 h-5 text-slate-500 group-hover:text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Frame No</p>
                          <p className="text-sm font-black text-slate-900 group-hover:text-primary">{sale.frameNo}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${config.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {config.status}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold text-slate-600">{sale.customerName}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400">{sale.date}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Detailed View / Certificate */}
        <div>
          {selectedSale ? (
            <div className="space-y-6 sticky top-8">
              <div className="card-enhanced p-8 bg-white shadow-2xl border-t-4 border-t-primary">
                <div className="text-center mb-8">
                  <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Warranty Certificate</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Saurashtra Cycle Hub</p>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Product</span>
                    <span className="text-xs font-black text-slate-900">{selectedSale.brand || 'Cycle'} {selectedSale.model || ''}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Owner</span>
                    <span className="text-xs font-black text-slate-900">{selectedSale.customerName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Purchase Date</span>
                    <span className="text-xs font-black text-slate-900">{selectedSale.date}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Frame ID</span>
                    <span className="text-xs font-black text-primary">{selectedSale.frameNo}</span>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-dashed border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                    <Badge className={getWarrantyStatus(selectedSale.date).color + " shadow-none"}>
                      {getWarrantyStatus(selectedSale.date).status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-[9px] text-slate-400 text-center italic mt-6 leading-relaxed">
                    This digital certificate serves as proof of ownership and warranty eligibility for 12 months from the date of purchase.
                  </p>
                </div>

                <Button className="w-full mt-8 btn-primary h-12 font-bold uppercase tracking-widest">
                  <Printer className="w-4 h-4 mr-2" />
                  Print Certificate
                </Button>
              </div>

              <div className="bg-slate-900 text-white p-6 rounded-lg shadow-xl">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-slate-400">Ownership History</h4>
                 <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <p className="text-[11px] font-bold">Sold to {selectedSale.customerName} on {selectedSale.date}</p>
                 </div>
                 <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">
                   This frame is uniquely registered to the customer profile. No transfers are currently logged in the system.
                 </p>
              </div>
            </div>
          ) : (
            <div className="card-enhanced p-10 border-dashed flex flex-col items-center justify-center text-center">
              <FileText className="w-12 h-12 text-slate-200 mb-4" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Select a cycle</p>
              <p className="text-xs text-slate-400 mt-1">To view certificate details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
