import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Star, ShoppingCart, Sparkles, Search, Filter, Heart, User, Package, Settings, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import CartDrawer from '@/components/CartDrawer';
import heroImage from '@/assets/hero-banner.jpg';
import rasgulaImage from '@/assets/rasgulla.jpg';
import gulabJamunImage from '@/assets/gulab-jamun.jpg';
import chocolateImage from '@/assets/dark-chocolate-truffle.jpg';
import cakeImage from '@/assets/chocolate-birthday-cake.jpg';
import croissantImage from '@/assets/croissant.jpg';
import categoryIndianImage from '@/assets/category-indian-sweets.jpg';
import categoryChocolatesImage from '@/assets/category-chocolates.jpg';
import categoryCakesImage from '@/assets/category-cakes.jpg';
import categoryPastriesImage from '@/assets/category-pastries.jpg';
import categoryIceCreamImage from '@/assets/category-ice-cream.jpg';
import categoryCookiesImage from '@/assets/category-cookies.jpg';
import { mockCategories, mockProducts, type Category, type Product } from '@/data/mockData';
import { productsAPI, categoriesAPI } from '@/lib/api';

const ComprehensiveHome = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [currentTab, setCurrentTab] = useState('home');
  const [cartOpen, setCartOpen] = useState(false);
  const { user, logout } = useAuth();
  const { addItem, items } = useCartStore();

  // Category images mapping
  const categoryImages: { [key: string]: string } = {
    'category-indian-sweets': categoryIndianImage,
    'category-chocolates': categoryChocolatesImage,
    'category-cakes': categoryCakesImage,
    'category-pastries': categoryPastriesImage,
    'category-ice-cream': categoryIceCreamImage,
    'category-cookies': categoryCookiesImage,
  };

  // Product images mapping
  const productImages: { [key: string]: string } = {
    'rasgulla': rasgulaImage,
    'gulab-jamun': gulabJamunImage,
    'dark-chocolate-truffle': chocolateImage,
    'chocolate-birthday-cake': cakeImage,
    'croissant': croissantImage,
  };

  useEffect(() => {
  const fetchData = async () => {
    try {
      const [categoriesData, productsData] = await Promise.all([
        categoriesAPI.getAll(),
        productsAPI.getAll()
      ]);
      setCategories(categoriesData);
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  fetchData();
}, []);


  // Filter and search products
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category_id === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'popularity':
          return b.reviews_count - a.reviews_count;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [selectedCategory, searchQuery, sortBy, products]);

  const handleAddToCart = (product: Product) => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      setCurrentTab('auth');
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      stock_quantity: product.stock_quantity,
    });

    toast.success(`${product.name} added to cart!`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const handleLogout = async () => {
    await logout();
    setCurrentTab('home');
    toast.success('Signed out successfully');
  };

  // Welcome section for logged-in users
  const WelcomeSection = () => (
    <section className="py-12 px-4 bg-gradient-secondary">
      <div className="container mx-auto">
        <div className="text-center animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-accent mr-2" />
            <Badge className="bg-accent text-accent-foreground border-none">
              Welcome Back!
            </Badge>
          </div>
          
          <h2 className="text-4xl font-bold mb-4 gradient-text">
            Hello, {user?.user_metadata?.full_name || 'Sweet Lover'}! 🎉
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Your favorite treats are waiting for you. Explore our latest additions and exclusive offers just for you!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="sweet-card">
              <CardContent className="p-6 text-center">
                <ShoppingCart className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Cart Items</h3>
                <p className="text-2xl font-bold text-primary">{items.length}</p>
              </CardContent>
            </Card>
            
            <Card className="sweet-card">
              <CardContent className="p-6 text-center">
                <Heart className="h-8 w-8 text-sweet-pink mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Favorites</h3>
                <p className="text-2xl font-bold text-sweet-pink">12</p>
              </CardContent>
            </Card>
            
            <Card className="sweet-card">
              <CardContent className="p-6 text-center">
                <Package className="h-8 w-8 text-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Orders</h3>
                <p className="text-2xl font-bold text-accent">5</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );

  // Hero Section
  const HeroSection = () => (
    <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
      </div>
      
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4 animate-fade-in">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-accent mr-2 animate-bounce-gentle" />
          <Badge className="bg-accent text-accent-foreground border-none">
            Premium Quality
          </Badge>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text bg-gradient-to-r from-white via-accent to-primary bg-clip-text text-transparent">
          Sweets & Treats Express
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
          Indulge in our exquisite collection of traditional Indian sweets, premium chocolates, fresh cakes, and artisanal pastries
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="btn-hero text-lg px-8 py-6 hover-lift"
            onClick={() => setCurrentTab('products')}
          >
            Explore Our Collection
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          {!user && (
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20 hover-lift"
              onClick={() => setCurrentTab('auth')}
            >
              Sign In for Exclusive Offers
            </Button>
          )}
        </div>
      </div>
    </section>
  );

  // Categories Section
  const CategoriesSection = () => (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-4xl font-bold mb-4 gradient-text">
            Our Sweet Categories
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our carefully curated selection of sweets and treats from around the world
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => {
            const categoryImage = categoryImages[category.image_url as keyof typeof categoryImages];
            
            return (
              <div
                key={category.id}
                className="group cursor-pointer"
                onClick={() => {
                  setSelectedCategory(category.id);
                  setCurrentTab('products');
                }}
              >
                <Card className="product-card h-full overflow-hidden">
                  <div className="aspect-video relative overflow-hidden">
                    {categoryImage ? (
                      <img
                        src={categoryImage}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-card flex items-center justify-center">
                        <span className="text-6xl">🍯</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-primary opacity-20"></div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {category.description}
                    </p>
                    <div className="mt-4 flex items-center text-primary font-medium">
                      Explore Collection
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );

  // Products Section
  const ProductsSection = () => (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-4xl font-bold mb-4 gradient-text">
            All Products
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse our complete collection of delicious treats
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search for sweets, cakes, chocolates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const productImage = productImages[product.slug as keyof typeof productImages];
            
            return (
              <Card key={product.id} className="product-card overflow-hidden group">
                <div className="aspect-square relative overflow-hidden">
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-card flex items-center justify-center">
                      <span className="text-4xl">🍯</span>
                    </div>
                  )}
                  
                  {product.stock_quantity <= 5 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute top-2 right-2"
                    >
                      Only {product.stock_quantity} left
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center text-amber-400">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm ml-1">{product.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  {product.weight && (
                    <Badge variant="outline" className="text-xs mb-3">
                      {product.weight}
                    </Badge>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock_quantity === 0}
                      className="btn-hero"
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">No products found matching your search.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </section>
  );

  // Auth Section (Simple placeholder)
  const AuthSection = () => (
    <section className="py-16 px-4 min-h-[60vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication</h2>
          <p className="text-muted-foreground mb-6">
            Please use the authentication system to sign in or create an account.
          </p>
          <Button onClick={() => setCurrentTab('home')} variant="outline">
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </section>
  );

  // Profile Section
  const ProfileSection = () => (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 gradient-text">My Profile</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="sweet-card">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <User className="h-6 w-6 text-primary mr-2" />
                <h3 className="text-xl font-semibold">Account Details</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-lg">{user?.user_metadata?.full_name || 'User'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-lg">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="sweet-card">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <Settings className="h-6 w-6 text-primary mr-2" />
                <h3 className="text-xl font-semibold">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  View Orders
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="h-4 w-4 mr-2" />
                  My Favorites
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        {/* Navigation */}
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container mx-auto">
            <TabsList className="w-full justify-start h-14 bg-transparent">
              <TabsTrigger value="home" className="px-6">Home</TabsTrigger>
              <TabsTrigger value="products" className="px-6">Products</TabsTrigger>
              {!user && <TabsTrigger value="auth" className="px-6">Sign In</TabsTrigger>}
              {user && <TabsTrigger value="profile" className="px-6">Profile</TabsTrigger>}
            </TabsList>
          </div>
        </div>

        {/* Content */}
        <TabsContent value="home" className="m-0">
          <HeroSection />
          {user && <WelcomeSection />}
          <CategoriesSection />
        </TabsContent>

        <TabsContent value="products" className="m-0">
          <ProductsSection />
        </TabsContent>

        <TabsContent value="auth" className="m-0">
          <AuthSection />
        </TabsContent>

        {user && (
          <TabsContent value="profile" className="m-0">
            <ProfileSection />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ComprehensiveHome;