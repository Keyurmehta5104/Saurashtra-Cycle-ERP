import { useState, useEffect } from 'react';
import { Calendar, Target, TrendingUp, Gift, Coffee, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface PersonalizedWelcomeProps {
  isAdmin?: boolean;
  onLogout?: () => void;
}

export default function PersonalizedWelcome({ isAdmin = false, onLogout }: PersonalizedWelcomeProps) {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      setTimeOfDay('morning');
      setGreeting('Good Morning');
    } else if (hour < 17) {
      setTimeOfDay('afternoon');
      setGreeting('Good Afternoon');
    } else {
      setTimeOfDay('evening');
      setGreeting('Good Evening');
    }
  }, []);

  const recommendations = isAdmin 
    ? [
        {
          title: "Review Low Stock Items",
          description: "Check items that need reordering",
          action: "View Inventory",
          icon: TrendingUp,
          color: "bg-blue-100 text-blue-600"
        },
        {
          title: "Manage User Accounts",
          description: "Add or update user permissions",
          action: "User Management",
          icon: BookOpen,
          color: "bg-green-100 text-green-600"
        },
        {
          title: "Generate Monthly Report",
          description: "Create performance analytics",
          action: "View Reports",
          icon: Target,
          color: "bg-purple-100 text-purple-600"
        }
      ]
    : [
        {
          title: "Process New Sale",
          description: "Create a new sale order",
          action: "Create Sale",
          icon: TrendingUp,
          color: "bg-blue-100 text-blue-600"
        },
        {
          title: "Update Inventory",
          description: "Add or modify stock items",
          action: "Manage Inventory",
          icon: Calendar,
          color: "bg-green-100 text-green-600"
        },
        {
          title: "Check Customer List",
          description: "View all registered customers",
          action: "View Customers",
          icon: Target,
          color: "bg-purple-100 text-purple-600"
        }
      ];

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-accent p-6 text-primary-foreground">
        <CardHeader className="p-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{greeting}, {user?.displayName || 'User'}!</h2>
              <p className="text-primary-foreground/80">
                {isAdmin 
                  ? "Here's what needs your attention today." 
                  : "Ready to serve customers and manage inventory."}
              </p>
            </div>
          </div>
        </CardHeader>
      </div>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Recommended for You
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{isAdmin ? "Admin" : "Staff"} Mode</Badge>
              <Button variant="outline" onClick={onLogout || (() => {
                if (typeof window !== 'undefined' && window.location) {
                  window.location.href = '/login';
                }
              })}>
                Logout
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            {recommendations.map((rec, index) => {
              const IconComponent = rec.icon;
              return (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${rec.color}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">{rec.title}</h4>
                      <p className="text-xs text-muted-foreground">{rec.description}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    {rec.action}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}