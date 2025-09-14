// Staff Game Keys Management Console Page

import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/apiUtils';

const StaffGameKeysPage = () => {
  const [gameKeys, setGameKeys] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingKey, setEditingKey] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [formData, setFormData] = useState({
    game_id: '',
    key_code: '',
    platform: 'Steam',
    region: 'Global',
    status: 'available'
  });
  const [bulkKeys, setBulkKeys] = useState('');
  const [selectedGameId, setSelectedGameId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    game_id: '',
    status: '',
    platform: '',
    search: ''
  });

  const keyStatuses = ['available', 'sold', 'reserved', 'invalid'];
  const platforms = ['Steam', 'Epic Games', 'Origin', 'Uplay', 'GOG', 'Battle.net', 'Microsoft Store', 'PlayStation', 'Xbox'];
  const regions = ['Global', 'US', 'EU', 'UK', 'RU', 'Asia', 'Latin America'];

  useEffect(() => {
    fetchGameKeys();
    fetchGames();
  }, [currentPage, filters]);

  const fetchGameKeys = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {})
      });
      const response = await apiGet(`game-keys?${params}`);
      setGameKeys(response.data || response || []);
      setTotalPages(response.total_pages || 1);
    } catch (error) {
      console.error('Error fetching game keys:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGames = async () => {
    try {
      const response = await apiGet('games?limit=1000');
      setGames(response.data || response || []);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const keyData = {
        ...formData,
        game_id: parseInt(formData.game_id)
      };

      if (editingKey) {
        await apiPut(`game-keys/${editingKey.id}`, keyData);
      } else {
        await apiPost('game-keys', keyData);
      }
      
      await fetchGameKeys();
      resetForm();
    } catch (error) {
      console.error('Error saving game key:', error);
      setError(error.message);
    }
  };

  const handleBulkAdd = async (e) => {
    e.preventDefault();
    try {
      if (!selectedGameId || !bulkKeys.trim()) {
        setError('Please select a game and enter keys');
        return;
      }

      const keys = bulkKeys
        .split('\n')
        .map(key => key.trim())
        .filter(key => key.length > 0)
        .map(key => ({
          game_id: parseInt(selectedGameId),
          key_code: key,
          platform: 'Steam',
          region: 'Global',
          status: 'available'
        }));

      if (keys.length === 0) {
        setError('No valid keys found');
        return;
      }

      await apiPost('game-keys/bulk', { keys });
      await fetchGameKeys();
      setBulkKeys('');
      setSelectedGameId('');
      setShowBulkAdd(false);
    } catch (error) {
      console.error('Error adding bulk keys:', error);
      setError(error.message);
    }
  };

  const handleEdit = (key) => {
    setEditingKey(key);
    setFormData({
      game_id: key.game_id.toString(),
      key_code: key.key_code,
      platform: key.platform || 'Steam',
      region: key.region || 'Global',
      status: key.status
    });
    setShowAddForm(true);
  };

  const handleDelete = async (keyId) => {
    if (window.confirm('Are you sure you want to delete this game key?')) {
      try {
        await apiDelete(`game-keys/${keyId}`);
        await fetchGameKeys();
      } catch (error) {
        console.error('Error deleting game key:', error);
        setError(error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      game_id: '',
      key_code: '',
      platform: 'Steam',
      region: 'Global',
      status: 'available'
    });
    setEditingKey(null);
    setShowAddForm(false);
  };

  const updateStatus = async (keyId, newStatus) => {
    try {
      await apiPut(`game-keys/${keyId}`, { status: newStatus });
      await fetchGameKeys();
    } catch (error) {
      console.error('Error updating key status:', error);
      setError(error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'invalid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Game Keys Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage game keys inventory and distribution
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBulkAdd(!showBulkAdd)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {showBulkAdd ? 'Cancel Bulk' : 'Bulk Add'}
              </button>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {showAddForm ? 'Cancel' : 'Add Key'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button
              onClick={() => setError('')}
              className="float-right text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}

        {/* Bulk Add Form */}
        {showBulkAdd && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Bulk Add Game Keys</h2>
            <form onSubmit={handleBulkAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Game *
                </label>
                <select
                  required
                  value={selectedGameId}
                  onChange={(e) => setSelectedGameId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Choose a game</option>
                  {games.filter(game => game.is_active).map(game => (
                    <option key={game.id} value={game.id}>
                      {game.title} - ${game.price}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Game Keys (one per line) *
                </label>
                <textarea
                  required
                  value={bulkKeys}
                  onChange={(e) => setBulkKeys(e.target.value)}
                  rows="10"
                  placeholder="XXXXX-XXXXX-XXXXX&#10;YYYYY-YYYYY-YYYYY&#10;ZZZZZ-ZZZZZ-ZZZZZ"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {bulkKeys.split('\n').filter(k => k.trim()).length} keys entered
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkAdd(false);
                    setBulkKeys('');
                    setSelectedGameId('');
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Keys
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Single Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingKey ? 'Edit Game Key' : 'Add Single Game Key'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Game *
                </label>
                <select
                  required
                  value={formData.game_id}
                  onChange={(e) => setFormData({...formData, game_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Game</option>
                  {games.filter(game => game.is_active).map(game => (
                    <option key={game.id} value={game.id}>
                      {game.title} - ${game.price}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.key_code}
                  onChange={(e) => setFormData({...formData, key_code: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  placeholder="XXXXX-XXXXX-XXXXX"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({...formData, platform: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {platforms.map(platform => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({...formData, region: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {regions.map(region => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {keyStatuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingKey ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search keys..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={filters.game_id}
                onChange={(e) => setFilters({...filters, game_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Games</option>
                {games.map(game => (
                  <option key={game.id} value={game.id}>
                    {game.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {keyStatuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filters.platform}
                onChange={(e) => setFilters({...filters, platform: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Platforms</option>
                {platforms.map(platform => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <button
                onClick={() => {
                  setFilters({game_id: '', status: '', platform: '', search: ''});
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Game Keys List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Game Keys ({gameKeys.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading game keys...</p>
            </div>
          ) : gameKeys.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No game keys found.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Game
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Key Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Platform
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Region
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Added
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {gameKeys.map((key) => (
                      <tr key={key.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {key.game_title}
                          </div>
                          <div className="text-sm text-gray-500">
                            ${key.game_price}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                            {key.key_code}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {key.platform}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {key.region}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={key.status}
                            onChange={(e) => updateStatus(key.id, e.target.value)}
                            className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStatusColor(key.status)}`}
                          >
                            {keyStatuses.map(status => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {key.created_at ? new Date(key.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(key)}
                              className="text-blue-600 hover:text-blue-900 px-2 py-1"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(key.id)}
                              className="text-red-600 hover:text-red-900 px-2 py-1"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffGameKeysPage;
