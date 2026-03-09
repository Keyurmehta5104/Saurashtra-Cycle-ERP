import { useState } from 'react';
import { Gift, Star, TrendingUp, Calendar, Filter, Search, Award, Heart, Coins, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [points, setPoints] = useState(1250);
  const [activeTab, setActiveTab] = useState('available');
  
  const rewards: Reward[] = [
    {
      id: 'reward-001',
      title: 'Free Bicycle Service',
      description: 'Get a free basic service worth ₹750',
      pointsRequired: 2000,
      category: 'service',
      availability: 'available',
      expiryDate: '2024-03-31'
    },
    {
      id: 'reward-002',
      title: '15% Discount Voucher',
      description: 'Get 15% off on your next purchase',
      pointsRequired: 1500,
      category: 'discount',
      availability: 'available',
      expiryDate: '2024-02-28'
    },
    {
      id: 'reward-003',
      title: 'Premium Helmet',
      description: 'Free premium helmet worth ₹2500',
      pointsRequired: 5000,
      category: 'free_item',
      availability: 'limited',
      expiryDate: '2024-01-31'
    },
    {
      id: 'reward-004',
      title: 'Early Access',
      description: 'Get early access to new cycle models',
      pointsRequired: 3000,
      category: 'exclusive',
      availability: 'available',
      expiryDate: '2024-06-30'
    },
    {
      id: 'reward-005',
      title: 'Free Delivery',
      description: 'Free delivery on your next order',
      pointsRequired: 500,
      category: 'service',
      availability: 'available',
      expiryDate: '2024-02-15'
    },
    {
      id: 'reward-006',
      title: '20% Off Frame',
      description: 'Get 20% discount on any bicycle frame',
      pointsRequired: 2500,
      category: 'discount',
      availability: 'limited',
      expiryDate: '2024-01-20'
    },
  ];

  const availableRewards = rewards.filter(reward => reward.availability !== 'unavailable');
  const limitedRewards = rewards.filter(reward => reward.availability === 'limited');
  const unavailableRewards = rewards.filter(reward => reward.availability === 'unavailable');

  const getRewardsByTab = () => {
    switch(activeTab) {
      case 'available': return availableRewards;
      case 'limited': return limitedRewards;
      case 'unavailable': return unavailableRewards;
      default: return availableRewards;
    }
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'discount': return 'bg-blue-100 text-blue-800';
      case 'free_item': return 'bg-green-100 text-green-800';
      case 'service': return 'bg-purple-100 text-purple-800';
      case 'exclusive': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch(availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'limited': return 'bg-yellow-100 text-yellow-800';
      case 'unavailable': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const redeemReward = (reward: Reward) => {
    if (points >= reward.pointsRequired) {
      setPoints(points - reward.pointsRequired);
      // Here you would typically make an API call to redeem the reward
      alert(`Successfully redeemed: ${reward.title}`);
    } else {
      alert('Not enough points to redeem this reward');
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="w-6 h-6" />
            Rewards Center
          </h1>
          <p className="text-muted-foreground">Redeem your loyalty points for exciting rewards</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-yellow-50 p-3 rounded-lg border">
            <Coins className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm text-muted-foreground">Your Points</p>
              <p className="text-xl font-bold text-yellow-600">{points}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Star className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Points Earned</p>
              <p className="text-xl font-semibold">2,500</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Gift className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rewards Redeemed</p>
              <p className="text-xl font-semibold">3</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Next Reward</p>
              <p className="text-xl font-semibold">750 pts</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Points Rate</p>
              <p className="text-xl font-semibold">1:1</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Reward Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={activeTab === 'available' ? 'default' : 'outline'}
              onClick={() => setActiveTab('available')}
            >
              <Gift className="w-4 h-4 mr-2" />
              Available ({availableRewards.length})
            </Button>
            <Button 
              variant={activeTab === 'limited' ? 'default' : 'outline'}
              onClick={() => setActiveTab('limited')}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Limited ({limitedRewards.length})
            </Button>
            <Button 
              variant={activeTab === 'unavailable' ? 'default' : 'outline'}
              onClick={() => setActiveTab('unavailable')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Expired ({unavailableRewards.length})
            </Button>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Input
              placeholder="Search rewards..."
              className="max-w-xs"
            />
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="discount">Discounts</SelectItem>
                <SelectItem value="free_item">Free Items</SelectItem>
                <SelectItem value="service">Services</SelectItem>
                <SelectItem value="exclusive">Exclusive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getRewardsByTab().map((reward) => (
          <Card key={reward.id} className="overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-primary to-accent text-primary-foreground">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{reward.title}</h3>
                <Badge className={getCategoryColor(reward.category)}>
                  {reward.category.charAt(0).toUpperCase() + reward.category.slice(1)}
                </Badge>
              </div>
              <p className="text-primary-foreground/80 text-sm mt-1">{reward.description}</p>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold text-lg">{reward.pointsRequired} pts</span>
                </div>
                <Badge className={getAvailabilityColor(reward.availability)}>
                  {reward.availability.charAt(0).toUpperCase() + reward.availability.slice(1)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Expires: {reward.expiryDate}</span>
                  </div>
                </div>
                <Button 
                  disabled={points < reward.pointsRequired || reward.availability === 'unavailable'}
                  onClick={() => redeemReward(reward)}
                >
                  {points < reward.pointsRequired ? 'Insufficient Points' : 'Redeem Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How to earn points section */}
      <Card>
        <CardHeader>
          <CardTitle>How to Earn Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col items-center text-center p-4 border rounded-lg">
              <Percent className="w-8 h-8 text-blue-500 mb-2" />
              <h3 className="font-semibold">Purchase Bonus</h3>
              <p className="text-sm text-muted-foreground">Earn 1 point per ₹10 spent</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 border rounded-lg">
              <Heart className="w-8 h-8 text-red-500 mb-2" />
              <h3 className="font-semibold">Loyalty Bonus</h3>
              <p className="text-sm text-muted-foreground">Extra points for returning customers</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 border rounded-lg">
              <Award className="w-8 h-8 text-green-500 mb-2" />
              <h3 className="font-semibold">Reviews</h3>
              <p className="text-sm text-muted-foreground">50 points per product review</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 border rounded-lg">
              <Star className="w-8 h-8 text-yellow-500 mb-2" />
              <h3 className="font-semibold">Referrals</h3>
              <p className="text-sm text-muted-foreground">200 points per successful referral</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}