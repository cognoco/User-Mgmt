import React from 'react';
import { getStorage, isServer, isClient } from '@/core/platform';

export default function SSRTestPage() {
  const [storageType, setStorageType] = React.useState<'local' | 'session'>('local');
  const [key, setKey] = React.useState('');
  const [value, setValue] = React.useState('');
  const [storedValue, setStoredValue] = React.useState<string | null>(null);
  const [environment, setEnvironment] = React.useState({
    isServer: false,
    isClient: false,
  });

  // Set environment info on mount
  React.useEffect(() => {
    setEnvironment({
      isServer: isServer,
      isClient: isClient,
    });
  }, []);

  const handleStore = () => {
    const storage = getStorage(storageType);
    storage.setItem(key, value);
    setStoredValue(storage.getItem(key));
  };

  const handleRetrieve = () => {
    const storage = getStorage(storageType);
    setStoredValue(storage.getItem(key));
  };

  return (
    <div data-testid="ssr-test-page">
      <h1>SSR Test Page</h1>
      
      <div>
        <h2>Environment</h2>
        <p data-testid="environment-info">
          isServer: {environment.isServer.toString()}, isClient: {environment.isClient.toString()}
        </p>
      </div>

      <div>
        <h2>Storage Test</h2>
        <div>
          <select 
            value={storageType} 
            onChange={(e) => setStorageType(e.target.value as 'local' | 'session')}
            data-testid="storage-type-select"
          >
            <option value="local">localStorage</option>
            <option value="session">sessionStorage</option>
          </select>
        </div>
        <div>
          <input
            type="text"
            placeholder="Key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            data-testid="key-input"
          />
          <input
            type="text"
            placeholder="Value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            data-testid="value-input"
          />
          <button onClick={handleStore} data-testid="store-button">
            Store
          </button>
          <button onClick={handleRetrieve} data-testid="retrieve-button">
            Retrieve
          </button>
        </div>
        <div>
          <p>Stored Value: <span data-testid="stored-value">{storedValue || 'None'}</span></p>
        </div>
      </div>
    </div>
  );
}
