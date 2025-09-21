import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchUserOrders,
  fetchOrderById,
  updateUserProfile,
  changeUserPassword,
  deleteUserAccount
} from '../utils/apiUtils';
import { formatPrice } from '../utils/moneyUtils';
import { setAuthCookies, getAuthCookies } from '../utils/cookieUtils';
import { runAuthDiagnostics } from '../utils/debugAuth';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // Tab management
  const [activeTab, setActiveTab] = useState('account');
  
  // Orders state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);

  // Profile editing state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    email: '',
    name: '',
    username: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(null);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  // Account deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Initialize profile data when user changes or component mounts
  useEffect(() => {
    if (user) {
      setProfileData({
        email: user.email || '',
        name: user.name || '',
        username: user.username || ''
      });
    }
  }, [user]);

  // Load user orders
  useEffect(() => {
    const loadUserOrders = async () => {
      if (activeTab === 'orders') {
        try {
          setLoading(true);
          const response = await fetchUserOrders();
          // Handle both array and object response formats
          const ordersData = Array.isArray(response) ? response : (response.data || []);
          setOrders(ordersData);
          setError(null);
        } catch (err) {
          console.error('Failed to fetch user orders:', err);
          setError('Failed to load your orders. Please try again later.');
          setOrders([]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserOrders();
  }, [activeTab]);

  // Profile management handlers
  const handleProfileEdit = () => {
    setEditingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);
  };

  const handleProfileCancel = () => {
    setEditingProfile(false);
    setProfileData({
      email: user?.email || '',
      name: user?.name || '',
      username: user?.username || ''
    });
    setProfileError(null);
    setProfileSuccess(null);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      // Only send changed fields
      const updateData = {};
      if (profileData.email !== user?.email && profileData.email) {
        updateData.email = profileData.email;
      }
      if (profileData.name !== user?.name && profileData.name) {
        updateData.name = profileData.name;
      }
      if (profileData.username !== user?.username && profileData.username) {
        updateData.username = profileData.username;
      }

      if (Object.keys(updateData).length === 0) {
        setProfileError('No changes to save.');
        setProfileLoading(false);
        return;
      }

      const result = await updateUserProfile(updateData);

      // Handle different response formats - some APIs return data directly, others wrap it
      const updatedUserData = result.data || result;

      if (updatedUserData) {
        // Update the user context with new data
        updateUser(updatedUserData);

        // Also update the cookies to persist the changes
        const currentAuthData = getAuthCookies();
        if (currentAuthData) {
          const updatedAuthData = {
            ...currentAuthData,
            user: updatedUserData
          };
          setAuthCookies(updatedAuthData);
          console.log('[Profile] Updated user data in cookies:', updatedUserData);
        }
      }

      setProfileSuccess('Profile updated successfully!');
      setEditingProfile(false);

      // Clear success message after 3 seconds
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (err) {
      console.error('Profile update error:', err);
      setProfileError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    // Validate passwords
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      setPasswordError('All password fields are required.');
      setPasswordLoading(false);
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New passwords do not match.');
      setPasswordLoading(false);
      return;
    }

    if (passwordData.new_password.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      setPasswordLoading(false);
      return;
    }

    try {
      await changeUserPassword(passwordData);
      
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => setPasswordSuccess(null), 3000);
    } catch (err) {
      console.error('Password change error:', err);
      setPasswordError(err.message || 'Failed to change password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await deleteUserAccount();
      
      // Log out the user and redirect to home page
      await logout();
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Account deletion error:', err);
      setDeleteError(err.message || 'Failed to delete account. Please try again.');
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800'; // Default to completed for orders without status
    }
  };

  const getOrderDate = (order) => {
    // Since orders table doesn't have created_at, use the earliest sub_order created_at
    if (order.sub_orders && order.sub_orders.length > 0) {
      const dates = order.sub_orders
        .map(sub => sub.created_at)
        .filter(date => date)
        .sort();
      return dates[0] || null;
    }
    return order.created_at || null;
  };

  const getDefaultStatus = (order) => {
    // Since orders table doesn't have status field, return default based on presence of sub_orders
    return order.status || (order.sub_orders && order.sub_orders.length > 0 ? 'Completed' : 'Pending');
  };

  const handleViewOrderDetails = async (order) => {
    try {
      setOrderDetailsLoading(true);
      // Fetch detailed order information using the provided endpoint
      const detailedOrder = await fetchOrderById(order.id);
      // Handle both nested data structure and direct data
      const orderData = detailedOrder.data || detailedOrder;
      setSelectedOrder(orderData);
    } catch (err) {
      console.error('Failed to fetch order details:', err);
      // Fallback to showing the order data we already have
      setSelectedOrder(order);
    } finally {
      setOrderDetailsLoading(false);
    }
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">
              Order #{order.id}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Order Info */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Order Information</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Date:</span> {formatDate(getOrderDate(order))}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ml-2 ${getStatusColor(getDefaultStatus(order))}`}>
                      {getDefaultStatus(order)}
                    </span>
                  </p>
                  <p><span className="font-medium">Total:</span> {formatPrice(order.total_price)}</p>
                  {order.comment && (
                    <p><span className="font-medium">Comment:</span> {order.comment}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Items */}
            {order.sub_orders && order.sub_orders.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">Items ({order.sub_orders.length})</h3>
                <div className="space-y-4">
                  {order.sub_orders.map((subOrder) => {
                    const game = subOrder.game || {};
                    const gameKey = subOrder.game_key || {};
                    
                    return (
                      <div key={subOrder.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          {/* Game Image */}
                          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center relative overflow-hidden">
                            {game.cover ? (
                              <>
                                <img 
                                  src={`https://s3.tebi.io/game-key-store/games/${game.cover}`}
                                  alt={game.name || 'Game'}
                                  className="w-full h-full object-cover rounded-lg"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentNode.querySelector('.fallback-text').style.display = 'flex';
                                  }}
                                />
                                <div className="fallback-text absolute inset-0 text-white font-semibold text-xs text-center leading-tight items-center justify-center px-1 hidden">
                                  {game.name?.substring(0, 8) || 'Game'}
                                </div>
                              </>
                            ) : (
                              <div className="text-white font-semibold text-xs text-center leading-tight px-1">
                                {game.name?.substring(0, 8) || 'Game'}
                              </div>
                            )}
                          </div>

                          {/* Game Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 mb-2">
                              {game.name || 'Unknown Game'}
                            </h4>
                            {game.description && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {game.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                              {gameKey.key_type && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                  {gameKey.key_type}
                                </span>
                              )}
                              <span className="font-medium text-green-600">
                                {formatPrice(gameKey.price || subOrder.price || 0)}
                              </span>
                            </div>
                          </div>

                          {/* Game Key */}
                          <div className="text-right flex-shrink-0">
                            {gameKey.key && (
                              <div className="bg-white border rounded-lg p-3 max-w-xs">
                                <div className="text-xs text-gray-500 mb-1">Your Key:</div>
                                <div className="font-mono text-sm bg-gray-100 p-2 rounded border select-all break-all">
                                  {gameKey.key}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
                {user && (
                  <p className="text-gray-600 mt-2">
                    Welcome back, {user.name || user.username || user.email?.split('@')[0] || 'User'}!
                  </p>
                )}
                {!user && (
                  <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">⚠️ User data is not loading properly.</p>
                    <button
                      onClick={runAuthDiagnostics}
                      className="mt-2 text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                    >
                      Debug Authentication
                    </button>
                  </div>
                )}
              </div>
            <div className="flex items-center gap-2">
              <button
                onClick={runAuthDiagnostics}
                className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                title="Debug authentication state"
              >
                Debug Auth
              </button>
              <Link 
                to="/games" 
                className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('account')}
                className={`px-6 py-4 font-medium text-sm transition-colors ${
                  activeTab === 'account'
                    ? 'text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Account Information
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-6 py-4 font-medium text-sm transition-colors ${
                  activeTab === 'security'
                    ? 'text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Security
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-4 font-medium text-sm transition-colors ${
                  activeTab === 'orders'
                    ? 'text-indigo-600 bg-indigo-50 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Order History
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Account Information Tab */}
            {activeTab === 'account' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Account Information</h2>
                  {!editingProfile && (
                    <button
                      onClick={handleProfileEdit}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                {/* Success Message */}
                {profileSuccess && (
                  <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="text-green-600 mr-2">✓</div>
                      <div className="text-green-800">{profileSuccess}</div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {profileError && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="text-red-600 mr-2">⚠</div>
                      <div className="text-red-800">{profileError}</div>
                    </div>
                  </div>
                )}

                {editingProfile ? (
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          value={profileData.username}
                          onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Enter your username"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Enter your email address"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={profileLoading}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {profileLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={handleProfileCancel}
                        disabled={profileLoading}
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    {/* User Data Display */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                        <p className="text-gray-800 text-lg">{user?.name || 'Not provided'}</p>
                        {!user?.name && user && (
                          <p className="text-xs text-red-600">⚠️ Name field is missing</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                        <p className="text-gray-800 text-lg">{user?.username || 'Not provided'}</p>
                        {!user?.username && user && (
                          <p className="text-xs text-yellow-600">⚠️ Username field is missing</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Email Address</label>
                        <p className="text-gray-800 text-lg">{user?.email || 'Not provided'}</p>
                        {!user?.email && user && (
                          <p className="text-xs text-red-600">⚠️ Email field is missing</p>
                        )}
                      </div>
                      {user?.role && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                          <p className="text-gray-800 text-lg capitalize">{user.role}</p>
                        </div>
                      )}
                      {user?.id && (
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">User ID</label>
                          <p className="text-gray-800 text-sm font-mono">{user.id}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Debug Information */}
                    {user && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                        <details className="text-xs">
                          <summary className="font-medium text-gray-700 cursor-pointer mb-2">
                            🔍 Debug: Raw User Data
                          </summary>
                          <pre className="text-gray-600 whitespace-pre-wrap overflow-x-auto">
                            {JSON.stringify(user, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                    
                    {!user && (
                      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                        <h3 className="font-medium text-red-800 mb-2">❌ No User Data Found</h3>
                        <p className="text-sm text-red-700 mb-4">
                          The user object is null or undefined. This suggests an issue with authentication data retrieval.
                        </p>
                        <button
                          onClick={runAuthDiagnostics}
                          className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
                        >
                          Run Full Diagnostics
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                {/* Change Password Section */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Change Password</h2>

                  {/* Success Message */}
                  {passwordSuccess && (
                    <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="text-green-600 mr-2">✓</div>
                        <div className="text-green-800">{passwordSuccess}</div>
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {passwordError && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="text-red-600 mr-2">⚠</div>
                        <div className="text-red-800">{passwordError}</div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter your current password"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Enter new password"
                          minLength={6}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Confirm new password"
                          minLength={6}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {passwordLoading ? 'Changing Password...' : 'Change Password'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Delete Account Section */}
                <div className="border-t border-gray-200 pt-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Delete Account</h2>
                  <p className="text-gray-600 mb-6">
                    Once you delete your account, there is no going back. This action will permanently delete your account and all associated data.
                  </p>

                  {/* Error Message */}
                  {deleteError && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="text-red-600 mr-2">⚠</div>
                        <div className="text-red-800">{deleteError}</div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Delete My Account
                  </button>

                  {/* Delete Confirmation Modal */}
                  {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                      <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Are you absolutely sure?
                        </h3>
                        <p className="text-gray-600 mb-6">
                          This action cannot be undone. This will permanently delete your account and remove all of your data from our servers.
                        </p>
                        <div className="flex gap-4">
                          <button
                            onClick={handleDeleteAccount}
                            disabled={deleteLoading}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deleteLoading ? 'Deleting...' : 'Yes, Delete My Account'}
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={deleteLoading}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Order History</h2>

                {/* Loading State */}
                {loading && (
                  <div className="p-8 text-center">
                    <div className="text-gray-600 text-lg">Loading orders...</div>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-red-800">{error}</div>
                  </div>
                )}

                {/* Empty Orders */}
                {!loading && !error && orders.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="text-6xl mb-6">📦</div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">No orders yet</h3>
                    <p className="text-gray-600 mb-8">Start shopping to see your orders here!</p>
                    <Link 
                      to="/games" 
                      className="inline-block bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30"
                    >
                      Browse Games
                    </Link>
                  </div>
                )}

                {/* Orders List */}
                {!loading && !error && orders.length > 0 && (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div>
                              <h3 className="font-semibold text-gray-800">Order #{order.id}</h3>
                              <p className="text-sm text-gray-600">
                                {formatDate(getOrderDate(order))}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(getDefaultStatus(order))}`}>
                              {getDefaultStatus(order)}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-lg text-gray-800">
                              {formatPrice(order.total_price)}
                            </div>
                            {order.sub_orders && (
                              <div className="text-sm text-gray-600">
                                {order.sub_orders.length} item{order.sub_orders.length > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Order Items Preview */}
                        {order.sub_orders && order.sub_orders.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-gray-600">Items:</span>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {order.sub_orders.slice(0, 3).map((subOrder) => {
                                const game = subOrder.game || {};
                                return (
                                  <div key={subOrder.id} className="flex-shrink-0 bg-gray-100 rounded p-2 text-sm">
                                    <div className="font-medium text-gray-800 truncate max-w-32">
                                      {game.name || 'Unknown Game'}
                                    </div>
                                    {subOrder.game_key?.key_type && (
                                      <div className="text-xs text-gray-600">
                                        {subOrder.game_key.key_type}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                              {order.sub_orders.length > 3 && (
                                <div className="flex-shrink-0 bg-gray-100 rounded p-2 text-sm text-gray-600 flex items-center">
                                  +{order.sub_orders.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-between items-center">
                          <div>
                            {order.comment && (
                              <p className="text-sm text-gray-600 italic">"{order.comment}"</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleViewOrderDetails(order)}
                            disabled={orderDetailsLoading}
                            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {orderDetailsLoading ? 'Loading...' : 'View Details'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <OrderDetailsModal 
            order={selectedOrder} 
            onClose={closeOrderDetails}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
