import { useState } from 'react';
import { Package, Truck, CheckCircle, Clock, MapPin, Calendar, Search, Filter, Download, Star, MessageCircle } from 'lucide-react';
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

interface Order {
  id: string;
  orderId: string;
  date: string;
  status: 'ordered' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  items: number;
  total: number;
  estimatedDelivery?: string;
  trackingNumber?: string;
  address: string;
  carrier?: string;
  deliveredDate?: string;
}

export default function OrderTracking() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'order-001',
      orderId: 'ORD-2024-001',
      date: '2024-01-05',
      status: 'delivered',
      items: 2,
      total: 15600,
      estimatedDelivery: '2024-01-07',
      deliveredDate: '2024-01-06',
      trackingNumber: 'TRK123456789',
      address: '123 Main Street, Mumbai, Maharashtra',
      carrier: 'Delhivery'
    },
    {
      id: 'order-002',
      orderId: 'ORD-2024-002',
      date: '2024-01-08',
      status: 'shipped',
      items: 1,
      total: 8900,
      estimatedDelivery: '2024-01-12',
      trackingNumber: 'TRK987654321',
      address: '456 Park Avenue, Ahmedabad, Gujarat',
      carrier: 'Bluedart'
    },
    {
      id: 'order-003',
      orderId: 'ORD-2024-003',
      date: '2024-01-10',
      status: 'confirmed',
      items: 3,
      total: 24500,
      estimatedDelivery: '2024-01-15',
      trackingNumber: 'TRK456789123',
      address: '789 Oak Road, Surat, Gujarat',
      carrier: 'FedEx'
    },
    {
      id: 'order-004',
      orderId: 'ORD-2024-004',
      date: '2024-01-11',
      status: 'ordered',
      items: 1,
      total: 12500,
      estimatedDelivery: '2024-01-16',
      address: '321 Pine Lane, Rajkot, Gujarat'
    },
    {
      id: 'order-005',
      orderId: 'ORD-2024-005',
      date: '2024-01-03',
      status: 'delivered',
      items: 4,
      total: 32000,
      estimatedDelivery: '2024-01-05',
      deliveredDate: '2024-01-04',
      trackingNumber: 'TRK789123456',
      address: '654 Elm Street, Vadodara, Gujarat',
      carrier: 'DTDC'
    }
  ]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ordered': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-yellow-100 text-yellow-800';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'ordered': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'out_for_delivery': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredOrders = orders.filter(order => 
    order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.carrier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTrackOrder = (orderId: string) => {
    const order = orders.find(o => o.orderId === orderId);
    if (order) {
      setSelectedOrder(order);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6" />
            Track Orders
          </h1>
          <p className="text-muted-foreground">Track your recent orders and deliveries</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-xl font-semibold">{orders.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Truck className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Shipped</p>
              <p className="text-xl font-semibold">{orders.filter(o => ['shipped', 'out_for_delivery'].includes(o.status)).length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Delivered</p>
              <p className="text-xl font-semibold">{orders.filter(o => o.status === 'delivered').length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-xl font-semibold">{orders.filter(o => ['ordered', 'confirmed', 'shipped', 'out_for_delivery'].includes(o.status)).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Track Your Order</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Enter order ID or tracking number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button variant="outline">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{order.orderId}</h3>
                      <p className="text-sm text-muted-foreground">Placed on {order.date}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Truck className="w-4 h-4 text-muted-foreground" />
                      <span>{order.items} item{order.items > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{order.address}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Est. delivery: {order.estimatedDelivery}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div>
                    <Badge className={getStatusColor(order.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        <span>{order.status.replace('_', ' ').charAt(0).toUpperCase() + order.status.replace('_', ' ').slice(1)}</span>
                      </div>
                    </Badge>
                    <p className="text-sm mt-1 text-muted-foreground">₹{order.total.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleTrackOrder(order.orderId)}
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      Track
                    </Button>
                    <Button size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Invoice
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Tracking View */}
      {selectedOrder && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tracking Details: {selectedOrder.orderId}</CardTitle>
              <Button 
                variant="outline" 
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Order Status: {selectedOrder.status.replace('_', ' ').charAt(0).toUpperCase() + selectedOrder.status.replace('_', ' ').slice(1)}</h3>
                  <p className="text-muted-foreground">Estimated delivery: {selectedOrder.estimatedDelivery}</p>
                </div>
                <Badge className={getStatusColor(selectedOrder.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(selectedOrder.status)}
                    <span>{selectedOrder.status.replace('_', ' ').charAt(0).toUpperCase() + selectedOrder.status.replace('_', ' ').slice(1)}</span>
                  </div>
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Order Confirmed</h4>
                    <p className="text-sm text-muted-foreground">Order #{selectedOrder.orderId} confirmed on {selectedOrder.date}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">Jan 10, 2024 10:30 AM</span>
                </div>
                
                {['shipped', 'out_for_delivery', 'delivered'].includes(selectedOrder.status) && (
                  <div className="flex items-start gap-4">
                    <div className={`p-2 ${selectedOrder.status !== 'ordered' ? 'bg-green-100' : 'bg-gray-100'} rounded-full`}>
                      <Truck className={`w-5 h-5 ${selectedOrder.status !== 'ordered' ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Order Shipped</h4>
                      <p className="text-sm text-muted-foreground">Your order has been shipped via {selectedOrder.carrier}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">Jan 11, 2024 02:15 PM</span>
                  </div>
                )}
                
                {['out_for_delivery', 'delivered'].includes(selectedOrder.status) && (
                  <div className="flex items-start gap-4">
                    <div className={`p-2 ${selectedOrder.status !== 'ordered' && selectedOrder.status !== 'confirmed' ? 'bg-green-100' : 'bg-gray-100'} rounded-full`}>
                      <Truck className={`w-5 h-5 ${selectedOrder.status !== 'ordered' && selectedOrder.status !== 'confirmed' ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Out for Delivery</h4>
                      <p className="text-sm text-muted-foreground">Your order is out for delivery</p>
                    </div>
                    <span className="text-sm text-muted-foreground">Jan 12, 2024 09:45 AM</span>
                  </div>
                )}
                
                {selectedOrder.status === 'delivered' && (
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Delivered</h4>
                      <p className="text-sm text-muted-foreground">Order delivered on {selectedOrder.deliveredDate}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">Jan 12, 2024 05:30 PM</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t pt-6">
              <h4 className="font-medium mb-4">Order Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2">Shipping Address</h5>
                  <p className="text-sm">{selectedOrder.address}</p>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Tracking Information</h5>
                  <p className="text-sm">Carrier: {selectedOrder.carrier || 'N/A'}</p>
                  <p className="text-sm">Tracking Number: {selectedOrder.trackingNumber || 'N/A'}</p>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <Button>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline">
                  <Star className="w-4 h-4 mr-2" />
                  Rate Experience
                </Button>
                <Button variant="outline">
                  <Package className="w-4 h-4 mr-2" />
                  Reorder
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}