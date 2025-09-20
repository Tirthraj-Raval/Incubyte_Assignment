import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Star, ShoppingCart, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
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
import { productsAPI, categoriesAPI } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  image_url?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  stock_quantity: number;
  weight?: string;
  slug?: string;
}

const Home = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addItem } = useCartStore();
  const navigate = useNavigate();

  // Map product slugs to images
  const productImages: { [key: string]: string } = {
    'rasgulla': rasgulaImage,
    'gulab-jamun': gulabJamunImage,
    'dark-chocolate-truffle': chocolateImage,
    'chocolate-birthday-cake': cakeImage,
    'croissant': croissantImage,
  };

  // Map category slugs to images
  const categoryImages: { [key: string]: string } = {
    'indian-sweets': categoryIndianImage,
    'chocolates': categoryChocolatesImage,
    'cakes': categoryCakesImage,
    'pastries': categoryPastriesImage,
    'ice-cream': categoryIceCreamImage,
    'cookies': categoryCookiesImage,
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
  try {
    // Fetch categories
    const categoriesData = await categoriesAPI.getAll();

    // Fetch featured products (first 6)
    const productsData = await productsAPI.getAll();

    setCategories(categoriesData || []);
    setFeaturedProducts(productsData.slice(0, 6) || []);
  } catch (error) {
    console.error('Error fetching data:', error);
    toast.error('Failed to load data');
  } finally {
    setLoading(false);
  }
};

  const handleAddToCart = (product: Product) => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      navigate('/auth');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
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
              onClick={() => navigate('/products')}
            >
              Explore Our Collection
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            {!user && (
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20 hover-lift"
                onClick={() => navigate('/auth')}
              >
                Sign In for Exclusive Offers
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 bg-gradient-secondary">
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
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className="group"
              >
                <Card className="product-card h-full overflow-hidden">
                  <div className="aspect-video relative overflow-hidden">
                    {categoryImages[category.slug] ? (
                      <img
                        src={categoryImages[category.slug]}
                        alt={`${category.name} category`}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-card" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent"></div>
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
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-4xl font-bold mb-4 gradient-text">
              Featured Delights
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Hand-picked favorites that our customers love the most
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => {
              const productImage = productImages[product.slug as keyof typeof productImages];
              
              return (
                <Card key={product.id} className="product-card overflow-hidden">
                  <div className="aspect-square relative overflow-hidden">
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-card flex items-center justify-center">
                        <span className="text-6xl">🍯</span>
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
                  
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center text-amber-400">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm ml-1">4.8</span>
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
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product);
                        }}
                        disabled={product.stock_quantity === 0}
                        className="btn-hero"
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/products')}
              className="hover-lift"
            >
              View All Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-gradient-hero text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Satisfy Your Sweet Cravings?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of happy customers who trust us for their special moments and daily indulgences
          </p>
          
          {user ? (
            <Button 
              size="lg"
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 hover-lift"
              onClick={() => navigate('/products')}
            >
              Start Shopping Now
              <ShoppingCart className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button 
              size="lg"
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 hover-lift"
              onClick={() => navigate('/auth')}
            >
              Create Your Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;