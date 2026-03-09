import { useState, useEffect } from 'react';
import { User, CheckCircle, XCircle, Eye, EyeOff, Mail, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebaseCollections';
import { User as UserType } from '@/types/firebase';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

interface UserVerificationProps {
  isAdmin: boolean;
}

export default function UserVerification({ isAdmin }: UserVerificationProps) {
  const { data: usersData, loading } = useFirestoreCollection<UserType>(COLLECTIONS.USERS);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Allow all users to see all user data regardless of role
  const canViewAllUsers = true; // Changed from: isAdmin

  useEffect(() => {
    let result = usersData;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(user => 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(user => 
        statusFilter === 'approved' ? user.status === 'approved' : 
        statusFilter === 'rejected' ? user.status === 'rejected' : 
        statusFilter === 'pending' ? user.status === 'pending' : 
        true
      );
    }

    setFilteredUsers(result);
  }, [usersData, searchTerm, roleFilter, statusFilter]);

  const handleApproveUser = async (userId: string) => {
    try {
      const userDocRef = doc(db, COLLECTIONS.USERS, userId);
      await updateDoc(userDocRef, {
        approved: true,
        status: 'approved'
      });
      
      toast({
        title: "User Approved",
        description: "The user has been approved successfully.",
      });
    } catch (error) {
      console.error("Error approving user:", error);
      toast({
        title: "Error",
        description: "Failed to approve user.",
        variant: "destructive"
      });
    }
  };

  const handleRejectUser = async (userId: string) => {
    try {
      const userDocRef = doc(db, COLLECTIONS.USERS, userId);
      await updateDoc(userDocRef, {
        approved: false,
        status: 'rejected'
      });
      
      toast({
        title: "User Rejected",
        description: "The user has been rejected.",
      });
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast({
        title: "Error",
        description: "Failed to reject user.",
        variant: "destructive"
      });
    }
  };

  // Allow all users to see all user data - removing admin-only restriction
  /*
  // Allow all users to see all user data regardless of role
  /*
  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Role Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-secondary rounded-lg">
              <h3 className="font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Your Account Details
              </h3>
              <div className="text-sm text-muted-foreground mt-2">
                Your current role: <Badge variant="default">{usersData.find(u => u.id)?.role || 'Unknown'}</Badge>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Approval status: <Badge variant={
                  usersData.find(u => u.id)?.status === 'approved' ? 'default' :
                  usersData.find(u => u.id)?.status === 'rejected' ? 'destructive' :
                  'secondary'
                }>
                  {(usersData.find(u => u.id)?.status || 'Unknown')}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  */

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Verification & Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Input
                  id="search"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div>
              <Label htmlFor="role-filter">Role</Label>
              <select
                id="role-filter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 bg-background"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
                <option value="customer">Customer</option>
              </select>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-input rounded-md px-3 py-2 bg-background"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4">User</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Role</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t hover:bg-muted/20">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserRound className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{user.displayName || 'Unknown User'}</p>
                            <p className="text-sm text-muted-foreground">ID: {user.id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{user.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={
                          user.role === 'admin' ? 'bg-destructive text-destructive-foreground' :
                          user.role === 'employee' ? 'bg-primary text-primary-foreground' :
                          'bg-secondary text-secondary-foreground'
                        }>
                          {(user.role || 'Unknown').charAt(0).toUpperCase() + (user.role || 'Unknown').slice(1)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={
                          user.status === 'approved' ? 'default' :
                          user.status === 'rejected' ? 'destructive' :
                          'secondary'
                        }>
                          {(user.status || 'Unknown').charAt(0).toUpperCase() + (user.status || 'Unknown').slice(1)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {((user.status === 'pending' || user.status === 'rejected') || (!user.status && !user.approved)) && user.role !== 'customer' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleApproveUser(user.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleRejectUser(user.id)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                        {user.status === 'approved' && (
                          <Badge variant="default">Active</Badge>
                        )}
                        {user.status === 'approved' && user.role === 'customer' && (
                          <Badge variant="default">Auto-approved</Badge>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      {loading ? 'Loading users...' : 'No users found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{usersData.length}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Admins</p>
              <p className="text-2xl font-bold text-destructive">
                {usersData.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Employees</p>
              <p className="text-2xl font-bold text-primary">
                {usersData.filter(u => u.role === 'employee').length}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Pending Approval</p>
              <p className="text-2xl font-bold text-warning">
                {usersData.filter(u => (u.status === 'pending' || u.status === 'rejected') && u.role !== 'customer').length}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}