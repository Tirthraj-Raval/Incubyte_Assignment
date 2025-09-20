// Mock data for categories and products
export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  image_url?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  stock_quantity: number;
  weight?: string;
  slug?: string;
  category_id: string;
  rating: number;
  reviews_count: number;
}

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Traditional Indian Sweets',
    description: 'Authentic handcrafted Indian sweets made with the finest ingredients',
    slug: 'indian-sweets',
    image_url: 'category-indian-sweets'
  },
  {
    id: '2',
    name: 'Premium Chocolates',
    description: 'Luxurious chocolate collection from around the world',
    slug: 'chocolates',
    image_url: 'category-chocolates'
  },
  {
    id: '3',
    name: 'Birthday & Celebration Cakes',
    description: 'Custom cakes for every special occasion',
    slug: 'cakes',
    image_url: 'category-cakes'
  },
  {
    id: '4',
    name: 'Artisan Pastries',
    description: 'French-inspired pastries and baked goods',
    slug: 'pastries',
    image_url: 'category-pastries'
  },
  {
    id: '5',
    name: 'Ice Cream & Frozen Treats',
    description: 'Creamy ice creams and refreshing frozen desserts',
    slug: 'ice-cream',
    image_url: 'category-ice-cream'
  },
  {
    id: '6',
    name: 'Cookies & Biscuits',
    description: 'Freshly baked cookies and gourmet biscuits',
    slug: 'cookies',
    image_url: 'category-cookies'
  }
];

export const mockProducts: Product[] = [
  // Indian Sweets
  {
    id: '1',
    name: 'Premium Rasgulla',
    description: 'Soft, spongy cottage cheese balls soaked in aromatic sugar syrup',
    price: 299,
    stock_quantity: 15,
    weight: '500g',
    slug: 'rasgulla',
    category_id: '1',
    rating: 4.8,
    reviews_count: 124
  },
  {
    id: '2',
    name: 'Gulab Jamun',
    description: 'Golden brown milk solid dumplings in cardamom-flavored syrup',
    price: 349,
    stock_quantity: 8,
    weight: '500g',
    slug: 'gulab-jamun',
    category_id: '1',
    rating: 4.9,
    reviews_count: 89
  },
  {
    id: '3',
    name: 'Kaju Katli',
    description: 'Diamond-shaped cashew fudge with silver leaf garnish',
    price: 599,
    stock_quantity: 12,
    weight: '250g',
    slug: 'kaju-katli',
    category_id: '1',
    rating: 4.7,
    reviews_count: 156
  },
  {
    id: '4',
    name: 'Motichoor Laddu',
    description: 'Round sweets made from tiny gram flour pearls',
    price: 399,
    stock_quantity: 20,
    weight: '400g',
    slug: 'motichoor-laddu',
    category_id: '1',
    rating: 4.6,
    reviews_count: 78
  },
  {
    id: '5',
    name: 'Jalebi',
    description: 'Crispy spiral-shaped sweets soaked in saffron syrup',
    price: 249,
    stock_quantity: 18,
    weight: '300g',
    slug: 'jalebi',
    category_id: '1',
    rating: 4.5,
    reviews_count: 92
  },

  // Chocolates
  {
    id: '6',
    name: 'Dark Chocolate Truffles',
    description: 'Rich 70% dark chocolate truffles with ganache center',
    price: 799,
    stock_quantity: 6,
    weight: '200g',
    slug: 'dark-chocolate-truffle',
    category_id: '2',
    rating: 4.9,
    reviews_count: 203
  },
  {
    id: '7',
    name: 'Milk Chocolate Bonbons',
    description: 'Creamy milk chocolate with assorted flavor fillings',
    price: 699,
    stock_quantity: 10,
    weight: '250g',
    slug: 'milk-chocolate-bonbons',
    category_id: '2',
    rating: 4.8,
    reviews_count: 167
  },
  {
    id: '8',
    name: 'White Chocolate Hearts',
    description: 'Delicate white chocolate in heart shapes',
    price: 549,
    stock_quantity: 14,
    weight: '180g',
    slug: 'white-chocolate-hearts',
    category_id: '2',
    rating: 4.6,
    reviews_count: 89
  },
  {
    id: '9',
    name: 'Chocolate Pralines',
    description: 'Hazelnut pralines covered in Belgian chocolate',
    price: 899,
    stock_quantity: 7,
    weight: '300g',
    slug: 'chocolate-pralines',
    category_id: '2',
    rating: 4.9,
    reviews_count: 134
  },

  // Cakes
  {
    id: '10',
    name: 'Chocolate Birthday Cake',
    description: 'Rich chocolate cake with buttercream frosting',
    price: 1299,
    stock_quantity: 5,
    weight: '1kg',
    slug: 'chocolate-birthday-cake',
    category_id: '3',
    rating: 4.9,
    reviews_count: 245
  },
  {
    id: '11',
    name: 'Vanilla Bean Cake',
    description: 'Moist vanilla cake with fresh vanilla bean cream',
    price: 1199,
    stock_quantity: 8,
    weight: '1kg',
    slug: 'vanilla-bean-cake',
    category_id: '3',
    rating: 4.7,
    reviews_count: 178
  },
  {
    id: '12',
    name: 'Red Velvet Cake',
    description: 'Classic red velvet with cream cheese frosting',
    price: 1399,
    stock_quantity: 6,
    weight: '1kg',
    slug: 'red-velvet-cake',
    category_id: '3',
    rating: 4.8,
    reviews_count: 198
  },
  {
    id: '13',
    name: 'Black Forest Cake',
    description: 'Chocolate sponge with cherries and whipped cream',
    price: 1499,
    stock_quantity: 4,
    weight: '1kg',
    slug: 'black-forest-cake',
    category_id: '3',
    rating: 4.8,
    reviews_count: 156
  },

  // Pastries
  {
    id: '14',
    name: 'French Croissants',
    description: 'Buttery, flaky croissants baked fresh daily',
    price: 199,
    stock_quantity: 25,
    weight: '4 pieces',
    slug: 'croissant',
    category_id: '4',
    rating: 4.7,
    reviews_count: 89
  },
  {
    id: '15',
    name: 'Chocolate Eclairs',
    description: 'Choux pastry filled with chocolate cream',
    price: 299,
    stock_quantity: 16,
    weight: '6 pieces',
    slug: 'chocolate-eclairs',
    category_id: '4',
    rating: 4.6,
    reviews_count: 67
  },
  {
    id: '16',
    name: 'Fruit Tarts',
    description: 'Crisp pastry shells with custard and fresh fruits',
    price: 399,
    stock_quantity: 12,
    weight: '4 pieces',
    slug: 'fruit-tarts',
    category_id: '4',
    rating: 4.8,
    reviews_count: 112
  },
  {
    id: '17',
    name: 'Macarons Box',
    description: 'Assorted French macarons in gift box',
    price: 599,
    stock_quantity: 9,
    weight: '12 pieces',
    slug: 'macarons-box',
    category_id: '4',
    rating: 4.9,
    reviews_count: 203
  },

  // Ice Cream
  {
    id: '18',
    name: 'Vanilla Bean Ice Cream',
    description: 'Premium vanilla ice cream with real vanilla beans',
    price: 349,
    stock_quantity: 20,
    weight: '500ml',
    slug: 'vanilla-ice-cream',
    category_id: '5',
    rating: 4.7,
    reviews_count: 145
  },
  {
    id: '19',
    name: 'Chocolate Fudge Sundae',
    description: 'Rich chocolate ice cream with fudge sauce',
    price: 399,
    stock_quantity: 15,
    weight: '500ml',
    slug: 'chocolate-fudge-sundae',
    category_id: '5',
    rating: 4.8,
    reviews_count: 167
  },
  {
    id: '20',
    name: 'Strawberry Sorbet',
    description: 'Refreshing strawberry sorbet made with fresh fruits',
    price: 299,
    stock_quantity: 18,
    weight: '400ml',
    slug: 'strawberry-sorbet',
    category_id: '5',
    rating: 4.6,
    reviews_count: 89
  },
  {
    id: '21',
    name: 'Kulfi Sticks',
    description: 'Traditional Indian frozen dessert on sticks',
    price: 249,
    stock_quantity: 22,
    weight: '6 pieces',
    slug: 'kulfi-sticks',
    category_id: '5',
    rating: 4.7,
    reviews_count: 134
  },

  // Cookies
  {
    id: '22',
    name: 'Chocolate Chip Cookies',
    description: 'Classic cookies loaded with chocolate chips',
    price: 199,
    stock_quantity: 30,
    weight: '300g',
    slug: 'chocolate-chip-cookies',
    category_id: '6',
    rating: 4.5,
    reviews_count: 98
  },
  {
    id: '23',
    name: 'Butter Shortbread',
    description: 'Traditional Scottish shortbread cookies',
    price: 249,
    stock_quantity: 25,
    weight: '250g',
    slug: 'butter-shortbread',
    category_id: '6',
    rating: 4.6,
    reviews_count: 76
  },
  {
    id: '24',
    name: 'Oatmeal Raisin Cookies',
    description: 'Wholesome oats with plump raisins',
    price: 229,
    stock_quantity: 28,
    weight: '300g',
    slug: 'oatmeal-raisin-cookies',
    category_id: '6',
    rating: 4.4,
    reviews_count: 67
  }
];