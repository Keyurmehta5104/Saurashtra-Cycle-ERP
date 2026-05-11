import React from 'react';
import { Wrench, User, Calendar, Phone, Bike, Clock, ShieldCheck } from 'lucide-react';
import { ServiceJob } from '@/types/firebase';

interface JobCardPrintProps {
  job: ServiceJob;
}

export const JobCardPrint: React.FC<JobCardPrintProps> = ({ job }) => {
  return (
    <div className="bg-white p-10 max-w-[800px] mx-auto border border-slate-200 text-slate-900 font-sans" id="job-card-print">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">SAURASHTRA CYCLE HUB</h1>
          <p className="text-sm font-bold text-slate-600 mt-1">Premium Sales & Service Center</p>
          <p className="text-xs text-slate-500 mt-2">Opp. Police Station, Main Road, Jamnagar - 361001</p>
          <p className="text-xs text-slate-500">Contact: +91 98765 43210 | GSTIN: 24AAAAA0000A1Z5</p>
        </div>
        <div className="text-right">
          <div className="bg-slate-900 text-white px-4 py-2 rounded-sm mb-2">
            <h2 className="text-xs font-black uppercase tracking-widest">Service Job Card</h2>
          </div>
          <p className="text-lg font-black text-slate-900">{job.jobId}</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Job ID</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Customer Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <User className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Customer Details</h3>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold">{job.customer}</p>
            <p className="text-sm text-slate-600 flex items-center gap-2">
              <Phone className="w-3 h-3" /> {job.phone}
            </p>
          </div>
        </div>

        {/* Cycle Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Bike className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Vehicle Details</h3>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold">{job.cycle}</p>
            <p className="text-xs text-slate-600 uppercase font-bold tracking-widest">Status: {job.status}</p>
          </div>
        </div>
      </div>

      {/* Dates and Timeline */}
      <div className="grid grid-cols-3 gap-4 mb-10 bg-slate-50 p-4 rounded border border-slate-100">
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Received Date</p>
          <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-3 h-3" /> {job.receivedDate}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Estimated Return</p>
          <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-3 h-3" /> {job.expectedDate}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Technician</p>
          <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-3 h-3" /> {job.technician}
          </p>
        </div>
      </div>

      {/* Service Request Section */}
      <div className="mb-10">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Service Request & Issues</h3>
        </div>
        <div className="bg-slate-50 p-6 rounded border-l-4 border-slate-900">
          <p className="text-sm text-slate-800 italic leading-relaxed">
            "{job.issue}"
          </p>
        </div>
      </div>

      {/* Financial Estimates */}
      <div className="border-2 border-slate-900 p-6 mb-10 flex justify-between items-center">
        <div>
          <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Estimated Service Cost</h4>
          <p className="text-xs text-slate-500">Excluding parts and additional labor costs found during service.</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-slate-900">₹{job.estimatedCost.toLocaleString()}</p>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="mb-12">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-slate-400">Terms & Conditions</h4>
        <ul className="text-[9px] text-slate-500 space-y-1.5 list-disc pl-4">
          <li>Cycles not collected within 7 days of completion will be charged a storage fee of ₹50/day.</li>
          <li>Saurashtra Cycle Hub is not responsible for any personal items left with the cycle (lights, speedometers, etc.).</li>
          <li>Estimated costs are subject to change if additional major parts/labor are required during the repair.</li>
          <li>Vehicles are accepted for service at owner's risk.</li>
        </ul>
      </div>

      {/* Signature Section */}
      <div className="grid grid-cols-2 gap-20 pt-10">
        <div className="border-t border-slate-300 pt-4 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer Signature</p>
        </div>
        <div className="border-t border-slate-300 pt-4 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorized Signatory</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-20 text-center border-t border-slate-100 pt-6">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Thank you for choosing Saurashtra Cycle Hub</p>
      </div>
    </div>
  );
};
