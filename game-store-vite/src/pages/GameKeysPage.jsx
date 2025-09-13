import { useState, useEffect } from 'react';
import { apiGet } from '../utils/apiUtils';

const GameKeysPage = () => {
  const [gameKeys, setGameKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGameKeys = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Call the API endpoint
        const data = await apiGet('gamekeys');
        console.log('API Response:', data); // Debug log
        
        // Ensure we have an array
        if (Array.isArray(data)) {
          setGameKeys(data);
        } else if (data && typeof data === 'object') {
          // If it's an object, try to find an array property
          const arrayProp = Object.values(data).find(val => Array.isArray(val));
          if (arrayProp) {
            setGameKeys(arrayProp);
          } else {
            // If it's a single object, wrap it in an array
            setGameKeys([data]);
          }
        } else {
          // If it's neither array nor object, set empty array
          setGameKeys([]);
        }
        
      } catch (error) {
        console.error('Error fetching game keys:', error);
        setError(`Failed to fetch game keys: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchGameKeys();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading Game Keys...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Game Keys (Test Page)</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Temporary page to test api/gamekeys endpoint. Found {Array.isArray(gameKeys) ? gameKeys.length : 0} game keys.
      </p>
      
      {!Array.isArray(gameKeys) || gameKeys.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h3>No Game Keys Found</h3>
          <p>The API returned an empty array or no data.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {Array.isArray(gameKeys) && gameKeys.map((gameKey, index) => (
            <div 
              key={gameKey.id || index} 
              style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '15px',
                backgroundColor: '#f9f9f9'
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                <div>
                  <strong>ID:</strong> {gameKey.id || 'N/A'}
                </div>
                <div>
                  <strong>Key:</strong> 
                  <code style={{ backgroundColor: '#fff', padding: '4px 8px', marginLeft: '8px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                    {gameKey.key || 'N/A'}
                  </code>
                </div>
                <div>
                  <strong>Created At:</strong> 
                  <span style={{ marginLeft: '8px' }}>
                    {gameKey.created_at ? new Date(gameKey.created_at).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
              
              {/* Show all properties for debugging */}
              <details style={{ marginTop: '10px' }}>
                <summary style={{ cursor: 'pointer', color: '#666' }}>Show Raw Data</summary>
                <pre style={{ 
                  backgroundColor: '#fff', 
                  padding: '10px', 
                  marginTop: '5px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto'
                }}>
                  {JSON.stringify(gameKey, null, 2)}
                </pre>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GameKeysPage;
