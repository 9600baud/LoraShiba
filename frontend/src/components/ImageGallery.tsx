import { useState, useMemo } from 'react';
import type { ImageFile } from '../App';
import ImageCard from './ImageCard';
import MultiTagSidebar from './MultiTagSidebar';
import './ImageGallery.css';

interface ImageGalleryProps {
  images: ImageFile[];
  onUpdateTags: (imageId: string, newTags: string[]) => void;
  selectedImageIds: Set<string>;
  onToggleSelection: (imageId: string) => void;
  onMultiUpdateTags: (imageIds: string[], newTags: string[]) => void;
  onClearSelection: () => void;
  onSelectAll: (imageIds: string[]) => void;
}

type ThumbnailSize = 'small' | 'medium' | 'large';

function ImageGallery({
  images,
  onUpdateTags,
  selectedImageIds,
  onToggleSelection,
  onMultiUpdateTags,
  onClearSelection,
  onSelectAll
}: ImageGalleryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [thumbnailSize, setThumbnailSize] = useState<ThumbnailSize>('medium');

  const filteredImages = images.filter(image => {
    if (!searchTerm) return true;

    const search = searchTerm.toLowerCase().trim();

    if (search.startsWith('-')) {
      const missingTag = search.slice(1);
      return !image.tags.some(tag => tag.toLowerCase().includes(missingTag));
    }

    return (
      image.name.toLowerCase().includes(search) ||
      image.tags.some(tag => tag.toLowerCase().includes(search))
    );
  });

  const imagesByDirectory = useMemo(() => {
    const grouped = new Map<string, ImageFile[]>();
    filteredImages.forEach(image => {
      const dir = image.directory || 'Unknown';
      if (!grouped.has(dir)) {
        grouped.set(dir, []);
      }
      grouped.get(dir)!.push(image);
    });
    return Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredImages]);

  const hasMultipleFolders = imagesByDirectory.length > 1;

  const selectedImages = useMemo(() => {
    return images.filter(img => selectedImageIds.has(img.id));
  }, [images, selectedImageIds]);

  const hasSelection = selectedImageIds.size > 0;

  const getSizeClass = () => {
    switch (thumbnailSize) {
      case 'small': return 'size-small';
      case 'large': return 'size-large';
      default: return 'size-medium';
    }
  };

  return (
    <div className={`image-gallery-container ${hasSelection ? 'with-sidebar' : ''}`}>
      <div className="image-gallery">
        <div className="gallery-header">
          <div className="gallery-stats">
            <span className="stat-item">
              <span className="stat-label">Total Images:</span>
              <span className="stat-value">{images.length}</span>
            </span>
            {searchTerm && (
              <span className="stat-item">
                <span className="stat-label">Filtered:</span>
                <span className="stat-value">{filteredImages.length}</span>
              </span>
            )}
            {hasSelection && (
              <span className="stat-item stat-selected">
                <span className="stat-label">Selected:</span>
                <span className="stat-value">{selectedImageIds.size}</span>
              </span>
            )}
          </div>

          <div className="gallery-controls">
            <div className="size-controls">
              <label className="size-label">Size:</label>
              <div className="size-buttons">
                <button
                  className={`size-btn ${thumbnailSize === 'small' ? 'active' : ''}`}
                  onClick={() => setThumbnailSize('small')}
                  title="Small thumbnails"
                >
                  S
                </button>
                <button
                  className={`size-btn ${thumbnailSize === 'medium' ? 'active' : ''}`}
                  onClick={() => setThumbnailSize('medium')}
                  title="Medium thumbnails"
                >
                  M
                </button>
                <button
                  className={`size-btn ${thumbnailSize === 'large' ? 'active' : ''}`}
                  onClick={() => setThumbnailSize('large')}
                  title="Large thumbnails"
                >
                  L
                </button>
              </div>
            </div>
            <button
              className="select-all-btn"
              onClick={() => onSelectAll(filteredImages.map(img => img.id))}
              disabled={filteredImages.length === 0}
              title="Select all visible images"
            >
              ✓ Select All Visible
            </button>
            {hasSelection && (
              <button className="clear-selection-btn" onClick={onClearSelection}>
                Clear Selection
              </button>
            )}
            <div className="gallery-search">
              <input
                type="text"
                className="search-input"
                placeholder="🔍 Search by filename or tags (use -tag to find images missing a tag)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="gallery-content">
          {hasMultipleFolders ? (
            imagesByDirectory.map(([directory, dirImages]) => (
              <div key={directory} className="directory-section">
                <div className="directory-header">
                  <h3 className="directory-title">📁 {directory}</h3>
                  <span className="directory-count">{dirImages.length} images</span>
                </div>
                <div className={`gallery-grid ${getSizeClass()}`}>
                  {dirImages.map((image) => (
                    <ImageCard
                      key={image.id}
                      image={image}
                      onUpdateTags={onUpdateTags}
                      isSelected={selectedImageIds.has(image.id)}
                      onToggleSelection={onToggleSelection}
                      thumbnailSize={thumbnailSize}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className={`gallery-grid ${getSizeClass()}`}>
              {filteredImages.map((image) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  onUpdateTags={onUpdateTags}
                  isSelected={selectedImageIds.has(image.id)}
                  onToggleSelection={onToggleSelection}
                  thumbnailSize={thumbnailSize}
                />
              ))}
            </div>
          )}
        </div>

        {filteredImages.length === 0 && searchTerm && (
          <div className="no-results">
            <p>No images match your search</p>
          </div>
        )}
      </div>

      {hasSelection && (
        <MultiTagSidebar
          selectedImages={selectedImages}
          onMultiUpdateTags={onMultiUpdateTags}
          onClearSelection={onClearSelection}
        />
      )}
    </div>
  );
}

export default ImageGallery;
