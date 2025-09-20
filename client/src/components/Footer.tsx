import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t bg-card/50">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">Sweets & Treats Express</h3>
            <p className="text-muted-foreground">
              Premium sweets, cakes, chocolates and more. Freshly made with love.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/products?category=indian-sweets">Indian Sweets</Link></li>
              <li><Link to="/products?category=chocolates">Chocolates</Link></li>
              <li><Link to="/products?category=cakes">Cakes</Link></li>
              <li><Link to="/products?category=pastries">Pastries</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/orders">Track Order</Link></li>
              <li><Link to="/profile">My Account</Link></li>
              <li><a href="#" aria-label="FAQ">FAQ</a></li>
              <li><a href="#" aria-label="Contact">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Follow us</h4>
            <div className="flex gap-3">
              <a href="#" aria-label="Facebook" className="hover:text-primary"><Facebook size={18} /></a>
              <a href="#" aria-label="Instagram" className="hover:text-primary"><Instagram size={18} /></a>
              <a href="#" aria-label="Twitter" className="hover:text-primary"><Twitter size={18} /></a>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          © {year} Sweets & Treats Express. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
