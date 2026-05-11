import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useFirestoreCollection } from "@/hooks/useFirestore";
import { COLLECTIONS } from "@/lib/firebaseCollections";
import { StockLedgerEntry, InventoryItem } from "@/types/firebase";
import { format } from "date-fns";
import { Loader2, History } from "lucide-react";

interface StockHistoryDialogProps {
  item: InventoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockHistoryDialog({ item, open, onOpenChange }: StockHistoryDialogProps) {
  const { data: ledgerEntries, loading } = useFirestoreCollection<StockLedgerEntry>(COLLECTIONS.STOCK_LEDGER);

  const productHistory = React.useMemo(() => {
    if (!item || !ledgerEntries) return [];
    return ledgerEntries
      .filter(entry => entry.productId === item.id)
      .sort((a, b) => (b.date?.toMillis() || 0) - (a.date?.toMillis() || 0));
  }, [item, ledgerEntries]);

  const getChangeTypeBadge = (type: StockLedgerEntry["changeType"]) => {
    switch (type) {
      case "sale":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Sale</Badge>;
      case "purchase_received":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Purchase</Badge>;
      case "manual_adjustment":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Manual</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Stock History: {item?.name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">SKU: {item?.sku} | Current Stock: {item?.stock}</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto mt-4 border rounded-md">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : productHistory.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No stock movement history found for this product.
            </div>
          ) : (
            <Table className="table-enhanced">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead className="text-right">Before</TableHead>
                  <TableHead className="text-right">After</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productHistory.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap">
                      {entry.date ? format(entry.date.toDate(), "dd MMM yyyy, HH:mm") : "-"}
                    </TableCell>
                    <TableCell>{getChangeTypeBadge(entry.changeType)}</TableCell>
                    <TableCell className={`text-right font-medium ${entry.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                      {entry.quantity > 0 ? "+" : ""}{entry.quantity}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{entry.stockBefore}</TableCell>
                    <TableCell className="text-right font-bold">{entry.stockAfter}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={entry.notes}>
                      {entry.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
