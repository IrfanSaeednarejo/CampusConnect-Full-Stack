import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import IconButton from '../common/IconButton';
import Badge from '../common/Badge';
import Modal from '../common/Modal';

/**
 * Advanced Notes Editor Component - Rich text editor for creating and editing notes
 * Includes formatting tools, tags, attachments, and auto-save functionality
 */
const NotesEditor = React.forwardRef(({
  note,
  onSave,
  onCancel,
  onDelete,
  autoSave = true,
  autoSaveInterval = 30000, // 30 seconds
  className = '',
  ...props
}, ref) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags || []);
  const [currentTag, setCurrentTag] = useState('');
  const [course, setCourse] = useState(note?.course || '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const editorRef = useRef(null);
  const autoSaveTimerRef = useRef(null);

  // Calculate word and character count
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharCount(content.length);
  }, [content]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !note?.id) return;

    autoSaveTimerRef.current = setInterval(() => {
      handleSave(true); // Silent save
    }, autoSaveInterval);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [autoSave, autoSaveInterval, title, content, tags, course, note?.id]);

  // Handle save
  const handleSave = async (silent = false) => {
    if (!title.trim()) {
      if (!silent) {
        alert('Please enter a title for your note');
      }
      return;
    }

    setIsSaving(true);

    try {
      const noteData = {
        id: note?.id,
        title: title.trim(),
        content: content.trim(),
        tags,
        course: course.trim() || undefined,
        updatedAt: new Date().toISOString()
      };

      await onSave?.(noteData);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Save failed:', error);
      if (!silent) {
        alert('Failed to save note. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle tag addition
  const handleAddTag = (e) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      const newTag = currentTag.trim().toLowerCase();
      if (!tags.includes(newTag) && tags.length < 10) {
        setTags([...tags, newTag]);
        setCurrentTag('');
      }
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await onDelete?.(note.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  // Format toolbar buttons
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  return (
    <div ref={ref} className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`} {...props}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full text-xl font-semibold text-gray-900 border-none outline-none focus:ring-0"
            />
          </div>

          <div className="flex items-center space-x-2">
            {lastSaved && (
              <span className="text-xs text-gray-500">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            {isSaving && (
              <span className="text-xs text-gray-500">Saving...</span>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center space-x-1 border-t border-gray-100 pt-3">
          <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
            <IconButton
              icon="format_bold"
              size="sm"
              className="text-gray-600"
              onClick={() => formatText('bold')}
              title="Bold"
            />
            <IconButton
              icon="format_italic"
              size="sm"
              className="text-gray-600"
              onClick={() => formatText('italic')}
              title="Italic"
            />
            <IconButton
              icon="format_underlined"
              size="sm"
              className="text-gray-600"
              onClick={() => formatText('underline')}
              title="Underline"
            />
          </div>

          <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
            <IconButton
              icon="format_list_bulleted"
              size="sm"
              className="text-gray-600"
              onClick={() => formatText('insertUnorderedList')}
              title="Bullet List"
            />
            <IconButton
              icon="format_list_numbered"
              size="sm"
              className="text-gray-600"
              onClick={() => formatText('insertOrderedList')}
              title="Numbered List"
            />
          </div>

          <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
            <IconButton
              icon="link"
              size="sm"
              className="text-gray-600"
              onClick={() => {
                const url = prompt('Enter URL:');
                if (url) formatText('createLink', url);
              }}
              title="Insert Link"
            />
            <IconButton
              icon="image"
              size="sm"
              className="text-gray-600"
              onClick={() => {
                const url = prompt('Enter image URL:');
                if (url) formatText('insertImage', url);
              }}
              title="Insert Image"
            />
          </div>

          <div className="flex items-center space-x-1">
            <IconButton
              icon="undo"
              size="sm"
              className="text-gray-600"
              onClick={() => formatText('undo')}
              title="Undo"
            />
            <IconButton
              icon="redo"
              size="sm"
              className="text-gray-600"
              onClick={() => formatText('redo')}
              title="Redo"
            />
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="p-4">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => setContent(e.target.textContent)}
          className="min-h-[400px] p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ whiteSpace: 'pre-wrap' }}
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Course Selection */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Course/Subject (Optional)
          </label>
          <input
            type="text"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="e.g., CS101, Mathematics"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tags */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Tags ({tags.length}/10)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, index) => (
              <Badge
                key={index}
                variant="filled"
                color="primary"
                size="sm"
                onRemove={() => handleRemoveTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
          {tags.length < 10 && (
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add a tag and press Enter"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
            <span>{Math.ceil(wordCount / 200)} min read</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {note?.id && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <span className="material-symbols-outlined text-sm mr-1">delete</span>
              Delete
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSave(false)}
            disabled={isSaving || !title.trim()}
          >
            {isSaving ? 'Saving...' : 'Save Note'}
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Note"
        size="sm"
      >
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-red-600 text-xl">delete</span>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete this note?
            </h3>
            <p className="text-sm text-gray-600">
              This action cannot be undone. The note will be permanently deleted.
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
});

NotesEditor.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    course: PropTypes.string
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  onDelete: PropTypes.func,
  autoSave: PropTypes.bool,
  autoSaveInterval: PropTypes.number,
  className: PropTypes.string
};

NotesEditor.displayName = 'NotesEditor';

export default NotesEditor;