import { useMemo, useState, type KeyboardEvent } from 'react';
import type { ImageFile } from '../App';
import { hashStringToColor, getTextColorForBackground } from '../utils/tagColors';
import './MultiTagSidebar.css';

interface MultiTagSidebarProps {
  selectedImages: ImageFile[];
  onMultiUpdateTags: (imageIds: string[], newTags: string[]) => void;
  onClearSelection: () => void;
}

interface TagInfo {
  tag: string;
  count: number;
  isCommon: boolean;
}

function MultiTagSidebar({ selectedImages, onMultiUpdateTags, onClearSelection }: MultiTagSidebarProps) {
  const [newTag, setNewTag] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  const tagAnalysis = useMemo(() => {
    const tagCounts = new Map<string, number>();

    selectedImages.forEach(image => {
      image.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    const totalImages = selectedImages.length;
    const tags: TagInfo[] = [];

    tagCounts.forEach((count, tag) => {
      tags.push({
        tag,
        count,
        isCommon: count === totalImages,
      });
    });

    tags.sort((a, b) => {
      if (a.isCommon !== b.isCommon) return a.isCommon ? -1 : 1;
      if (a.count !== b.count) return b.count - a.count;
      return a.tag.localeCompare(b.tag);
    });

    return { tags, totalImages };
  }, [selectedImages]);

  const handleTagClick = (tagInfo: TagInfo) => {
    if (tagInfo.isCommon) {
      const updatedImagesWithTags = selectedImages.map(image => {
        const newTags = image.tags.filter(t => t !== tagInfo.tag);
        return { id: image.id, tags: newTags };
      });

      updatedImagesWithTags.forEach(({ id, tags }) => {
        onMultiUpdateTags([id], tags);
      });
    } else {
      const updatedImagesWithTags = selectedImages.map(image => {
        if (image.tags.includes(tagInfo.tag)) {
          return { id: image.id, tags: image.tags };
        } else {
          return { id: image.id, tags: [...image.tags, tagInfo.tag] };
        }
      });

      updatedImagesWithTags.forEach(({ id, tags }) => {
        onMultiUpdateTags([id], tags);
      });
    }
  };

  const handleAddNewTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag) {
      const updatedImagesWithTags = selectedImages.map(image => {
        if (!image.tags.includes(trimmedTag)) {
          return { id: image.id, tags: [...image.tags, trimmedTag] };
        }
        return { id: image.id, tags: image.tags };
      });

      updatedImagesWithTags.forEach(({ id, tags }) => {
        onMultiUpdateTags([id], tags);
      });

      setNewTag('');
      setIsAddingTag(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddNewTag();
    } else if (e.key === 'Escape') {
      setNewTag('');
      setIsAddingTag(false);
    }
  };

  const commonTags = tagAnalysis.tags.filter(t => t.isCommon);
  const partialTags = tagAnalysis.tags.filter(t => !t.isCommon);

  return (
    <div className="multi-tag-sidebar">
      <div className="sidebar-header">
        <h3>Multi-Tag Editor</h3>
        <button className="sidebar-close" onClick={onClearSelection} title="Close sidebar">
          ×
        </button>
      </div>

      <div className="sidebar-info">
        <div className="selected-count">
          <span className="count-badge">{selectedImages.length}</span>
          <span className="count-text">images selected</span>
        </div>
      </div>

      <div className="sidebar-body">
        <div className="add-new-tag-section">
          <div className="section-title">
            <span className="section-icon">+</span>
            Add New Tag to All
          </div>
          {isAddingTag ? (
            <div className="new-tag-input-wrapper">
              <input
                type="text"
                className="new-tag-input"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleAddNewTag}
                placeholder="Enter new tag..."
                autoFocus
              />
            </div>
          ) : (
            <button
              className="add-new-tag-button"
              onClick={() => setIsAddingTag(true)}
            >
              + Add New Tag
            </button>
          )}
        </div>

        {commonTags.length > 0 && (
          <div className="tag-section">
            <div className="section-title">
              <span className="section-icon">✓</span>
              Common Tags ({commonTags.length})
            </div>
            <div className="tags-list">
              {commonTags.map((tagInfo) => {
                const bgColor = hashStringToColor(tagInfo.tag);
                const textColor = getTextColorForBackground(bgColor);
                return (
                  <button
                    key={tagInfo.tag}
                    className="tag-pill common-tag"
                    onClick={() => handleTagClick(tagInfo)}
                    title={`Remove "${tagInfo.tag}" from all images`}
                    style={{
                      backgroundColor: bgColor,
                      borderColor: bgColor,
                      color: textColor
                    }}
                  >
                    {tagInfo.tag}
                    <span className="tag-action">−</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {partialTags.length > 0 && (
          <div className="tag-section">
            <div className="section-title">
              <span className="section-icon">◐</span>
              Partial Tags ({partialTags.length})
            </div>
            <div className="tags-list">
              {partialTags.map((tagInfo) => {
                const bgColor = hashStringToColor(tagInfo.tag);
                const textColor = getTextColorForBackground(bgColor);
                return (
                  <button
                    key={tagInfo.tag}
                    className="tag-pill partial-tag"
                    onClick={() => handleTagClick(tagInfo)}
                    title={`Add "${tagInfo.tag}" to all images (currently on ${tagInfo.count}/${tagAnalysis.totalImages})`}
                    style={{
                      backgroundColor: bgColor,
                      borderColor: bgColor,
                      color: textColor
                    }}
                  >
                    {tagInfo.tag}
                    <span className="tag-count">{tagInfo.count}/{tagAnalysis.totalImages}</span>
                    <span className="tag-action">+</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {commonTags.length === 0 && partialTags.length === 0 && (
          <div className="no-tags-message">
            <p>No tags on selected images yet.</p>
            <p className="hint-text">Use "Add New Tag" above to start tagging.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MultiTagSidebar;
