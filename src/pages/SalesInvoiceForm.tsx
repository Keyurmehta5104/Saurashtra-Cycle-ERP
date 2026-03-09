import { useState } from 'react';
import { 
  Plus, 
  Minus, 
  Calculator, 
  IndianRupee, 
  Calendar, 
  User, 
  Package, 
  CreditCard,
  Save,
  Printer,
  Download,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useFirestoreCollection } from '@/hooks/useFirestore';
import { COLLECTIONS } from '@/lib/firebaseCollections';
import { InventoryItem, Customer } from '@/types/firebase';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  discount: number;
}

export default function SalesInvoiceForm() {
  const { data: inventoryData } = useFirestoreCollection<InventoryItem>(COLLECTIONS.INVENTORY);
  const { data: customersData } = useFirestoreCollection<Customer>(COLLECTIONS.CUSTOMERS);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(5); // 5% GST
  
  const addToCart = (item: InventoryItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 } 
          : cartItem
      ));
    } else {
      setCart([...cart, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        discount: 0
      }]);
    }
  };
  
  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };
  
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCart(cart.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };
  
  const updateDiscount = (id: string, discount: number) => {
    setCart(cart.map(item => 
      item.id === id ? { ...item, discount } : item
    ));
  };
  
  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDiscount = cart.reduce((sum, item) => sum + ((item.price * item.quantity * item.discount) / 100), 0);
  const taxableAmount = subtotal - totalDiscount;
  const taxAmount = (taxableAmount * taxRate) / 100;
  const grandTotal = taxableAmount + taxAmount - discount;
  
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            Create Sales Invoice
          </h1>
          <p className="text-muted-foreground">Generate invoices for customer purchases</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print Preview
          </Button>
          <Button>
            <Save className="w-4 h-4 mr-2" />
            Save Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer and Products */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer">Select Customer</Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customersData.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Invoice Date</Label>
                  <Input type="date" id="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Add Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inventoryData.slice(0, 4).map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 flex items-center justify-between hover:bg-accent/30">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">₹{item.price} • Stock: {item.stock}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => addToCart(item)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cart Items */}
          <Card>
            <CardHeader>
              <CardTitle>Cart Items</CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-3 text-muted" />
                  <p>No items in cart</p>
                  <p className="text-sm">Add products to create an invoice</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <Input 
                              type="number" 
                              min="1" 
                              value={item.quantity} 
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                              className="w-20 text-center"
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <IndianRupee className="w-4 h-4" />
                            <span>₹{item.price}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`discount-${item.id}`}>Disc:</Label>
                            <Input 
                              id={`discount-${item.id}`}
                              type="number" 
                              min="0" 
                              max="100" 
                              value={item.discount} 
                              onChange={(e) => updateDiscount(item.id, parseFloat(e.target.value) || 0)}
                              className="w-20 text-center"
                            />
                            <span>%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium">₹{(item.price * item.quantity * (1 - item.discount/100)).toFixed(2)}</div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="mt-2"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary and Payment */}
        <div className="space-y-6">
          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>-₹{totalDiscount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tax ({taxRate}%)</span>
                  <span>₹{taxAmount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Additional Discount</span>
                  <Input 
                    type="number" 
                    min="0" 
                    max={Math.min(grandTotal, 1000)} 
                    value={discount} 
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-24 text-right inline-block"
                  />
                </div>
                
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button className="w-full mt-6">
                <CreditCard className="w-4 h-4 mr-2" />
                Process Payment
              </Button>
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card>
            <CardHeader>
              <CardTitle>Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Include Tax</span>
                  <Badge variant="secondary">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Warranty</span>
                  <Badge variant="outline">Optional</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Installation</span>
                  <Badge variant="outline">Extra</Badge>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea 
                className="w-full p-3 border rounded-md min-h-[100px]"
                placeholder="Add any special notes or instructions..."
              ></textarea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}