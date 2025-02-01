import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import PricingCard from '../components/PricingCard';
import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";

const Payment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [userRole, setUserRole] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('roles(name)')
          .eq('user_id', user.id)
          .single();

        if (roleData?.roles) {
          setUserRole(roleData.roles.name);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    fetchUserRole();
  }, [user, navigate]);

  const handleUpgrade = (plan: string) => {
    // Implement payment processing logic here
    console.log(`Upgrading to ${plan}`);
  };

  const plans = [
    {
      name: 'Free',
      price: 0,
      description: 'Perfect for getting started',
      features: [
        'Basic profile',
        'Limited storage (100MB)',
        'Standard support',
        'Basic analytics',
        'Community access'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Artist Pro',
      price: 25,
      description: 'For professional artists',
      features: [
        'Advanced profile',
        'Increased storage (10GB)',
        'Priority support',
        'Advanced analytics',
        'Custom portfolio',
        'Booking management',
        'Client messaging',
        'Featured listings'
      ],
      cta: 'Upgrade to Pro',
      popular: true
    },
    {
      name: 'Business Pro',
      price: 100,
      description: 'For tattoo studios',
      features: [
        'Enterprise profile',
        'Unlimited storage',
        '24/7 dedicated support',
        'Enterprise analytics',
        'Multiple artists',
        'Advanced booking',
        'Team management',
        'API access',
        'Custom branding',
        'Marketing tools'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Pricing Plans</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your needs. Upgrade anytime to unlock more features.
          </p>
        </div>

        {(userRole === 'artist' || userRole === 'business_owner' || userRole === 'admin') && (
          <div className="flex justify-center mb-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              onClick={() => handleUpgrade('pro')}
            >
              <Crown className="w-5 h-5 mr-2" />
              Upgrade to Pro
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <PricingCard
              key={plan.name}
              {...plan}
              onSelect={() => handleUpgrade(plan.name.toLowerCase())}
            />
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">All Plans Include</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span>SSL Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span>Regular Updates</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payment;