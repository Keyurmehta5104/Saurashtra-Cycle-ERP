import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  Zap,
  Award,
  Eye,
  MousePointerClick,
  Clock,
  Target,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

interface FeatureUsage {
  name: string;
  usage: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  users: number;
  lastUsed: string;
  path: string;
}

export default function FeatureUsageTracker() {
  const navigate = useNavigate();
  const [featureData, setFeatureData] = useState<FeatureUsage[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  // Mock feature usage data - in production, this would come from analytics tracking
  useEffect(() => {
    const features: FeatureUsage[] = [
      {
        name: 'Sales Dashboard',
        usage: 85,
        trend: 'up',
        change: 12.5,
        users: 8,
        lastUsed: 'Today',
        path: '/dashboard',
      },
      {
        name: 'Inventory Management',
        usage: 72,
        trend: 'up',
        change: 8.2,
        users: 6,
        lastUsed: 'Today',
        path: '/inventory',
      },
      {
        name: 'Customer Records',
        usage: 65,
        trend: 'stable',
        change: 2.1,
        users: 5,
        lastUsed: 'Yesterday',
        path: '/customers',
      },
      {
        name: 'Purchase Orders',
        usage: 45,
        trend: 'down',
        change: -5.3,
        users: 3,
        lastUsed: '2 days ago',
        path: '/purchases',
      },
      {
        name: 'Service Tracking',
        usage: 58,
        trend: 'up',
        change: 15.7,
        users: 4,
        lastUsed: 'Today',
        path: '/service',
      },
      {
        name: 'Reports & Analytics',
        usage: 38,
        trend: 'down',
        change: -8.4,
        users: 2,
        lastUsed: '3 days ago',
        path: '/reports',
      },
      {
        name: 'User Management',
        usage: 25,
        trend: 'stable',
        change: 1.2,
        users: 1,
        lastUsed: 'Last week',
        path: '/admin/users',
      },
      {
        name: 'Audit Logs',
        usage: 15,
        trend: 'down',
        change: -12.0,
        users: 1,
        lastUsed: 'Last week',
        path: '/audit-logs',
      },
    ];

    setFeatureData(features);
  }, [timeRange]);

  // Calculate adoption metrics
  const totalFeatures = featureData.length;
  const highlyAdopted = featureData.filter(f => f.usage >= 60).length;
  const moderatelyAdopted = featureData.filter(f => f.usage >= 30 && f.usage < 60).length;
  const underutilized = featureData.filter(f => f.usage < 30).length;
  const avgUsage = Math.round(featureData.reduce((sum, f) => sum + f.usage, 0) / totalFeatures);

  // Identify power users (mock data)
  const powerUsers = [
    { name: 'Admin User', featuresUsed: 12, activity: 95 },
    { name: 'Sales Manager', featuresUsed: 8, activity: 87 },
    { name: 'Inventory Clerk', featuresUsed: 6, activity: 78 },
  ];

  // Recommendations for underutilized features
  const recommendations = featureData
    .filter(f => f.usage < 40)
    .map(f => ({
      feature: f.name,
      reason: 'Low adoption rate',
      suggestion: `Consider training or highlighting ${f.name} benefits`,
    }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Feature Usage Tracker
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor feature adoption and identify optimization opportunities
            </p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'quarter')}
            className="border border-input rounded-md px-3 py-2 bg-background text-sm"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {/* Adoption Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 font-medium">Highly Adopted</p>
                <p className="text-2xl font-bold text-green-900">{highlyAdopted}</p>
                <p className="text-xs text-green-600">Usage ≥60%</p>
              </div>
              <Award className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </div>
          
          <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-medium">Moderate Usage</p>
                <p className="text-2xl font-bold text-blue-900">{moderatelyAdopted}</p>
                <p className="text-xs text-blue-600">Usage 30-60%</p>
              </div>
              <Target className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </div>
          
          <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-orange-600 font-medium">Underutilized</p>
                <p className="text-2xl font-bold text-orange-900">{underutilized}</p>
                <p className="text-xs text-orange-600">Usage &lt;30%</p>
              </div>
              <Lightbulb className="w-8 h-8 text-orange-500 opacity-50" />
            </div>
          </div>
          
          <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 font-medium">Avg Usage</p>
                <p className="text-2xl font-bold text-purple-900">{avgUsage}%</p>
                <p className="text-xs text-purple-600">Across all features</p>
              </div>
              <Eye className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Feature Usage Chart */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <MousePointerClick className="w-4 h-4" />
            Feature Usage Comparison
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureData} layout="horizontal" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => [`${value}%`, 'Usage']} />
                <Bar dataKey="usage" fill="hsl(173, 58%, 39%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Power Users & Recommendations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Power Users */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Power Users
            </h3>
            <div className="space-y-3">
              {powerUsers.map((user, index) => (
                <div key={index} className="p-3 border rounded-lg hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.featuresUsed} features used</p>
                      </div>
                    </div>
                    <Badge variant="default" className="text-xs">
                      {user.activity}% active
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full transition-all"
                        style={{ width: `${user.activity}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Optimization Tips
            </h3>
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((rec, index) => (
                <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">{rec.feature}</p>
                      <p className="text-xs text-yellow-700 mt-1">{rec.suggestion}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {recommendations.length === 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-green-600" />
                    <p className="text-sm font-medium text-green-900">All features well-adopted!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Tip: Click on any module to explore its features
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate('/reports')}>
              View Detailed Analytics
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
