import { useState, useEffect } from 'react';
import './FolderBrowser.css';

interface FolderBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
  initialPath?: string;
}

interface Directory {
  name: string;
  path: string;
}

function FolderBrowser({ isOpen, onClose, onSelect, initialPath = '/Users/leefu' }: FolderBrowserProps) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [directories, setDirectories] = useState<Directory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDirectories(currentPath);
    }
  }, [isOpen, currentPath]);

  const loadDirectories = async (path: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/list-directory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ directoryPath: path }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load directories');
      }

      const data = await response.json();
      setDirectories(data.directories);
      setCurrentPath(data.currentPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setDirectories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectoryClick = (dirPath: string) => {
    setCurrentPath(dirPath);
  };

  const handleGoUp = () => {
    const parts = currentPath.split('/').filter(p => p);
    if (parts.length > 0) {
      parts.pop();
      const parentPath = '/' + parts.join('/');
      setCurrentPath(parentPath || '/');
    }
  };

  const handleSelect = () => {
    onSelect(currentPath);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="folder-browser-overlay" onClick={onClose}>
      <div className="folder-browser-modal" onClick={(e) => e.stopPropagation()}>
        <div className="folder-browser-header">
          <h3>Browse Folders</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="folder-browser-body">
          <div className="current-path">
            <span className="path-label">Current:</span>
            <span className="path-value">{currentPath}</span>
          </div>

          <div className="navigation-buttons">
            <button
              className="nav-button"
              onClick={handleGoUp}
              disabled={currentPath === '/' || loading}
            >
              ⬆️ Up One Level
            </button>
          </div>

          {error && (
            <div className="browser-error">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {loading ? (
            <div className="browser-loading">
              <div className="browser-spinner"></div>
              <p>Loading directories...</p>
            </div>
          ) : (
            <div className="directories-list">
              {directories.length === 0 ? (
                <div className="no-directories">No subdirectories found in this folder</div>
              ) : (
                directories.map((dir) => (
                  <button
                    key={dir.path}
                    className="directory-item"
                    onClick={() => handleDirectoryClick(dir.path)}
                  >
                    <span className="folder-icon">📁</span>
                    <span className="folder-name">{dir.name}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="folder-browser-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="select-button" onClick={handleSelect}>
            ✓ Select "{currentPath.split('/').pop() || 'Root'}"
          </button>
        </div>
      </div>
    </div>
  );
}

export default FolderBrowser;
