import React from 'react';

const PricingCards = ({ onSelectPlan }) => {
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

  return (
    <div className="mt-16 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className="relative p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm flex flex-col"
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
            onClick={() => onSelectPlan(plan.id)}
            className="mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Select Plan
          </button>
        </div>
      ))}
    </div>
  );
};

export default PricingCards;