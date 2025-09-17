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
    key: '',
    price: '',
    key_type: ''
  });
  const [bulkKeys, setBulkKeys] = useState('');
  const [bulkPrice, setBulkPrice] = useState('');
  const [selectedGameId, setSelectedGameId] = useState('');
  const [bulkKeyType, setBulkKeyType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    game_id: '',
    search: ''
  });


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
      const response = await apiGet(`admin/game-keys?${params}`);
      console.log('Game keys API response:', response); // Debug log
      setGameKeys(response.data || response || []);
      setTotalPages(response.total_pages || Math.ceil((response.count || 0) / 20));
    } catch (error) {
      console.error('Error fetching game keys:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGames = async () => {
    try {
      const response = await apiGet('admin/games?limit=1000');
      setGames(response.data || response || []);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any existing errors
    
    try {
      // Validate required fields
      if (!formData.game_id || !formData.key || !formData.price) {
        setError('Please fill in all required fields');
        return;
      }

      const gameId = parseInt(formData.game_id);
      const price = parseFloat(formData.price);

      // Validate parsed values
      if (isNaN(gameId)) {
        setError('Please select a valid game');
        return;
      }
      if (isNaN(price) || price <= 0) {
        setError('Please enter a valid price');
        return;
      }

      const keyData = {
        game_id: gameId,
        key: formData.key.trim(),
        price: price,
        key_type: formData.key_type.trim() || null
      };

      console.log('Submitting key data:', keyData); // Debug log

      if (editingKey) {
        await apiPut(`admin/game-keys/${editingKey.id}`, keyData);
      } else {
        await apiPost('admin/game-keys', keyData);
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
    setError(''); // Clear any existing errors
    
    try {
      if (!selectedGameId || !bulkKeys.trim() || !bulkPrice.trim()) {
        setError('Please select a game, enter keys, and set a price');
        return;
      }

      const gameId = parseInt(selectedGameId);
      const price = parseFloat(bulkPrice);

      // Validate parsed values
      if (isNaN(gameId)) {
        setError('Please select a valid game');
        return;
      }
      if (isNaN(price) || price <= 0) {
        setError('Please enter a valid price');
        return;
      }

      const keys = bulkKeys
        .split('\n')
        .map(key => key.trim())
        .filter(key => key.length > 0)
        .map(key => ({
          game_id: gameId,
          key: key,
          price: price,
          key_type: bulkKeyType.trim() || null
        }));

      if (keys.length === 0) {
        setError('No valid keys found');
        return;
      }

      console.log('Submitting bulk keys:', { keys }); // Debug log

      await apiPost('admin/game-keys/bulk', { keys });
      await fetchGameKeys();
      setBulkKeys('');
      setBulkPrice('');
      setSelectedGameId('');
      setBulkKeyType('');
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
      key: key.key,
      price: key.price ? key.price.toString() : '',
      key_type: key.key_type || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (keyId) => {
    if (window.confirm('Are you sure you want to delete this game key?')) {
      try {
        await apiDelete(`admin/game-keys/${keyId}`);
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
      key: '',
      price: '',
      key_type: ''
    });
    setEditingKey(null);
    setShowAddForm(false);
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
                  {games.map(game => (
                    <option key={game.id} value={game.id}>
                      {game.name || `Game ${game.id}`}
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Key *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="19.99"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Type
                </label>
                <select
                  value={bulkKeyType}
                  onChange={(e) => setBulkKeyType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Key Type</option>
                  <option value="steam">Steam</option>
                  <option value="epic">Epic Games</option>
                  <option value="origin">Origin</option>
                  <option value="uplay">Uplay</option>
                  <option value="battle.net">Battle.net</option>
                  <option value="gog">GOG</option>
                  <option value="microsoft">Microsoft Store</option>
                  <option value="playstation">PlayStation</option>
                  <option value="xbox">Xbox</option>
                  <option value="nintendo">Nintendo</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkAdd(false);
                    setBulkKeys('');
                    setBulkPrice('');
                    setSelectedGameId('');
                    setBulkKeyType('');
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
                  {games.map(game => (
                    <option key={game.id} value={game.id}>
                      {game.name || `Game ${game.id}`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Game Key *
                </label>
                <input
                  type="text"
                  required
                  value={formData.key}
                  onChange={(e) => setFormData({...formData, key: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  placeholder="XXXXX-XXXXX-XXXXX"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="19.99"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Type
                </label>
                <select
                  value={formData.key_type}
                  onChange={(e) => setFormData({...formData, key_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Key Type</option>
                  <option value="steam">Steam</option>
                  <option value="epic">Epic Games</option>
                  <option value="origin">Origin</option>
                  <option value="uplay">Uplay</option>
                  <option value="battle.net">Battle.net</option>
                  <option value="gog">GOG</option>
                  <option value="microsoft">Microsoft Store</option>
                  <option value="playstation">PlayStation</option>
                  <option value="xbox">Xbox</option>
                  <option value="nintendo">Nintendo</option>
                  <option value="other">Other</option>
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
                    {game.name || `Game ${game.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <button
                onClick={() => {
                  setFilters({game_id: '', search: ''});
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
                        Key
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Key Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
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
                            {key.game?.name || `Game ${key.game_id}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {key.game_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                            {key.key}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {key.key_type ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {key.key_type.charAt(0).toUpperCase() + key.key_type.slice(1)}
                              </span>
                            ) : (
                              <span className="text-gray-400">Not specified</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${key.price || '0.00'}
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
