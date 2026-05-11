import { useState } from 'react'; // Rebuild trigger
import { Package, Plus, Trash2, Wrench, ArrowRight, Save, History, Search, Loader2, IndianRupee, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebaseCollections';
import { InventoryItem } from '@/types/firebase';
import { useToast } from '@/hooks/use-toast';
import { writeBatch, doc, increment, Timestamp, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface AssemblyComponent {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitCost: number;
}

export default function Assembly() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: inventoryData, loading: inventoryLoading } = useFirestoreCollection<InventoryItem>(COLLECTIONS.INVENTORY);
  
  const [targetProduct, setTargetProduct] = useState<InventoryItem | null>(null);
  const [components, setComponents] = useState<AssemblyComponent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [laborCost, setLaborCost] = useState(0);
  const [assemblyCount, setAssemblyCount] = useState(1);
  const [productSearch, setProductSearch] = useState('');
  const [partSearch, setPartSearch] = useState('');

  const addComponent = (item: InventoryItem) => {
    const existing = components.find(c => c.productId === item.id);
    if (existing) {
      setComponents(components.map(c => 
        c.productId === item.id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setComponents([...components, {
        productId: item.id,
        name: item.name,
        sku: item.sku,
        quantity: 1,
        unitCost: item.cost || 0
      }]);
    }
  };

  const removeComponent = (productId: string) => {
    setComponents(components.filter(c => c.productId !== productId));
  };

  const totalComponentCost = components.reduce((sum, c) => sum + (c.unitCost * c.quantity), 0);
  const totalCost = (totalComponentCost + laborCost) * assemblyCount;

  const handleProcessAssembly = async () => {
    if (!targetProduct || components.length === 0) return;

    // Check stock for all components
    for (const comp of components) {
      const invItem = inventoryData.find(i => i.id === comp.productId);
      if (!invItem || invItem.stock < (comp.quantity * assemblyCount)) {
        toast({
          title: "Insufficient Stock",
          description: `Not enough ${comp.name} in stock.`,
          variant: "destructive"
        });
        return;
      }
    }

    setIsProcessing(true);
    try {
      const batch = writeBatch(db);

      // 1. Deduct components
      for (const comp of components) {
        const compRef = doc(db, COLLECTIONS.INVENTORY, comp.productId);
        batch.update(compRef, {
          stock: increment(-(comp.quantity * assemblyCount)),
          updatedAt: Timestamp.now()
        });

        // Log to ledger
        const ledgerRef = doc(collection(db, COLLECTIONS.STOCK_LEDGER));
        batch.set(ledgerRef, {
          productId: comp.productId,
          productName: comp.name,
          sku: comp.sku,
          changeType: "manual_adjustment",
          quantity: -(comp.quantity * assemblyCount),
          notes: `Used in assembly for ${targetProduct.name}`,
          changedBy: user?.displayName || "system",
          date: Timestamp.now()
        });
      }

      // 2. Add finished product
      const productRef = doc(db, COLLECTIONS.INVENTORY, targetProduct.id);
      batch.update(productRef, {
        stock: increment(assemblyCount),
        cost: totalCost / assemblyCount, // Update cost based on assembly components
        updatedAt: Timestamp.now()
      });

      // Log to ledger
      const productLedgerRef = doc(collection(db, COLLECTIONS.STOCK_LEDGER));
      batch.set(productLedgerRef, {
        productId: targetProduct.id,
        productName: targetProduct.name,
        sku: targetProduct.sku,
        changeType: "manual_adjustment",
        quantity: assemblyCount,
        notes: `Assembled from parts`,
        changedBy: user?.displayName || "system",
        date: Timestamp.now()
      });

      await batch.commit();
      toast({ title: "Assembly completed successfully!" });
      setComponents([]);
      setTargetProduct(null);
      setLaborCost(0);
      setAssemblyCount(1);
    } catch (error) {
      console.error(error);
      toast({ title: "Assembly failed", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (inventoryLoading) return <div className="flex items-center justify-center h-96"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="page-title">Production & Assembly</h1>
          <p className="text-muted-foreground text-sm">Convert parts and labor into finished bicycle inventory.</p>
        </div>
        <Button variant="outline" className="h-10 text-xs font-bold uppercase tracking-widest border-slate-200">
           <History className="w-4 h-4 mr-2" />
           Assembly Logs
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step 1: Finished Product Selection */}
        <div className="space-y-6">
          <div className="card-enhanced p-6">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              1. Target Product
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-slate-500">Select bike to build</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <Input 
                    placeholder="Search bike model..." 
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-8 h-8 text-xs" 
                  />
                </div>
              </div>
              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                {inventoryData
                  .filter(i => i.category === 'Bicycles' || i.category === 'Finished Goods')
                  .filter(i => i.name.toLowerCase().includes(productSearch.toLowerCase()) || i.sku.toLowerCase().includes(productSearch.toLowerCase()))
                  .map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => setTargetProduct(item)}
                    className={`p-3 rounded border text-sm cursor-pointer transition-all ${targetProduct?.id === item.id ? 'border-primary bg-primary/5 font-bold text-primary' : 'hover:border-slate-300'}`}
                  >
                    {item.name}
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">SKU: {item.sku} | Stock: {item.stock}</div>
                  </div>
                ))}
              </div>
              {targetProduct && (
                <div className="pt-4 mt-4 border-t border-slate-100">
                   <Label className="text-xs uppercase font-bold text-slate-500">How many to build?</Label>
                   <Input 
                    type="number" 
                    min="1" 
                    value={assemblyCount} 
                    onChange={(e) => setAssemblyCount(parseInt(e.target.value) || 1)}
                    className="mt-2 input-enhanced"
                   />
                </div>
              )}
            </div>
          </div>

          <div className="card-enhanced p-6 bg-slate-900 text-white">
            <h2 className="text-xs font-black uppercase tracking-widest mb-6 text-slate-400">Production Costing</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-bold uppercase">Component Cost</span>
                <span className="text-sm font-bold">₹{(totalComponentCost * assemblyCount).toLocaleString()}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <Label className="text-[10px] text-slate-400 font-bold uppercase">Labor / Assembly Fee (Per Unit)</Label>
                </div>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <Input 
                    type="number" 
                    value={laborCost} 
                    onChange={(e) => setLaborCost(parseInt(e.target.value) || 0)}
                    className="pl-9 h-9 bg-slate-800 border-slate-700 text-white text-xs"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-200 font-bold uppercase">Final Cost Estimate</span>
                <span className="text-xl font-black text-primary">₹{totalCost.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Components List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-enhanced p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Wrench className="w-4 h-4 text-primary" />
                2. Components & Parts
              </h2>
              <Badge variant="outline" className="text-[10px] font-black">{components.length} Items Selected</Badge>
            </div>

            <div className="space-y-4">
              {components.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-lg">
                  <Wrench className="w-10 h-10 text-slate-100 mx-auto mb-3" />
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Select parts from the right panel</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {components.map(comp => (
                    <div key={comp.productId} className="flex items-center justify-between p-4 bg-slate-50 rounded border border-slate-200">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">{comp.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-medium">SKU: {comp.sku} | Unit Cost: ₹{comp.unitCost}</p>
                      </div>
                      <div className="flex items-center gap-6">
                         <div className="flex items-center gap-2">
                           <Label className="text-[10px] font-black text-slate-400 uppercase">Qty</Label>
                           <Input 
                            type="number" 
                            min="1" 
                            value={comp.quantity} 
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              setComponents(components.map(c => c.productId === comp.productId ? { ...c, quantity: val } : c));
                            }}
                            className="w-16 h-8 text-xs text-center font-bold"
                           />
                         </div>
                         <Button variant="ghost" size="sm" onClick={() => removeComponent(comp.productId)} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                           <Trash2 className="w-4 h-4" />
                         </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                 <div className="card-enhanced p-4 bg-slate-50/50">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">Available Parts</Label>
                    <div className="relative mb-3">
                       <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                       <Input 
                        placeholder="Quick filter parts..." 
                        value={partSearch}
                        onChange={(e) => setPartSearch(e.target.value)}
                        className="pl-7 h-8 text-xs" 
                       />
                    </div>
                    <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
                       {inventoryData
                        .filter(i => i.category !== 'Bicycles' && i.category !== 'Finished Goods')
                        .filter(i => i.name.toLowerCase().includes(partSearch.toLowerCase()) || i.sku.toLowerCase().includes(partSearch.toLowerCase()))
                        .map(item => (
                         <div 
                          key={item.id} 
                          className="flex items-center justify-between p-2 hover:bg-white rounded border border-transparent hover:border-slate-200 cursor-pointer group"
                          onClick={() => addComponent(item)}
                         >
                           <div>
                              <p className="text-xs font-bold text-slate-700">{item.name}</p>
                              <p className="text-[9px] text-slate-400">Stock: {item.stock}</p>
                           </div>
                           <Plus className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary transition-colors" />
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="flex flex-col justify-end">
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
                       <div className="flex gap-2 text-amber-800">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <p className="text-[11px] font-bold leading-relaxed uppercase tracking-tight">
                            Critical: Stock will be deducted immediately upon assembly. Ensure all parts are physically present.
                          </p>
                       </div>
                    </div>
                    <Button 
                      onClick={handleProcessAssembly}
                      disabled={!targetProduct || components.length === 0 || isProcessing}
                      className="w-full btn-primary h-14 text-sm font-black uppercase tracking-[0.2em] shadow-xl"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Building...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          Finalize Production
                        </>
                      )}
                    </Button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
