import { useState } from 'react';
import './App.css';
import DirectorySelector from './components/DirectorySelector';
import ImageGallery from './components/ImageGallery';

export interface ImageFile {
  id: string;
  name: string;
  path: string;
  relativePath: string;
  tags: string[];
  textFilePath: string;
  width?: number;
  height?: number;
  directory?: string;
}

function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());

  const handleLoadImages = async (directoryPath: string, includeSubfolders: boolean) => {
    setLoading(true);
    setError(null);
    setSelectedImageIds(new Set());

    try {
      const response = await fetch('/api/scan-directory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ directoryPath, includeSubfolders }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load images');
      }

      const data = await response.json();
      setImages(data.images);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTags = async (imageId: string, newTags: string[]) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    try {
      const response = await fetch('/api/update-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          textFilePath: image.textFilePath,
          tags: newTags,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update tags');
      }

      setImages(prevImages =>
        prevImages.map(img =>
          img.id === imageId ? { ...img, tags: newTags } : img
        )
      );
    } catch (err) {
      console.error('Error updating tags:', err);
      setError('Failed to save tags');
    }
  };

  const handleToggleSelection = (imageId: string) => {
    setSelectedImageIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const handleMultiUpdateTags = async (imageIds: string[], newTags: string[]) => {
    try {
      const updatePromises = imageIds.map(async (imageId) => {
        const image = images.find(img => img.id === imageId);
        if (!image) return;

        const response = await fetch('/api/update-tags', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            textFilePath: image.textFilePath,
            tags: newTags,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update tags for ${image.name}`);
        }
      });

      await Promise.all(updatePromises);

      setImages(prevImages =>
        prevImages.map(img =>
          imageIds.includes(img.id) ? { ...img, tags: newTags } : img
        )
      );
    } catch (err) {
      console.error('Error updating tags:', err);
      setError('Failed to save tags for some images');
    }
  };

  const handleClearSelection = () => {
    setSelectedImageIds(new Set());
  };

  const handleSelectAll = (imageIds: string[]) => {
    setSelectedImageIds(new Set(imageIds));
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">🏷️ LORA Tagger</h1>
          <p className="app-subtitle">Tag your training images with ease</p>
        </div>
      </header>

      <main className="app-main">
        <DirectorySelector onLoad={handleLoadImages} loading={loading} hasImages={images.length > 0} />

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Scanning directory...</p>
          </div>
        )}

        {!loading && images.length > 0 && (
          <ImageGallery
            images={images}
            onUpdateTags={handleUpdateTags}
            selectedImageIds={selectedImageIds}
            onToggleSelection={handleToggleSelection}
            onMultiUpdateTags={handleMultiUpdateTags}
            onClearSelection={handleClearSelection}
            onSelectAll={handleSelectAll}
          />
        )}

        {!loading && !error && images.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📁</div>
            <h3>No images loaded yet</h3>
            <p>Select a directory above to get started</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
