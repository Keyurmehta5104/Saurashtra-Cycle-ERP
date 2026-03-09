import { FileText, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SaleOrder, PurchaseOrder, LineItem } from "@/types/firebase";

interface InvoiceGeneratorProps {
  open: boolean;
  onClose: () => void;
  type: "sales" | "purchase";
  data: SaleOrder | PurchaseOrder;
}

export function InvoiceGenerator({ open, onClose, type, data }: InvoiceGeneratorProps) {
  const isSale = type === "sales";
  const saleData = isSale ? (data as SaleOrder) : null;
  const purchaseData = !isSale ? (data as PurchaseOrder) : null;

  const subtotal = typeof data.subtotal === "number" ? data.subtotal : 0;
  const tax = typeof data.tax === "number" ? data.tax : 0;
  const grandTotal = isSale ? saleData?.grandTotal ?? 0 : purchaseData?.total ?? 0;
  const sgst = tax / 2;
  const cgst = tax / 2;

  const now = new Date();
  const invoiceDate = isSale
    ? saleData?.date ?? now.toLocaleDateString("en-IN")
    : purchaseData?.orderDate ?? now.toLocaleDateString("en-IN");
  const invoiceNumber = isSale ? saleData?.invoiceNo ?? saleData?.orderId ?? "-" : purchaseData?.invoiceNo ?? purchaseData?.poNumber ?? "-";
  const bookNumber = isSale ? saleData?.bookNo ?? "1" : purchaseData?.bookNo ?? "P-1";
  const partyName = isSale ? saleData?.customerName ?? "-" : purchaseData?.supplier ?? "-";
  const partyPhone = isSale ? saleData?.customerPhone : purchaseData?.supplierPhone;
  const lineItems = data.lineItems ?? [];
  const leadItem = lineItems[0];
  const billBrand = data.brand || leadItem?.productName || "-";
  const billModel = data.model || leadItem?.sku || "-";
  const billColour = data.colour || "-";
  const billSize = data.size || "-";
  const billFrameNo = data.frameNo || leadItem?.sku || "-";
  const partyGstin = data.partyGstin || "-";
  const particulars = [
    { label: "SEAT", value: data.seat || "-" },
    { label: "CARRIER", value: data.carrier || "-" },
    { label: "STAND DOUBLE / SIDE", value: data.standDoubleSide || "-" },
    { label: "LOCK", value: data.lock || "-" },
    { label: "CHAIN COVER", value: data.chainCover || "-" },
  ];
  const dealerBrands = ["HERCULES", "BSA", "KROSS", "TATA STRYDER", "AVON", "HERO CYCLES", "ROADEO", "NEXT"]; 
  const gujaratiTerms = [
    " સાઇકલ જોઈ તપાસીને લઈ જવી.",
    " નવી સાઇકલમાં ગેરંટી ૬ માસની હોય છે, જેમાં મેન્યુફેક્ચરિંગ ડિફેક્ટ્સ હશે, ફ્રી રિપેરિંગ મળશે.",
    " ઓઇલ, ટાયર, ટ્યુબ, બ્રેક, વાયર, ચેન, ગિયર વગેરે પર ગેરંટી આપવામાં આવતી નથી.",
    " સાઇકલ સર્વિસ કરાવવી સમયસર કરાવવી.",
    " ખરીદીની તારીખથી ૩૦ દિવસમાં એક વખત ચેક કરાવી જવી.",
    " વેચાયેલ માલ પાછો લેવાશે નહીં.",
    " રાજકોટ કોર્ટને આધિન."
  ];

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const buildPrintMarkup = () => {
    const printContent = document.getElementById("invoice-content");
    if (!printContent) return null;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>${isSale ? "Sales Invoice" : "Purchase Invoice"} - ${invoiceNumber}</title>
          <style>
            :root {
              --border-main: 3px solid #000;
              --border-sub: 2px solid #000;
            }
            * { box-sizing: border-box; }
            html, body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body {
              margin: 0;
              padding: 12px;
              background: #f2f2f2;
              font-family: Arial, "Nirmala UI", "Shruti", "Noto Sans Gujarati", sans-serif;
              color: #111;
            }
            .invoice-sheet {
              border: var(--border-main) !important;
              width: 100%;
              max-width: 960px;
              margin: 0 auto;
              background: #fff;
              border: var(--border-main);
              border-radius: 2px;
              overflow: hidden;
            }
            .invoice-top {
              border-bottom: var(--border-main) !important;
              display: grid;
              grid-template-columns: 1.1fr 2fr 1.2fr;
              border-bottom: var(--border-main);
            }
            .top-cell {
              border-right: var(--border-main) !important;
              border-right: var(--border-main);
              padding: 10px;
              min-height: 96px;
            }
            .top-cell:last-child { border-right: none; }
            .tax-badge {
              display: inline-block;
              background: #111;
              color: #fff;
              font-weight: 700;
              font-size: 12px;
              padding: 4px 8px;
              margin-bottom: 8px;
            }
            .agency {
              color: #d71f26;
              font-size: 26px;
              font-weight: 900;
              line-height: 1;
              margin-top: 4px;
            }
            .sub-title {
              font-size: 12px;
              letter-spacing: 0.4px;
              font-weight: 700;
              margin-top: 2px;
            }
            .address-title {
              font-size: 12px;
              font-weight: 700;
              margin-bottom: 4px;
            }
            .address-body {
              font-size: 12px;
              line-height: 1.45;
            }
            .memo-title {
              background: #111;
              color: #fff;
              text-align: center;
              font-size: 12px;
              font-weight: 700;
              padding: 5px 0;
              margin: -10px -10px 8px -10px;
            }
            .meta-row {
              display: flex;
              justify-content: space-between;
              gap: 8px;
              font-size: 12px;
              padding: 2px 0;
            }
            .party-row {
              border-bottom: var(--border-main) !important;
              display: grid;
              grid-template-columns: 85px 1fr;
              border-bottom: var(--border-main);
            }
            .party-row div {
              border-right: var(--border-main) !important;
              border-right: var(--border-main);
              padding: 8px 10px;
              font-size: 12px;
            }
            .party-row div:last-child { border-right: none; }
            .invoice-main {
              display: grid;
              grid-template-columns: 2.2fr 1fr;
              min-height: 360px;
            }
            .left-grid {
              border-right: var(--border-main) !important;
              border-right: var(--border-main);
              display: grid;
              grid-template-rows: auto 1fr auto;
            }
            .brand-table {
              width: 100%;
              border-collapse: collapse;
              border-left: var(--border-sub);
              border-top: var(--border-sub);
            }
            .brand-table th,
            .brand-table td {
              border-bottom: var(--border-sub) !important;
              border-right: var(--border-sub) !important;
              font-size: 12px;
              padding: 6px 8px;
              text-align: left;
            }
            .brand-table th:last-child,
            .brand-table td:last-child { border-right: none; text-align: right; }
            .brand-table th { background: #f8f8f8; font-weight: 700; }
            .particulars table {
              width: 100%;
              border-collapse: collapse;
              border-left: var(--border-sub);
              border-top: var(--border-sub);
            }
            .particulars td {
              border-bottom: var(--border-sub) !important;
              border-right: var(--border-sub) !important;
              padding: 6px 8px;
              font-size: 12px;
              height: 28px;
            }
            .particulars td:last-child { border-right: none; }
            .frame-row {
              border-top: var(--border-sub) !important;
              border-top: var(--border-sub);
              padding: 8px 10px;
              font-size: 12px;
            }
            .right-box {
              display: grid;
              grid-template-rows: auto auto auto 1fr auto;
            }
            .right-cell {
              border-bottom: var(--border-sub) !important;
              padding: 8px 10px;
              font-size: 12px;
            }
            .right-cell:last-child { border-bottom: none; }
            .row-title { font-weight: 700; margin-right: 8px; }
            .grand-total {
              background: #111;
              color: #fff;
              font-size: 16px;
              font-weight: 800;
              text-align: center;
              padding: 10px;
            }
            .dealer-panel {
              border-top: var(--border-main) !important;
              border-bottom: var(--border-main) !important;
              border-top: var(--border-main);
              border-bottom: var(--border-main);
              padding: 10px;
            }
            .dealer-title {
              font-size: 12px;
              font-weight: 700;
              margin-bottom: 8px;
            }
            .dealer-grid {
              display: grid;
              grid-template-columns: repeat(4, minmax(0, 1fr));
              gap: 6px;
            }
            .dealer-chip {
              border: var(--border-sub);
              border-radius: 2px;
              padding: 7px 6px;
              text-align: center;
              font-size: 11px;
              font-weight: 700;
              background: #fafafa;
            }
            .terms-box {
              border-bottom: var(--border-main) !important;
              padding: 10px;
              border-bottom: var(--border-main);
            }
            .terms-title {
              font-size: 12px;
              font-weight: 700;
              margin-bottom: 6px;
            }
            .terms-list {
              font-family: "Nirmala UI", "Shruti", "Noto Sans Gujarati", sans-serif;
              margin: 0;
              padding-left: 18px;
              font-size: 11px;
              line-height: 1.45;
            }
            .footer-strip {
              border-top: var(--border-main) !important;
              background: #d71f26;
              color: #fff;
              text-align: center;
              font-weight: 700;
              font-size: 12px;
              letter-spacing: 0.3px;
              padding: 8px 10px;
              border-top: var(--border-main);
            }
            @media print {
              @page { size: A4 portrait; margin: 8mm; }
              body { background: #fff; padding: 0; }
              .invoice-sheet {
              border: var(--border-main) !important;
                border-radius: 0;
                margin: 0;
                max-width: none;
                page-break-inside: avoid;
              }
              .invoice-sheet,
              .invoice-sheet * {
                border-color: #000 !important;
              }
              .invoice-main,
              .dealer-panel,
              .terms-box {
              border-bottom: var(--border-main) !important;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `;
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const markup = buildPrintMarkup();
    if (!markup) return;

    printWindow.document.write(markup);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const markup = buildPrintMarkup();
    if (!markup) return;

    printWindow.document.write(markup);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {isSale ? "Sales Invoice" : "Purchase Invoice"}
            </span>
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
          </DialogTitle>
        </DialogHeader>

        <div id="invoice-content" className="invoice-sheet bg-white text-foreground border-2 border-black rounded-lg overflow-hidden">
          <div className="invoice-top grid grid-cols-[1.1fr_2fr_1.2fr] border-b-2 border-black">
            <div className="top-cell border-r-2 border-black p-3">
              <div className="tax-badge inline-block bg-black text-white text-[11px] font-bold px-2 py-1 mb-2">
                {isSale ? "TAX INVOICE" : "PURCHASE BILL"}
              </div>
              <p className="text-[11px] text-muted-foreground">Ride the Best One</p>
              <p className="agency text-2xl font-black text-red-700 leading-tight mt-1">SAURASHTRA</p>
              <p className="sub-title text-xs font-bold tracking-wide">CYCLE AGENCY</p>
            </div>

            <div className="top-cell border-r-2 border-black p-3">
              <p className="address-title text-xs font-bold mb-1">Shop No. 1, Near Malaviya Petrol Pump, Gondal Road, Rajkot - 360002</p>
              <p className="address-body text-xs leading-5">
                GSTIN: 24AAMFS6959C1ZW
                <br />
                Contact: 2460410
                <br />
                Authorized dealer for leading cycle brands.
              </p>
            </div>

            <div className="top-cell p-3">
              <div className="memo-title bg-black text-white text-center text-xs font-bold py-1 -mx-3 -mt-3 mb-2">
                CASH / DEBIT MEMO
              </div>
              <div className="meta-row flex justify-between text-xs">
                <span>BOOK NO.</span>
                <span>{bookNumber}</span>
              </div>
              <div className="meta-row flex justify-between text-xs">
                <span>INVOICE</span>
                <span>{invoiceNumber}</span>
              </div>
              <div className="meta-row flex justify-between text-xs">
                <span>DATE</span>
                <span>{invoiceDate}</span>
              </div>
            </div>
          </div>

          <div className="party-row grid grid-cols-[90px_1fr] border-b-2 border-black">
            <div className="border-r-2 border-black p-2 text-xs font-semibold">NAME</div>
            <div className="p-2 text-xs">
              <div>
                {partyName}
                {partyPhone ? ` (${partyPhone})` : ""}
              </div>
              <div className="text-[11px] mt-1">
                <span className="font-semibold">Party GSTIN:</span> {partyGstin}
              </div>
            </div>
          </div>

          <div className="invoice-main grid grid-cols-[2.2fr_1fr] min-h-[360px]">
            <div className="left-grid border-r-2 border-black grid grid-rows-[auto_1fr_auto]">
              <table className="brand-table w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left text-xs border-b border-r border-black p-2">BRAND</th>
                    <th className="text-left text-xs border-b border-r border-black p-2">MODEL</th>
                    <th className="text-left text-xs border-b border-r border-black p-2">COLOUR</th>
                    <th className="text-left text-xs border-b border-r border-black p-2">SIZE</th>
                    <th className="text-right text-xs border-b border-r border-black p-2">QNTY</th>
                    <th className="text-right text-xs border-b border-r border-black p-2">RATE</th>
                    <th className="text-right text-xs border-b border-black p-2">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-xs p-2 border-b border-black text-muted-foreground">
                        No line items
                      </td>
                    </tr>
                  ) : (
                    lineItems.slice(0, 2).map((item: LineItem, index: number) => (
                      <tr key={index}>
                        <td className="text-xs border-b border-r border-black p-2">{index === 0 ? billBrand : item.productName}</td>
                        <td className="text-xs border-b border-r border-black p-2">{index === 0 ? billModel : item.sku || "-"}</td>
                        <td className="text-xs border-b border-r border-black p-2">{index === 0 ? billColour : "-"}</td>
                        <td className="text-xs border-b border-r border-black p-2">{index === 0 ? billSize : "-"}</td>
                        <td className="text-xs text-right border-b border-r border-black p-2">{item.quantity}</td>
                        <td className="text-xs text-right border-b border-r border-black p-2">{formatCurrency(item.unitPrice)}</td>
                        <td className="text-xs text-right border-b border-black p-2">{formatCurrency(item.total)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="particulars">
                <table className="w-full border-collapse">
                  <tbody>
                    {particulars.map((item) => (
                      <tr key={item.label}>
                        <td className="text-xs border-b border-r border-black p-2 font-semibold">{item.label}</td>
                        <td className="text-xs border-b border-black p-2">{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="frame-row border-t border-black p-2 text-xs">
                <span className="font-semibold">Frame No:</span> {billFrameNo}
              </div>
            </div>

            <div className="right-box grid grid-rows-[auto_auto_auto_1fr_auto]">
              <div className="right-cell border-b border-black p-2 text-xs flex justify-between">
                <span className="row-title font-bold">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="right-cell border-b border-black p-2 text-xs flex justify-between">
                <span className="row-title font-bold">SGST</span>
                <span>{formatCurrency(sgst)}</span>
              </div>
              <div className="right-cell border-b border-black p-2 text-xs flex justify-between">
                <span className="row-title font-bold">CGST</span>
                <span>{formatCurrency(cgst)}</span>
              </div>
              <div className="right-cell border-b border-black p-2 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Payment</span>
                  <span>{data.payment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Status</span>
                  <span>{data.status}</span>
                </div>
                {data.notes && (
                  <div>
                    <p className="font-semibold">Note:</p>
                    <p className="text-[11px]">{data.notes}</p>
                  </div>
                )}
              </div>
              <div className="grand-total bg-black text-white text-center text-base font-extrabold p-3">
                GRAND TOTAL: {formatCurrency(grandTotal)}
              </div>
            </div>
          </div>

          <div className="dealer-panel p-3 border-y-2 border-black">
            <p className="dealer-title text-xs font-bold mb-2">Authorised Dealer</p>
            <div className="dealer-grid grid grid-cols-2 md:grid-cols-4 gap-2">
              {dealerBrands.map((brand) => (
                <div key={brand} className="dealer-chip border border-black rounded-md px-2 py-2 text-center text-[11px] font-bold bg-muted/20">
                  {brand}
                </div>
              ))}
            </div>
          </div>

          <div className="terms-box p-3 border-b-2 border-black">
            <p className="terms-title text-xs font-bold mb-2">સૂચના:</p>
            <ol className="terms-list text-[11px] leading-5 list-decimal pl-5 space-y-1">
              {gujaratiTerms.map((term) => (
                <li key={term}>{term}</li>
              ))}
            </ol>
          </div>

          <div className="footer-strip bg-red-700 text-white text-center text-xs font-bold tracking-wide py-2 border-t-2 border-black">
            BUILDING RELATIONSHIP WITH LOVE - CARE - RESPECT
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}














