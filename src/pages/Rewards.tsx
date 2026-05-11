import { useState } from 'react';
import { Gift, Star, TrendingUp, Calendar, Filter, Search, Award, Heart, Coins, Percent, Trophy, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebaseCollections';
import { Customer } from '@/types/firebase';
import { Loader2 } from 'lucide-react';

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  category: 'discount' | 'free_item' | 'service' | 'exclusive';
  availability: 'available' | 'limited' | 'unavailable';
  expiryDate?: string;
}

export default function Rewards() {
  const { data: customersData, loading: customersLoading } = useFirestoreCollection<Customer>(COLLECTIONS.CUSTOMERS);
  const [activeTab, setActiveTab] = useState('available');
  const [searchQuery, setSearchQuery] = useState('');
  
  const rewards: Reward[] = [
    {
      id: 'reward-001',
      title: 'Free Bicycle Service',
      description: 'Full basic service maintenance for any cycle model.',
      pointsRequired: 2000,
      category: 'service',
      availability: 'available',
      expiryDate: '2024-12-31'
    },
    {
      id: 'reward-002',
      title: '₹500 Discount Voucher',
      description: 'Direct discount on your next accessories purchase.',
      pointsRequired: 500,
      category: 'discount',
      availability: 'available',
      expiryDate: '2024-12-31'
    },
    {
      id: 'reward-003',
      title: 'Premium Alloy Cage',
      description: 'Complementary bottle cage with installation.',
      pointsRequired: 1200,
      category: 'free_item',
      availability: 'limited',
      expiryDate: '2024-06-30'
    },
    {
      id: 'reward-004',
      title: 'VIP Early Access',
      description: 'Invitations to exclusive cycle launch events.',
      pointsRequired: 3000,
      category: 'exclusive',
      availability: 'available',
      expiryDate: '2025-01-01'
    }
  ];

  // Top customers by points
  const topCustomers = [...(customersData || [])]
    .sort((a, b) => (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0))
    .slice(0, 5);

  const getCategoryBadge = (category: string) => {
    switch(category) {
      case 'discount': return <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 font-bold text-[10px] uppercase">Discount</Badge>;
      case 'free_item': return <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 font-bold text-[10px] uppercase">Free Gift</Badge>;
      case 'service': return <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700 font-bold text-[10px] uppercase">Service</Badge>;
      case 'exclusive': return <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 font-bold text-[10px] uppercase">VIP</Badge>;
      default: return <Badge variant="outline" className="font-bold text-[10px] uppercase">Other</Badge>;
    }
  };

  if (customersLoading) {
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
          <h1 className="page-title">Rewards & Loyalty</h1>
          <p className="text-muted-foreground text-sm">Manage customer tiers and loyalty point redemptions.</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-lg">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Loyalty Program</p>
            <p className="text-sm font-bold text-slate-900">₹100 = 1 Point</p>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <Trophy className="w-8 h-8 text-amber-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Top Customers & Earning Rules */}
        <div className="space-y-8">
          {/* Top Customers Card */}
          <div className="card-enhanced p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                Loyalty Leaderboard
              </h2>
              <Trophy className="w-4 h-4 text-slate-300" />
            </div>
            <div className="space-y-4">
              {topCustomers.map((customer, idx) => (
                <div key={customer.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:bg-primary group-hover:text-white transition-colors">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{customer.name}</p>
                      <p className="text-[10px] text-slate-500">{customer.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-primary">{customer.loyaltyPoints || 0}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Points</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-xs font-bold text-primary hover:bg-primary/5 uppercase tracking-widest">
              View All Customers
            </Button>
          </div>

          {/* Earning Rules Card */}
          <div className="bg-slate-900 text-white p-6 rounded-lg shadow-xl relative overflow-hidden">
            <Percent className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 rotate-12" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-slate-400">Earning Rules</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Coins className="w-5 h-5 text-amber-400 mt-0.5" />
                <div>
                  <p className="text-sm font-bold">Standard Purchase</p>
                  <p className="text-xs text-slate-400">Earn 1 point for every ₹100 spent on any cycle or accessory.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-rose-400 mt-0.5" />
                <div>
                  <p className="text-sm font-bold">First Purchase Bonus</p>
                  <p className="text-xs text-slate-400">Extra 50 points on the first purchase above ₹10,000.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Reward Catalog */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-2">
             <div className="relative flex-1 w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search rewards catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 input-enhanced"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={activeTab === 'available' ? 'default' : 'secondary'} 
                onClick={() => setActiveTab('available')}
                className="h-9 text-[10px] font-bold uppercase tracking-widest"
              >
                Available
              </Button>
              <Button 
                variant={activeTab === 'premium' ? 'default' : 'secondary'} 
                onClick={() => setActiveTab('premium')}
                className="h-9 text-[10px] font-bold uppercase tracking-widest"
              >
                Premium
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.map((reward) => (
              <div key={reward.id} className="card-enhanced p-5 flex flex-col justify-between hover:border-primary/30 transition-colors">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-slate-50 p-3 rounded border border-slate-100">
                      <Gift className="w-5 h-5 text-primary" />
                    </div>
                    {getCategoryBadge(reward.category)}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{reward.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{reward.description}</p>
                </div>
                
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Required</p>
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-amber-500" />
                      <p className="text-lg font-black text-slate-900">{reward.pointsRequired}</p>
                    </div>
                  </div>
                  <Button className="btn-primary h-9 px-6 text-[10px] font-bold uppercase tracking-widest shadow-none">
                    Redeem
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Redemption Help */}
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3 mt-8">
            <div className="bg-blue-600 p-1.5 rounded-full text-white mt-0.5">
              <User className="w-3 h-3" />
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              <strong>Admin Tip:</strong> Points are redeemed by selecting the customer during sales checkout. The available discount will appear in the invoice summary once a customer with sufficient points is selected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}