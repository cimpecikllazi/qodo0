import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Onboarding = () => {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1); // 1: pricing, 2: locations
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/auth/current`);
        setUser(response.data);
        setLoading(false);
        
        // If user already has an active subscription, go to reviews
        if (response.data.subscriptionStatus === 'active') {
          navigate('/reviews');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        navigate('/');
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ReplyRobot</h1>
          <div className="flex items-center">
            <span className="mr-4 text-gray-700 dark:text-gray-300">Welcome, {user?.displayName}</span>
            <button
              onClick={async () => {
                try {
                  await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/auth/logout`);
                  navigate('/');
                } catch (error) {
                  console.error('Logout error:', error);
                }
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4">
              {step === 1 ? (
                <PricingStep user={user} onNext={() => setStep(2)} />
              ) : (
                <LocationsStep user={user} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const PricingStep = ({ user, onNext }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processing, setProcessing] = useState(false);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$29',
      period: '/month',
      replies: '50 replies',
      features: ['Automated responses', 'Basic analytics', 'Email support']
    },
    {
      id: 'growth',
      name: 'Growth',
      price: '$59',
      period: '/month',
      replies: '150 replies',
      features: ['Everything in Starter', 'Advanced analytics', 'Priority support', 'Custom branding']
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$99',
      period: '/month',
      replies: '400 replies',
      features: ['Everything in Growth', 'Dedicated account manager', 'API access', 'White-label solution']
    }
  ];

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
  };

  const handleCheckout = async () => {
    if (!selectedPlan) return;
    
    setProcessing(true);
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/billing/checkout`, {
        plan: selectedPlan,
        userId: user.id
      });
      
      // Redirect to Stripe checkout
      window.location.href = `https://checkout.stripe.com/pay/${response.data.sessionId}`;
    } catch (error) {
      console.error('Checkout error:', error);
      setProcessing(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Choose your plan
        </h2>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
          Start automating your Google Business Profile review responses today
        </p>
      </div>

      <div className="mt-16 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative p-8 bg-white dark:bg-gray-800 border ${
              selectedPlan === plan.id
                ? 'border-blue-500 ring-2 ring-blue-500'
                : 'border-gray-200 dark:border-gray-700'
            } rounded-2xl shadow-sm flex flex-col`}
          >
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
              <p className="mt-4 flex items-baseline text-gray-900 dark:text-white">
                <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                <span className="ml-1 text-xl font-semibold">{plan.period}</span>
              </p>
              <p className="mt-2 text-gray-500 dark:text-gray-400">{plan.replies}</p>
              <ul role="list" className="mt-6 space-y-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex">
                    <svg className="flex-shrink-0 w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-gray-500 dark:text-gray-400">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => handleSelectPlan(plan.id)}
              className={`mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium ${
                selectedPlan === plan.id
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <button
          onClick={handleCheckout}
          disabled={!selectedPlan || processing}
          className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
            !selectedPlan || processing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {processing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Continue to Payment'
          )}
        </button>
      </div>
    </div>
  );
};

const LocationsStep = ({ user }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleConnectGoogle = () => {
    // In a real app, this would connect to Google My Business API
    // For now, we'll simulate adding locations
    const mockLocations = [
      {
        id: 1,
        name: 'Main Street Coffee Shop',
        address: '123 Main St, New York, NY 10001'
      },
      {
        id: 2,
        name: 'Downtown Cafe',
        address: '456 Downtown Ave, New York, NY 10002'
      }
    ];
    
    setLocations(mockLocations);
  };

  const handleSaveLocations = async () => {
    setLoading(true);
    
    try {
      // In a real app, this would save the selected locations to the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/reviews');
    } catch (error) {
      console.error('Error saving locations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Connect your Google Business Profile
        </h2>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
          Select the locations you want to automate review responses for
        </p>
      </div>

      <div className="mt-10">
        {locations.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No locations connected</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Get started by connecting your Google Business Profile
            </p>
            <div className="mt-6">
              <button
                onClick={handleConnectGoogle}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-white" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#FFF"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#FFF"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FFF"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#FFF"
                  />
                </svg>
                Connect Google Business Profile
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {locations.map((location) => (
                <li key={location.id}>
                  <div className="px-4 py-4 flex items-center sm:px-6">
                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                      <div className="truncate">
                        <div className="flex text-sm">
                          <p className="font-medium text-blue-600 dark:text-blue-400 truncate">{location.name}</p>
                        </div>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate">{location.address}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-5 flex-shrink-0">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        defaultChecked
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {locations.length > 0 && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={handleSaveLocations}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Start Automating Reviews'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;