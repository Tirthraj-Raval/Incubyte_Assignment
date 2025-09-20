import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '../components/ui/seperator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Package, Clock, CheckCircle, XCircle, ArrowLeft, Eye, Truck } from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
}

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'preparing':
        return <Package className="h-4 w-4" />;
      case 'out_for_delivery':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'preparing':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Order Placed';
      case 'confirmed':
        return 'Confirmed';
      case 'preparing':
        return 'Preparing';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">My Orders</h1>
            <p className="text-muted-foreground">Track and manage your orders</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">📦</div>
            <h3 className="text-2xl font-semibold mb-4">No orders yet</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Button
              onClick={() => navigate('/products')}
              className="btn-hero"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <Card key={order.id} className={`animate-fade-in hover-lift`} style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Order #{order.order_number}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Placed on {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{getStatusText(order.status)}</span>
                      </Badge>
                      <Badge className={getPaymentStatusColor(order.payment_status)}>
                        Payment: {order.payment_status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Order Details */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Order Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Customer:</span>
                          <span>{order.customer_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span>{order.customer_email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Phone:</span>
                          <span>{order.customer_phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Amount:</span>
                          <span className="font-bold text-primary">{formatPrice(order.total_amount)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Delivery Address</h4>
                      <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        {order.delivery_address}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Order Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // View order details - you can implement this
                        toast.info('Order details view coming soon');
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    
                    {order.status === 'delivered' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Reorder functionality
                          toast.info('Reorder functionality coming soon');
                        }}
                      >
                        Order Again
                      </Button>
                    )}
                    
                    {order.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Cancel order functionality
                          toast.info('Cancel order functionality coming soon');
                        }}
                      >
                        Cancel Order
                      </Button>
                    )}
                  </div>

                  {/* Order Timeline for Active Orders */}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h5 className="font-medium mb-3">Order Progress</h5>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'].includes(order.status)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}>
                            <CheckCircle className="h-4 w-4" />
                          </div>
                          <span className="mt-1">Ordered</span>
                        </div>
                        <div className="flex-1 h-px bg-muted mx-2"></div>
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            ['confirmed', 'preparing', 'out_for_delivery', 'delivered'].includes(order.status)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}>
                            <CheckCircle className="h-4 w-4" />
                          </div>
                          <span className="mt-1">Confirmed</span>
                        </div>
                        <div className="flex-1 h-px bg-muted mx-2"></div>
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            ['preparing', 'out_for_delivery', 'delivered'].includes(order.status)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}>
                            <Package className="h-4 w-4" />
                          </div>
                          <span className="mt-1">Preparing</span>
                        </div>
                        <div className="flex-1 h-px bg-muted mx-2"></div>
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            ['out_for_delivery', 'delivered'].includes(order.status)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}>
                            <Truck className="h-4 w-4" />
                          </div>
                          <span className="mt-1">Out for Delivery</span>
                        </div>
                        <div className="flex-1 h-px bg-muted mx-2"></div>
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            order.status === 'delivered'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}>
                            <CheckCircle className="h-4 w-4" />
                          </div>
                          <span className="mt-1">Delivered</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;