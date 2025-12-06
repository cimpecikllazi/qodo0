import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/auth/current`);
        setUser(response.data);
        setLoading(false);
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
            <span className="mr-4 text-gray-700 dark:text-gray-300">Settings</span>
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
              <div className="max-w-3xl mx-auto">
                <div>
                  <div className="md:grid md:grid-cols-3 md:gap-6">
                    <div className="md:col-span-1">
                      <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Profile</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Your account information and subscription details.
                      </p>
                    </div>
                    <div className="mt-5 md:mt-0 md:col-span-2">
                      <div className="shadow sm:rounded-md sm:overflow-hidden">
                        <div className="px-4 py-5 bg-white dark:bg-gray-800 sm:p-6">
                          <div className="grid grid-cols-6 gap-6">
                            <div className="col-span-6 sm:col-span-3">
                              <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Name
                              </label>
                              <input
                                type="text"
                                name="first-name"
                                id="first-name"
                                value={user?.displayName || ''}
                                disabled
                                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>

                            <div className="col-span-6 sm:col-span-4">
                              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email address
                              </label>
                              <input
                                type="text"
                                name="email-address"
                                id="email-address"
                                value={user?.email || ''}
                                disabled
                                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>

                            <div className="col-span-6 sm:col-span-3">
                              <label htmlFor="subscription-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Subscription Status
                              </label>
                              <input
                                type="text"
                                name="subscription-status"
                                id="subscription-status"
                                value={user?.subscriptionStatus?.toUpperCase() || ''}
                                disabled
                                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>

                            <div className="col-span-6 sm:col-span-3">
                              <label htmlFor="current-plan" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Current Plan
                              </label>
                              <input
                                type="text"
                                name="current-plan"
                                id="current-plan"
                                value={user?.currentPlan?.charAt(0).toUpperCase() + user?.currentPlan?.slice(1) || ''}
                                disabled
                                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:block" aria-hidden="true">
                  <div className="py-5">
                    <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                </div>

                <div className="mt-10 sm:mt-0">
                  <div className="md:grid md:grid-cols-3 md:gap-6">
                    <div className="md:col-span-1">
                      <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Connected Accounts</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Manage your connected Google accounts.
                      </p>
                    </div>
                    <div className="mt-5 md:mt-0 md:col-span-2">
                      <div className="shadow sm:rounded-md sm:overflow-hidden">
                        <div className="px-4 py-5 bg-white dark:bg-gray-800 sm:p-6">
                          <div className="grid grid-cols-6 gap-6">
                            <div className="col-span-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Google Account</h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Connected as {user?.email}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                  Disconnect
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:block" aria-hidden="true">
                  <div className="py-5">
                    <div className="border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                </div>

                <div className="mt-10 sm:mt-0">
                  <div className="md:grid md:grid-cols-3 md:gap-6">
                    <div className="md:col-span-1">
                      <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Danger Zone</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Permanently delete your account and all of its data.
                      </p>
                    </div>
                    <div className="mt-5 md:mt-0 md:col-span-2">
                      <div className="shadow sm:rounded-md sm:overflow-hidden">
                        <div className="px-4 py-5 bg-white dark:bg-gray-800 sm:p-6">
                          <div className="grid grid-cols-6 gap-6">
                            <div className="col-span-6">
                              <div className="flex items-start">
                                <div className="flex items-center h-5">
                                  <input
                                    id="delete-account"
                                    name="delete-account"
                                    type="checkbox"
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                  />
                                </div>
                                <div className="ml-3 text-sm">
                                  <label htmlFor="delete-account" className="font-medium text-gray-700 dark:text-gray-300">
                                    Confirm account deletion
                                  </label>
                                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                                    I understand that deleting my account will permanently remove all my data and cannot be undone.
                                  </p>
                                </div>
                              </div>
                              <div className="mt-4">
                                <button
                                  type="button"
                                  disabled
                                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 opacity-50 cursor-not-allowed"
                                >
                                  Delete Account
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;