'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Ticket, Check, Calendar, Users, ShoppingCart, X, Sparkles } from 'lucide-react';
import PassPurchaseModal from '@/components/PassPurchaseModal';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';

export default function BuyPassPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedPass, setSelectedPass] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loadingCart, setLoadingCart] = useState(false);

  const passes = [
    {
      id: 'general',
      name: 'General Pass',
      price: 250,
      description: 'Access to all events on November 7-8, 2025',
      features: [
        'Access to all events',
        'Valid for Nov 7-8, 2025',
        'Cultural performances',
        'Networking opportunities',
      ],
      popular: true,
    },
  ];

  // Fetch cart on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCart();
    }
  }, [isAuthenticated, user]);

  const fetchCart = async () => {
    if (!user) return;
    
    try {
      setLoadingCart(true);
      const token = await auth.currentUser?.getIdToken?.();
      const response = await fetch(`/api/special-events/register?userUid=${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCart(data.cartItems || []);
        setCartTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoadingCart(false);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const token = await auth.currentUser?.getIdToken?.();
      const response = await fetch(`/api/special-events/register?id=${cartItemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        fetchCart(); // Refresh cart
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const handleBuyPass = (pass) => {
    setSelectedPass(pass);
    setShowModal(true);
  };

  const handleBuyCustomPass = () => {
    if (cart.length === 0) {
      alert('Please add special events to your cart first');
      return;
    }
    
    const customPass = {
      id: 'custom',
      name: 'Custom Pass',
      price: cartTotal,
      description: `Access to ${cart.length} selected special event${cart.length > 1 ? 's' : ''}`,
      customEvents: cart.map(item => item.eventId),
      features: cart.map(item => `${item.eventTitle} - ₹${item.eventPrice}`),
    };
    setSelectedPass(customPass);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-background text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-audiowide mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Get Your Event Pass
          </h1>
          <p className="text-xl text-muted-text font-space max-w-2xl mx-auto">
            Purchase your pass and unlock access to DRESTEIN 2025's amazing events
          </p>
        </div>

        {/* Pass Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* General Pass */}
          {passes.map((pass) => (
            <div
              key={pass.id}
              className="relative bg-background-soft border border-primary rounded-2xl p-8 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-1 rounded-full text-sm font-audiowide">
                  Most Popular
                </span>
              </div>

              <div className="text-center mb-6">
                <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                  <Ticket className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-audiowide mb-2">{pass.name}</h3>
                <p className="text-muted-text font-space text-sm">{pass.description}</p>
              </div>

              <div className="text-center mb-6">
                <div className="text-5xl font-audiowide text-white mb-2">
                  ₹{pass.price}
                </div>
                <div className="text-muted-text font-space text-sm">One-time payment</div>
              </div>

              <ul className="space-y-3 mb-8">
                {pass.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-muted-text font-space">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleBuyPass(pass)}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-audiowide py-3 rounded-lg hover:from-hover-primary hover:to-primary transition-all duration-300"
              >
                Buy Now
              </button>
            </div>
          ))}

          {/* Custom Pass Card */}
          <div className="relative bg-background-soft border border-secondary rounded-2xl p-8 hover:shadow-xl hover:shadow-secondary/20 transition-all duration-300">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-secondary to-primary text-white px-4 py-1 rounded-full text-sm font-audiowide flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                Build Your Own
              </span>
            </div>

            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-secondary/10 rounded-full mb-4">
                <ShoppingCart className="w-12 h-12 text-secondary" />
              </div>
              <h3 className="text-2xl font-audiowide mb-2">Custom Pass</h3>
              <p className="text-muted-text font-space text-sm">
                Select specific competitions, workshops & special events
              </p>
            </div>

            <div className="text-center mb-6">
              <div className="text-5xl font-audiowide text-white mb-2">
                {cart.length > 0 ? `₹${cartTotal}` : 'Custom'}
              </div>
              <div className="text-muted-text font-space text-sm">
                {cart.length > 0 ? `${cart.length} event${cart.length > 1 ? 's' : ''} selected` : 'Pay only for what you want'}
              </div>
            </div>

            {/* Cart Preview */}
            {cart.length > 0 ? (
              <>
                <div className="bg-background border border-border rounded-lg p-4 mb-6 max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-white font-space truncate flex-1">{item.eventTitle}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-primary font-audiowide">₹{item.eventPrice}</span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleBuyCustomPass}
                  className="w-full bg-gradient-to-r from-secondary to-primary text-white font-audiowide py-3 rounded-lg hover:from-hover-primary hover:to-secondary transition-all duration-300 mb-3"
                >
                  Checkout - ₹{cartTotal}
                </button>
              </>
            ) : (
              <div className="bg-background border border-border rounded-lg p-6 mb-6 text-center">
                <p className="text-muted-text font-space text-sm mb-4">
                  Browse special events and add them to your cart
                </p>
              </div>
            )}

            <button
              onClick={() => router.push('/special-events')}
              className="w-full bg-background-soft border border-border text-white font-audiowide py-3 rounded-lg hover:bg-background hover:border-secondary transition-all duration-300"
            >
              Browse Special Events
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-background-soft border border-border rounded-xl p-6 text-center">
            <Calendar className="w-10 h-10 text-primary mx-auto mb-4" />
            <h4 className="font-audiowide text-lg mb-2">Event Dates</h4>
            <p className="text-muted-text font-space text-sm">
              November 7-8, 2025
            </p>
          </div>

          <div className="bg-background-soft border border-border rounded-xl p-6 text-center">
            <Users className="w-10 h-10 text-primary mx-auto mb-4" />
            <h4 className="font-audiowide text-lg mb-2">For Everyone</h4>
            <p className="text-muted-text font-space text-sm">
              Students from all colleges welcome
            </p>
          </div>

          <div className="bg-background-soft border border-border rounded-xl p-6 text-center">
            <Ticket className="w-10 h-10 text-primary mx-auto mb-4" />
            <h4 className="font-audiowide text-lg mb-2">Instant Access</h4>
            <p className="text-muted-text font-space text-sm">
              Download your pass immediately after payment
            </p>
          </div>
        </div>
      </div>

      <Footer />

      {/* Purchase Modal */}
      {showModal && selectedPass && (
        <PassPurchaseModal
          passData={selectedPass}
          onClose={() => {
            setShowModal(false);
            setSelectedPass(null);
          }}
          onPurchased={() => {
            setShowModal(false);
            setSelectedPass(null);
            // Optionally redirect to my-passes page
          }}
        />
      )}
    </div>
  );
}
