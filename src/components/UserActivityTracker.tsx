import { useState, useEffect } from 'react';
import { Activity, Clock, User, Calendar, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebaseCollections';
import { User as UserType } from '@/types/firebase';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, getDocs, Timestamp } from 'firebase/firestore';

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: 'login' | 'logout' | 'register' | 'approve' | 'reject' | 'profile_update';
  timestamp: Timestamp;
  details?: string;
}

interface UserActivityTrackerProps {
  isAdmin: boolean;
}

export default function UserActivityTracker({ isAdmin }: UserActivityTrackerProps) {
  const { data: usersData } = useFirestoreCollection<UserType>(COLLECTIONS.USERS);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock activity data - in a real app, this would come from an 'activities' collection
  useEffect(() => {
    // Simulating loading activities
    const mockActivities: ActivityLog[] = [
      {
        id: '1',
        userId: 'user1',
        userName: 'Rajesh Kumar',
        userEmail: 'rajesh@example.com',
        action: 'register',
        timestamp: Timestamp.fromDate(new Date(Date.now() - 86400000)), // 1 day ago
        details: 'Registered as employee'
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Priya Sharma',
        userEmail: 'priya@example.com',
        action: 'login',
        timestamp: Timestamp.fromDate(new Date(Date.now() - 43200000)), // 12 hours ago
      },
      {
        id: '3',
        userId: 'user3',
        userName: 'Admin User',
        userEmail: 'admin@saurashtracyclehub.com',
        action: 'approve',
        timestamp: Timestamp.fromDate(new Date(Date.now() - 3600000)), // 1 hour ago
        details: 'Approved user rajesh@example.com'
      },
      {
        id: '4',
        userId: 'user4',
        userName: 'Vikram Singh',
        userEmail: 'vikram@example.com',
        action: 'reject',
        timestamp: Timestamp.fromDate(new Date(Date.now() - 1800000)), // 30 minutes ago
        details: 'Rejected user registration'
      },
      {
        id: '5',
        userId: 'user5',
        userName: 'Meera Patel',
        userEmail: 'meera@example.com',
        action: 'login',
        timestamp: Timestamp.fromDate(new Date()),
      },
      {
        id: '6',
        userId: 'user6',
        userName: 'Amit Verma',
        userEmail: 'amit@example.com',
        action: 'profile_update',
        timestamp: Timestamp.fromDate(new Date(Date.now() - 7200000)), // 2 hours ago
        details: 'Updated profile information'
      }
    ];

    setActivities(mockActivities);
    setFilteredActivities(mockActivities);
    setLoading(false);
  }, []);

  useEffect(() => {
    let result = activities;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(activity => 
        activity.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.action.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filterDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(filterDate);
      nextDay.setDate(nextDay.getDate() + 1);

      result = result.filter(activity => {
        const activityDate = activity.timestamp.toDate();
        activityDate.setHours(0, 0, 0, 0);
        return activityDate.getTime() === filterDate.getTime();
      });
    }

    // Apply action filter
    if (actionFilter !== 'all') {
      result = result.filter(activity => activity.action === actionFilter);
    }

    setFilteredActivities(result);
  }, [activities, searchTerm, dateFilter, actionFilter]);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'login': return 'bg-green-500';
      case 'logout': return 'bg-red-500';
      case 'register': return 'bg-blue-500';
      case 'approve': return 'bg-emerald-500';
      case 'reject': return 'bg-destructive';
      case 'profile_update': return 'bg-violet-500';
      default: return 'bg-gray-500';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'login': return 'Login';
      case 'logout': return 'Logout';
      case 'register': return 'Registration';
      case 'approve': return 'Approval';
      case 'reject': return 'Rejection';
      case 'profile_update': return 'Profile Update';
      default: return action;
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            My Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Your activity history will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          User Activity Logs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 bg-background"
              >
                <option value="all">All Actions</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="register">Registration</option>
                <option value="approve">Approval</option>
                <option value="reject">Rejection</option>
                <option value="profile_update">Profile Update</option>
              </select>
            </div>
            <div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setDateFilter('');
                  setActionFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Activity List */}
          <div className="border rounded-lg divide-y">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActionColor(activity.action)} text-white`}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{activity.userName}</p>
                        <Badge variant="outline" className="text-xs ml-2">
                          {getActionLabel(activity.action)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{activity.userEmail}</p>
                      {activity.details && (
                        <p className="text-sm mt-1">{activity.details}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end text-xs text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {activity.timestamp.toDate().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                {loading ? 'Loading activities...' : 'No activities found'}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}