import React from "react";
import { ServiceJob } from "@/types/firebase";
import { format } from "date-fns";

interface ServiceReceiptProps {
  job: ServiceJob | null;
}

export const ServiceReceipt = React.forwardRef<HTMLDivElement, ServiceReceiptProps>(
  ({ job }, ref) => {
    if (!job) return null;

    return (
      <div ref={ref} className="bg-white p-8 w-full max-w-4xl mx-auto text-black" style={{ minHeight: '1056px' }}>
        {/* Header / Shop Info */}
        <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-black tracking-tight uppercase">Saurashtra Cycle Hub</h1>
            <p className="text-sm text-gray-600 mt-1">123 Cycle Market, Main Road, Rajkot, Gujarat</p>
            <p className="text-sm text-gray-600">Phone: +91 98765 43210</p>
            <p className="text-sm text-gray-600">GSTIN: 24AAAAA0000A1Z5</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-widest">Service Job Card</h2>
            <p className="text-lg font-mono font-semibold mt-2">No. {job.jobId}</p>
            <p className="text-sm text-gray-600">Date: {job.receivedDate}</p>
          </div>
        </div>

        {/* Customer & Cycle Info Grid */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Customer Details</h3>
            <p className="font-bold text-lg">{job.customer}</p>
            <p className="text-gray-700">Phone: {job.phone}</p>
          </div>
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cycle Details</h3>
            <p className="font-bold text-lg">{job.cycle}</p>
            <p className="text-gray-700 mt-1">Expected Delivery: <span className="font-semibold">{job.expectedDate || "TBD"}</span></p>
          </div>
        </div>

        {/* Issue Description Table */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Service Requirements / Complaints</h3>
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[100px]">
            <p className="whitespace-pre-wrap">{job.issue}</p>
          </div>
        </div>

        {/* Work Completed (if status is completed) */}
        {job.status === "Completed" && (
          <div className="mb-8 border-2 border-green-600 rounded-lg p-4 bg-green-50">
            <h3 className="text-xs font-bold text-green-800 uppercase tracking-wider mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Work Completed Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">Parts Replaced/Used:</p>
                <p className="text-sm text-gray-900">{job.partsUsed || "No new parts used."}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Technician Notes:</p>
                <p className="text-sm text-gray-900">{job.completionNotes || "Servicing completed as requested."}</p>
              </div>
            </div>
          </div>
        )}

        {/* Financial Summary */}
        <div className="flex justify-end mb-12">
          <div className="w-64 border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Financial Summary</h3>
            </div>
            <div className="p-4 space-y-2">
              {job.status === "Completed" ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Bill Amount:</span>
                    <span className="font-bold">₹{job.actualCost?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-bold text-green-700">₹{job.amountPaid?.toLocaleString() || 0}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                    <span className="font-bold">Balance Due:</span>
                    <span className="font-bold text-red-600">₹{Math.max(0, (job.actualCost || 0) - (job.amountPaid || 0)).toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span className="font-bold text-gray-700">Estimated Cost:</span>
                  <span className="font-bold text-lg">₹{job.estimatedCost?.toLocaleString() || 0}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Terms and Signatures */}
        <div className="border-t-2 border-gray-300 pt-6 mt-12 grid grid-cols-2 gap-8">
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Terms & Conditions</h4>
            <ul className="text-xs text-gray-500 list-disc pl-4 space-y-1">
              <li>Cycles must be collected within 7 days of completion.</li>
              <li>We are not responsible for accessories left on the cycle.</li>
              <li>Estimated costs may change subject to internal inspection.</li>
              <li>This is a computer-generated job card.</li>
            </ul>
          </div>
          <div className="flex justify-between items-end">
            <div className="text-center">
              <div className="w-32 border-b border-black mb-2"></div>
              <p className="text-xs text-gray-600 font-semibold">Customer Signature</p>
            </div>
            <div className="text-center">
              <div className="w-32 border-b border-black mb-2"></div>
              <p className="text-xs text-gray-600 font-semibold">Authorized Signatory</p>
            </div>
          </div>
        </div>

      </div>
    );
  }
);

ServiceReceipt.displayName = "ServiceReceipt";
