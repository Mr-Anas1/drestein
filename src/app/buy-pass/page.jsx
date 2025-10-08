'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Ticket, Check, Calendar, Users } from 'lucide-react';
import PassPurchaseModal from '@/components/PassPurchaseModal';

export default function BuyPassPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedPass, setSelectedPass] = useState(null);

  const passes = [
    {
      id: 'general',
      name: 'General Pass',
      price: 250,
      description: 'Access to all events on November 7-8, 2025',
      features: [
        'Access to all events',
        'Valid for Nov 7-8, 2025',
        'Technical & Non-technical events',
        'Cultural performances',
        'Networking opportunities',
      ],
      popular: true,
    },
    // Future pass types can be added here
    // {
    //   id: 'workshop',
    //   name: 'Workshop Pass',
    //   price: 150,
    //   description: 'Access to all workshops',
    //   features: [
    //     'All workshop access',
    //     'Hands-on learning',
    //     'Certificate of participation',
    //   ],
    //   popular: false,
    // },
  ];

  const handleBuyPass = (pass) => {
    setSelectedPass(pass);
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {passes.map((pass) => (
            <div
              key={pass.id}
              className={`relative bg-background-soft border ${
                pass.popular ? 'border-primary' : 'border-border'
              } rounded-2xl p-8 hover:border-primary transition-all duration-300 hover:shadow-xl hover:shadow-primary/20`}
            >
              {pass.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-1 rounded-full text-sm font-audiowide">
                    Most Popular
                  </span>
                </div>
              )}

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
      {showModal && (
        <PassPurchaseModal
          onClose={() => setShowModal(false)}
          onPurchased={() => {
            setShowModal(false);
            // Optionally redirect to my-passes page
          }}
        />
      )}
    </div>
  );
}
