import { useState, type KeyboardEvent } from 'react';
import type { ImageFile } from '../App';
import { hashStringToColor, getTextColorForBackground } from '../utils/tagColors';
import './ImageCard.css';

interface ImageCardProps {
  image: ImageFile;
  onUpdateTags: (imageId: string, newTags: string[]) => void;
  isSelected: boolean;
  onToggleSelection: (imageId: string) => void;
  thumbnailSize: 'small' | 'medium' | 'large';
}

function ImageCard({ image, onUpdateTags, isSelected, onToggleSelection, thumbnailSize }: ImageCardProps) {
  const [newTag, setNewTag] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [draggedTagIndex, setDraggedTagIndex] = useState<number | null>(null);

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = image.tags.filter(tag => tag !== tagToRemove);
    onUpdateTags(image.id, updatedTags);
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !image.tags.includes(trimmedTag)) {
      const updatedTags = [...image.tags, trimmedTag];
      onUpdateTags(image.id, updatedTags);
      setNewTag('');
      setIsAddingTag(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddTag();
    } else if (e.key === 'Escape') {
      setNewTag('');
      setIsAddingTag(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.tags-container, .tag-pill, .add-tag-button, .tag-input')) {
      return;
    }
    onToggleSelection(image.id);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedTagIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedTagIndex === null || draggedTagIndex === dropIndex) {
      return;
    }

    const newTags = [...image.tags];
    const draggedTag = newTags[draggedTagIndex];

    newTags.splice(draggedTagIndex, 1);
    newTags.splice(dropIndex, 0, draggedTag);

    onUpdateTags(image.id, newTags);
    setDraggedTagIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedTagIndex(null);
  };

  return (
    <div
      className={`image-card ${isSelected ? 'selected' : ''}`}
      onClick={handleCardClick}
    >
      <div className="selection-indicator">
        {isSelected && <span className="checkmark">✓</span>}
      </div>

      <div className="image-container">
        <img
          src={`/api/image/${encodeURIComponent(image.relativePath)}`}
          alt={image.name}
          className="image-preview"
          loading="lazy"
        />
      </div>

      <div className="image-info">
        <div className="image-name" title={image.name}>
          {image.name}
        </div>

        {image.width && image.height && (
          <div className="image-dimensions">
            {image.width} × {image.height}
          </div>
        )}

        <div className="tags-container">
          <div className="tags-label">Tags:</div>
          <div className="tags-list">
            {image.tags.map((tag, index) => {
              const bgColor = hashStringToColor(tag);
              const textColor = getTextColorForBackground(bgColor);
              return (
                <span
                  key={`${tag}-${index}`}
                  className={`tag-pill ${draggedTagIndex === index ? 'dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  style={{
                    backgroundColor: bgColor,
                    color: textColor
                  }}
                >
                  <span className="drag-handle">⋮⋮</span>
                  {tag}
                  <button
                    className="tag-remove"
                    onClick={() => handleRemoveTag(tag)}
                    aria-label={`Remove tag ${tag}`}
                  >
                    ×
                  </button>
                </span>
              );
            })}

            {isAddingTag ? (
              <div className="tag-input-wrapper">
                <input
                  type="text"
                  className="tag-input"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleAddTag}
                  placeholder="Enter tag..."
                  autoFocus
                />
              </div>
            ) : (
              <button
                className="add-tag-button"
                onClick={() => setIsAddingTag(true)}
              >
                + Add Tag
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageCard;
