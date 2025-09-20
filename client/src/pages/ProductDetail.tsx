import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Star, ShoppingCart, Heart, Share2, Plus, Minus, Shield, Truck, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';
import rasgulaImage from '@/assets/rasgulla.jpg';
import gulabJamunImage from '@/assets/gulab-jamun.jpg';
import chocolateImage from '@/assets/dark-chocolate-truffle.jpg';
import cakeImage from '@/assets/chocolate-birthday-cake.jpg';
import croissantImage from '@/assets/croissant.jpg';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  stock_quantity: number;
  weight?: string;
  slug?: string;
  category_id?: string;
  ingredients?: string;
  allergens?: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
}

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { user } = useAuth();
  const { addItem } = useCartStore();

  // Map product slugs to images
  const productImages: { [key: string]: string } = {
    'rasgulla': rasgulaImage,
    'gulab-jamun': gulabJamunImage,
    'dark-chocolate-truffle': chocolateImage,
    'chocolate-birthday-cake': cakeImage,
    'croissant': croissantImage,
  };

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    if (!slug) return;

    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_available', true)
        .single();

      if (productError) throw productError;

      setProduct(productData);

      // Fetch category if product has one
      if (productData.category_id) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', productData.category_id)
          .single();

        setCategory(categoryData);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      navigate('/auth');
      return;
    }

    if (!product) return;

    // Add the specified quantity
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        stock_quantity: product.stock_quantity,
      });
    }

    toast.success(`${quantity} × ${product.name} added to cart!`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const adjustQuantity = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock_quantity || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Button onClick={() => navigate('/products')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const productImage = productImages[product.slug as keyof typeof productImages];

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/products')}
            className="p-0 h-auto hover:bg-transparent hover:text-primary"
          >
            Products
          </Button>
          {category && (
            <>
              <span>/</span>
              <span>{category.name}</span>
            </>
          )}
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4 animate-fade-in">
            <div className="aspect-square rounded-lg overflow-hidden bg-gradient-card relative">
              {productImage ? (
                <img
                  src={productImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-8xl">🍯</span>
                </div>
              )}
              
              {product.stock_quantity <= 5 && (
                <Badge 
                  variant="destructive" 
                  className="absolute top-4 right-4"
                >
                  Only {product.stock_quantity} left
                </Badge>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6 animate-slide-in-right">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {category && (
                  <Badge variant="outline">{category.name}</Badge>
                )}
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                  <span className="text-sm ml-2 text-foreground">4.8 (124 reviews)</span>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
                {product.name}
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.weight && (
                <span className="text-muted-foreground">per {product.weight}</span>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => adjustQuantity(-1)}
                    disabled={quantity <= 1}
                    className="rounded-r-none"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[60px] text-center border-x">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => adjustQuantity(1)}
                    disabled={quantity >= product.stock_quantity}
                    className="rounded-l-none"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.stock_quantity} available
                </span>
              </div>

              {/* Total Price */}
              <div className="text-lg">
                <span className="text-muted-foreground">Total: </span>
                <span className="font-bold text-primary">
                  {formatPrice(product.price * quantity)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className="btn-hero flex-1"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={isWishlisted ? 'text-red-500 border-red-500' : ''}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleShare}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-card rounded-lg border">
              <div className="text-center space-y-2">
                <Shield className="h-6 w-6 mx-auto text-primary" />
                <div className="text-sm">
                  <div className="font-medium">Quality</div>
                  <div className="text-muted-foreground">Guaranteed</div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <Truck className="h-6 w-6 mx-auto text-primary" />
                <div className="text-sm">
                  <div className="font-medium">Free Delivery</div>
                  <div className="text-muted-foreground">Above ₹500</div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <RefreshCw className="h-6 w-6 mx-auto text-primary" />
                <div className="text-sm">
                  <div className="font-medium">Easy Returns</div>
                  <div className="text-muted-foreground">7 day policy</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="mt-16 space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Ingredients */}
            {product.ingredients && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Ingredients</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.ingredients}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Allergens */}
            {product.allergens && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Allergen Information</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.allergens}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Additional Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Product Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {product.weight && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weight/Size:</span>
                      <span className="font-medium">{product.weight}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stock:</span>
                    <span className="font-medium">{product.stock_quantity} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SKU:</span>
                    <span className="font-medium">{product.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shelf Life:</span>
                    <span className="font-medium">7-10 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Storage:</span>
                    <span className="font-medium">Cool, dry place</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Origin:</span>
                    <span className="font-medium">Made in India</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;