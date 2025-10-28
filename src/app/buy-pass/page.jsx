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
  const [generalPassInCart, setGeneralPassInCart] = useState(false);

  const passes = [
    {
      id: 'general',
      name: 'General Pass',
      price: 300,
      description: 'Access to all events on November 7-8, 2025',
      features: [
        'Access to all events on Nov 7-8, 2025',
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
        const cartItems = data.cartItems || [];
        
        // Check if general pass is in cart
        const hasGeneralPass = cartItems.some(item => item.eventId === 'general-pass');
        setGeneralPassInCart(hasGeneralPass);
        
        // Filter out general pass for display (we'll show it separately)
        const specialEventsOnly = cartItems.filter(item => item.eventId !== 'general-pass');
        setCart(specialEventsOnly);
        
        // Calculate total including general pass if present
        const specialEventsTotal = specialEventsOnly.reduce((sum, item) => sum + (item.eventPrice || 0), 0);
        const generalPassPrice = hasGeneralPass ? 300 : 0;
        setCartTotal(specialEventsTotal + generalPassPrice);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoadingCart(false);
    }
  };

  const addGeneralPassToCart = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      return;
    }

    try {
      const token = await auth.currentUser?.getIdToken?.();
      const response = await fetch('/api/special-events/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId: 'general-pass',
          eventTitle: 'General Pass',
          eventPrice: 300,
          eventType: 'individual',
          userUid: user.uid,
        }),
      });

      if (response.ok) {
        fetchCart(); // Refresh cart
      }
    } catch (error) {
      console.error('Error adding general pass to cart:', error);
    }
  };

  const removeGeneralPassFromCart = async () => {
    try {
      const token = await auth.currentUser?.getIdToken?.();
      // OPTIMIZED: Fetch cart once to find general pass item
      const response = await fetch(`/api/special-events/register?userUid=${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        const generalPassItem = data.cartItems?.find(item => item.eventId === 'general-pass');
        
        if (generalPassItem) {
          await fetch(`/api/special-events/register?id=${generalPassItem.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          // Update state directly to avoid another fetch
          setGeneralPassInCart(false);
          setCartTotal(cart.reduce((sum, item) => sum + (item.eventPrice || 0), 0));
        }
      }
    } catch (error) {
      console.error('Error removing general pass from cart:', error);
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
    if (cart.length === 0 && !generalPassInCart) {
      alert('Please add items to your cart first');
      return;
    }
    
    const items = [];
    if (generalPassInCart) {
      items.push('General Pass - ₹300');
    }
    items.push(...cart.map(item => `${item.eventTitle} - ₹${item.eventPrice}`));
    
    const customPass = {
      id: 'custom',
      name: 'Custom Pass',
      price: cartTotal,
      description: generalPassInCart 
        ? `General Pass + ${cart.length} special event${cart.length !== 1 ? 's' : ''}`
        : `Access to ${cart.length} selected special event${cart.length > 1 ? 's' : ''}`,
      customEvents: cart.map(item => item.eventId),
      includesGeneralPass: generalPassInCart,
      features: items,
    };
    setSelectedPass(customPass);
    setShowModal(true);
  };

  // Set to false to show Coming Soon, true to show pass purchase
  const showPassPurchase = true;

  return (
    <div className="min-h-screen bg-background text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-16">
        {!showPassPurchase ? (
         
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-audiowide mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Coming Soon
              </h1>
              <p className="text-xl text-muted-text font-space max-w-2xl mx-auto mb-8">
                Pass sales will be available soon. Stay tuned for updates!
              </p>
              
            </div>
          </div>
        ) : (
          <>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
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

              {isAuthenticated ? (
                <div className="space-y-3">
                  {!generalPassInCart ? (
                    <>
                      <button
                        onClick={addGeneralPassToCart}
                        className="w-full bg-gradient-to-r from-primary to-secondary text-white font-audiowide py-3.5 rounded-lg hover:from-hover-primary hover:to-primary transition-all duration-300"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleBuyPass(pass)}
                        className="w-full bg-background-soft border border-primary text-white font-audiowide py-3.5 rounded-lg hover:bg-background transition-all duration-300"
                      >
                        Buy Separately
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="bg-primary/10 border-2 border-primary text-primary font-audiowide py-3.5 rounded-lg text-center flex items-center justify-center gap-2">
                        <Check size={18} />
                        Added to Cart
                      </div>
                      <button
                        onClick={removeGeneralPassFromCart}
                        className="w-full bg-background-soft border border-red-500 text-red-500 font-audiowide py-3.5 rounded-lg hover:bg-red-500/10 transition-all duration-300"
                      >
                        Remove from Cart
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleBuyPass(pass)}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white font-audiowide py-3.5 rounded-lg hover:from-hover-primary hover:to-primary transition-all duration-300"
                >
                  Buy Now
                </button>
              )}
            </div>
          ))}

       
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
                {(cart.length > 0 || generalPassInCart) ? `₹${cartTotal}` : 'Custom'}
              </div>
              <div className="text-muted-text font-space text-sm">
                {generalPassInCart && cart.length > 0 
                  ? `General Pass + ${cart.length} event${cart.length !== 1 ? 's' : ''}`
                  : generalPassInCart 
                  ? 'General Pass selected'
                  : cart.length > 0 
                  ? `${cart.length} event${cart.length > 1 ? 's' : ''} selected`
                  : 'Pay only for what you want'}
              </div>
            </div>

          
            {(cart.length > 0 || generalPassInCart) ? (
              <>
                <div className="bg-background border border-border rounded-lg p-4 mb-6 max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {/* General Pass */}
                    {generalPassInCart && (
                      <div className="flex items-center justify-between text-sm bg-primary/5 rounded p-2">
                        <span className="text-white font-space truncate flex-1 font-semibold">General Pass</span>
                        <div className="flex items-center gap-2">
                          <span className="text-primary font-audiowide">₹300</span>
                          <button
                            onClick={removeGeneralPassFromCart}
                            className="text-red-500 hover:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Special Events */}
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

                <div className="space-y-3">
                  <button
                    onClick={handleBuyCustomPass}
                    className="w-full bg-gradient-to-r from-secondary to-primary text-white font-audiowide py-3.5 rounded-lg hover:from-hover-primary hover:to-secondary transition-all duration-300"
                  >
                    Checkout - ₹{cartTotal}
                  </button>
                  <button
                    onClick={() => router.push('/special-events')}
                    className="w-full bg-background-soft border border-secondary text-white font-audiowide py-3.5 rounded-lg hover:bg-background transition-all duration-300"
                  >
                    Add More Events
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-background border border-border rounded-lg p-6 text-center">
                  <p className="text-muted-text font-space text-sm">
                    Your cart is empty. Add events to build your custom pass!
                  </p>
                </div>
                <button
                  onClick={() => router.push('/special-events')}
                  className="w-full bg-gradient-to-r from-secondary to-primary text-white font-audiowide py-3.5 rounded-lg hover:from-hover-primary hover:to-secondary transition-all duration-300"
                >
                  Browse Special Events
                </button>
              </div>
            )}
          </div>
        </div>


        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-background-soft border border-border rounded-xl p-6 text-center">
              <Calendar className="w-10 h-10 text-primary mx-auto mb-4" />
              <h4 className="font-audiowide text-lg mb-2">Drestein Dates</h4>
              <p className="text-muted-text font-space text-sm">
                November 3-8, 2025
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
          </>
        )}
      </div>

      <Footer />

      {/* PURCHASE MODAL - COMMENTED OUT FOR COMING SOON */}
      {showPassPurchase && showModal && selectedPass && (
        <PassPurchaseModal
          passData={selectedPass}
          onClose={() => {
            setShowModal(false);
            setSelectedPass(null);
          }}
          onPurchased={() => {
            setShowModal(false);
            setSelectedPass(null);
          }}
        />
      )}
     
    </div>
  );
}
