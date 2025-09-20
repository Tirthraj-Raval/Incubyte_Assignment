import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  User,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  delivery_address: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  order_items?: OrderItem[];
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  products: Product;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  is_available: boolean;
  created_at: string;
  categories?: {
    name: string;
  };
}

interface Customer {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  is_admin: boolean;
  created_at: string;
}

const Admin = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState({ orders: 1, products: 1, customers: 1 });
  const [totalPages, setTotalPages] = useState({ orders: 1, products: 1, customers: 1 });
  const [totalCount, setTotalCount] = useState({ orders: 0, products: 0, customers: 0 });
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!profileLoading && profile && !profile.is_admin) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    if (profile?.is_admin) {
      fetchDashboardData();
    }
  }, [user, profile, profileLoading, navigate]);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const [ordersRes, productsRes, profilesRes] = await Promise.all([
        supabase.from('orders').select('total_amount, status', { count: 'exact' }),
        supabase.from('products').select('*', { count: 'exact' }),
        supabase.from('user_profiles').select('*', { count: 'exact' })
      ]);

      const orders = ordersRes.data || [];
      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
      const pendingOrders = orders.filter(order => order.status === 'pending').length;

      setStats({
        totalOrders: ordersRes.count || 0,
        totalRevenue,
        totalProducts: productsRes.count || 0,
        totalCustomers: profilesRes.count || 0,
        pendingOrders,
      });

      // Fetch recent orders
      const { data: recentOrdersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentOrders(recentOrdersData || []);

      // Fetch recent products
      const { data: recentProductsData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentProducts(recentProductsData || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (page: number = 1, status: string = 'all') => {
    try {
      let query = supabase
        .from('orders')
        .select('*, order_items(*, products(*))', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * 10, page * 10 - 1);

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data: ordersData, error, count } = await query;

      if (error) {
        throw error;
      }

      setOrders(ordersData || []);
      setTotalPages(prev => ({ ...prev, orders: Math.ceil((count || 0) / 10) }));
      setTotalCount(prev => ({ ...prev, orders: count || 0 }));
      setCurrentPage(prev => ({ ...prev, orders: page }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    }
  };

  const fetchProducts = async (page: number = 1) => {
    try {
      const { data: productsData, error, count } = await supabase
        .from('products')
        .select('*, categories(name)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * 10, page * 10 - 1);

      if (error) {
        throw error;
      }

      setProducts(productsData || []);
      setTotalPages(prev => ({ ...prev, products: Math.ceil((count || 0) / 10) }));
      setTotalCount(prev => ({ ...prev, products: count || 0 }));
      setCurrentPage(prev => ({ ...prev, products: page }));
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  const fetchCustomers = async (page: number = 1) => {
    try {
      // First get user profiles
      const { data: profilesData, error: profilesError, count } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * 10, page * 10 - 1);

      if (profilesError) {
        throw profilesError;
      }

      // Then get user emails from auth.users
      const { data: authUsersData, error: authError } = await supabase
        .rpc('is_admin')
        .then((res) => ({ data: Array.isArray(res.data) ? res.data : [], error: res.error })); // Ensure data is an array

      if (authError) {
        throw authError;
      }

      // Combine the data
      const customersWithEmail = profilesData?.map(profile => {
        const authUser = authUsersData?.find(user => user.id === profile.user_id);
        return {
          ...profile,
          email: authUser?.email || 'No email',
          id: profile.id || profile.user_id
        };
      }) || [];

      setCustomers(customersWithEmail);
      setTotalPages(prev => ({ ...prev, customers: Math.ceil((count || 0) / 10) }));
      setTotalCount(prev => ({ ...prev, customers: count || 0 }));
      setCurrentPage(prev => ({ ...prev, customers: page }));
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        throw error;
      }

      toast.success('Order status updated successfully');
      fetchOrders(currentPage.orders, orderStatusFilter);
      fetchDashboardData(); // Refresh stats
      setIsOrderDialogOpen(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', selectedProduct.id);

      if (error) {
        throw error;
      }

      toast.success('Product deleted successfully');
      fetchProducts(currentPage.products);
      fetchDashboardData(); // Refresh stats
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
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
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const Pagination = ({ type, currentPage, totalPages, onPageChange }: { 
    type: 'orders' | 'products' | 'customers'; 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void; 
  }) => (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-muted-foreground">
        Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount[type])} of {totalCount[type]} items
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile?.is_admin) {
    return null;
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
          <div className="flex-1">
            <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your sweet shop business</p>
          </div>
          <Badge variant="secondary" className="text-sm">
            Welcome, {profile.full_name || 'Admin'}
          </Badge>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatPrice(stats.totalRevenue)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-300" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{stats.totalOrders}</p>
                    {stats.pendingOrders > 0 && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">
                        {stats.pendingOrders} pending
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Products</p>
                    <p className="text-2xl font-bold">{stats.totalProducts}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Customers</p>
                    <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="space-y-6" onValueChange={(tab) => {
          if (tab === 'orders') fetchOrders(1, orderStatusFilter);
          if (tab === 'products') fetchProducts(1);
          if (tab === 'customers') fetchCustomers(1);
        }}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card className="animate-slide-in-right">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Recent Orders
                    </span>
                    <Button variant="outline" size="sm" onClick={() => fetchOrders(1, orderStatusFilter)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer" onClick={() => {
                        setSelectedOrder(order);
                        setIsOrderDialogOpen(true);
                      }}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">#{order.order_number}</span>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">{order.status}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {order.customer_name} • {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-primary">
                            {formatPrice(order.total_amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Recent Products
                    </span>
                    <Button variant="outline" size="sm" onClick={() => navigate('/admin/products/new')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{product.name}</span>
                            <Badge variant={product.is_available ? 'default' : 'secondary'}>
                              {product.is_available ? 'Available' : 'Unavailable'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Stock: {product.stock_quantity} • Added {formatDate(product.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-primary">
                            {formatPrice(product.price)}
                          </p>
                          <div className="flex gap-1 mt-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600" onClick={() => {
                              setSelectedProduct(product);
                              setIsDeleteDialogOpen(true);
                            }}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Order Management</span>
                  <div className="flex items-center gap-4">
                    <Select value={orderStatusFilter} onValueChange={(value) => {
                      setOrderStatusFilter(value);
                      fetchOrders(1, value);
                    }}>
                      <SelectTrigger className="w-32">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Orders</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search orders..." className="pl-8 w-64" />
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 cursor-pointer" onClick={() => {
                      setSelectedOrder(order);
                      setIsOrderDialogOpen(true);
                    }}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">#{order.order_number}</span>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status}</span>
                          </Badge>
                          <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                            {order.payment_status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {order.customer_name} • {order.customer_email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary text-lg">
                          {formatPrice(order.total_amount)}
                        </p>
                        <Button variant="ghost" size="sm" className="mt-2">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Pagination 
                  type="orders" 
                  currentPage={currentPage.orders} 
                  totalPages={totalPages.orders} 
                  onPageChange={(page) => fetchOrders(page, orderStatusFilter)} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Product Management</span>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search products..." className="pl-8 w-64" />
                    </div>
                    <Button onClick={() => navigate('/admin/products/new')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{product.name}</span>
                          <Badge variant={product.is_available ? 'default' : 'secondary'}>
                            {product.is_available ? 'Available' : 'Unavailable'}
                          </Badge>
                          {product.categories && (
                            <Badge variant="outline">
                              {product.categories.name}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Stock: {product.stock_quantity} • Price: {formatPrice(product.price)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Added {formatDate(product.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary text-lg">
                          {formatPrice(product.price)}
                        </p>
                        <div className="flex gap-1 mt-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600" onClick={() => {
                            setSelectedProduct(product);
                            setIsDeleteDialogOpen(true);
                          }}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Pagination 
                  type="products" 
                  currentPage={currentPage.products} 
                  totalPages={totalPages.products} 
                  onPageChange={fetchProducts} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Customer Management</span>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search customers..." className="pl-8 w-64" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{customer.full_name || 'Unknown Customer'}</span>
                          {customer.is_admin && (
                            <Badge variant="default">Admin</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{customer.email}</span>
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                        </div>
                        {customer.address && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{customer.address}</span>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                          Joined {formatDate(customer.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Pagination 
                  type="customers" 
                  currentPage={currentPage.customers} 
                  totalPages={totalPages.customers} 
                  onPageChange={fetchCustomers} 
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Order Detail Dialog */}
        <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order #{selectedOrder?.order_number}</DialogTitle>
              <DialogDescription>
                Order placed on {selectedOrder && formatDate(selectedOrder.created_at)}
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Customer Information</h3>
                    <p>{selectedOrder.customer_name}</p>
                    <p className="text-muted-foreground">{selectedOrder.customer_email}</p>
                    {selectedOrder.customer_phone && (
                      <p className="text-muted-foreground">{selectedOrder.customer_phone}</p>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Delivery Address</h3>
                    <p className="text-muted-foreground">{selectedOrder.delivery_address}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Order Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.order_items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b">
                        <div>
                          <p className="font-medium">{item.products.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center border-t pt-4">
                  <h3 className="font-semibold">Total Amount</h3>
                  <p className="text-2xl font-bold text-primary">{formatPrice(selectedOrder.total_amount)}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-semibold">Update Status:</span>
                  <Select
                    defaultValue={selectedOrder.status}
                    onValueChange={(value) => handleUpdateOrderStatus(selectedOrder.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the product "{selectedProduct?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteProduct}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Admin;