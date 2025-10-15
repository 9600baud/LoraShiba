import { useState } from 'react';
import FolderBrowser from './FolderBrowser';
import './DirectorySelector.css';

interface DirectorySelectorProps {
  onLoad: (directoryPath: string, includeSubfolders: boolean) => void;
  loading: boolean;
  hasImages: boolean;
}

function DirectorySelector({ onLoad, loading, hasImages }: DirectorySelectorProps) {
  const [directoryPath, setDirectoryPath] = useState<string>('');
  const [includeSubfolders, setIncludeSubfolders] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);

  const handleLoad = () => {
    if (directoryPath.trim()) {
      onLoad(directoryPath.trim(), includeSubfolders);
    }
  };

  const handleBrowseClick = () => {
    setIsBrowserOpen(true);
  };

  const handleFolderSelect = (path: string) => {
    setDirectoryPath(path);
  };

  return (
    <>
      <div className={`directory-selector ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="selector-card">
          <div
            className="selector-header"
            onClick={isCollapsed && hasImages ? () => setIsCollapsed(false) : undefined}
          >
            <div className="header-left">
              <span className="selector-icon">📂</span>
              <h2>Select Directory</h2>
            </div>
            {hasImages && (
              <button
                className="collapse-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCollapsed(!isCollapsed);
                }}
                title={isCollapsed ? 'Expand' : 'Collapse'}
              >
                {isCollapsed ? '▼' : '▲'}
              </button>
            )}
          </div>

          {!isCollapsed && (
            <div className="selector-body">
              <div className="form-group">
                <label htmlFor="directory-path">Directory Path</label>
                <div className="input-with-browse">
                  <input
                    id="directory-path"
                    type="text"
                    className="directory-input"
                    placeholder="~/Pictures/my-training-images"
                    value={directoryPath}
                    onChange={(e) => setDirectoryPath(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    className="browse-button"
                    onClick={handleBrowseClick}
                    disabled={loading}
                    title="Browse folders"
                  >
                    📁 Browse
                  </button>
                </div>
                <div className="help-text">
                  Click Browse to navigate your filesystem, or paste the full path directly
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeSubfolders}
                    onChange={(e) => setIncludeSubfolders(e.target.checked)}
                    disabled={loading}
                  />
                  <span className="checkbox-text">Include subfolders</span>
                </label>
              </div>

              <button
                className="load-button"
                onClick={handleLoad}
                disabled={loading || !directoryPath.trim()}
              >
                {loading ? (
                  <>
                    <span className="button-spinner"></span>
                    Loading...
                  </>
                ) : (
                  <>
                    <span className="button-icon">🔍</span>
                    Load Images
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <FolderBrowser
        isOpen={isBrowserOpen}
        onClose={() => setIsBrowserOpen(false)}
        onSelect={handleFolderSelect}
        initialPath={directoryPath || '~'}
      />
    </>
  );
}

export default DirectorySelector;
