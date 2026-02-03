import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import IconButton from '../common/IconButton';

/**
 * Advanced Note Card Component - Displays note information with actions
 * Shows note preview, tags, sharing options, and management features
 */
const NoteCard = React.forwardRef(({
  note,
  onEdit,
  onDelete,
  onShare,
  onPin,
  onArchive,
  onView,
  isPinned = false,
  isArchived = false,
  currentUser,
  className = '',
  ...props
}, ref) => {
  const [showActions, setShowActions] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Check if user is owner
  const isOwner = currentUser?.id === note.author?.id;

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <motion.div
      ref={ref}
      className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden ${
        isPinned ? 'border-blue-500 border-2' : ''
      } ${className}`}
      whileHover={{ y: -2 }}
      {...props}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {note.author && (
              <Avatar
                src={note.author.avatar}
                name={note.author.name}
                size="sm"
              />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-gray-900 truncate">{note.title}</h3>
                {isPinned && (
                  <span className="material-symbols-outlined text-blue-500 text-sm flex-shrink-0">
                    push_pin
                  </span>
                )}
                {isArchived && (
                  <Badge variant="outline" color="secondary" size="xs">
                    Archived
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                {note.author && (
                  <span className="text-xs text-gray-500">{note.author.name}</span>
                )}
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">{formatDate(note.createdAt)}</span>
                {note.updatedAt !== note.createdAt && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">Edited {formatDate(note.updatedAt)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <IconButton
              icon="more_vert"
              size="sm"
              className="text-gray-400"
              onClick={() => setShowActions(!showActions)}
            />

            {showActions && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                <button
                  onClick={() => {
                    onView?.(note);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  <span>View</span>
                </button>

                {isOwner && (
                  <>
                    <button
                      onClick={() => {
                        onEdit?.(note);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => {
                        onPin?.(note.id);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {isPinned ? 'push_pin' : 'push_pin'}
                      </span>
                      <span>{isPinned ? 'Unpin' : 'Pin'}</span>
                    </button>

                    <button
                      onClick={() => {
                        onArchive?.(note.id);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {isArchived ? 'unarchive' : 'archive'}
                      </span>
                      <span>{isArchived ? 'Unarchive' : 'Archive'}</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    onShare?.(note);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <span className="material-symbols-outlined text-sm">share</span>
                  <span>Share</span>
                </button>

                {isOwner && (
                  <div className="border-t border-gray-200">
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this note?')) {
                          onDelete?.(note.id);
                        }
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Preview */}
      <div className="p-4">
        {/* Image Preview */}
        {note.image && !imageError && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img
              src={note.image}
              alt={note.title}
              className="w-full h-48 object-cover"
              onError={handleImageError}
            />
          </div>
        )}

        {/* Text Preview */}
        <p className={`text-sm text-gray-700 leading-relaxed ${
          note.content && note.content.length > 200 ? 'line-clamp-4' : ''
        }`}>
          {note.content || note.preview}
        </p>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {note.tags.map((tag, index) => (
              <Badge key={index} variant="outline" size="xs" color="info">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Attachments */}
        {note.attachments && note.attachments.length > 0 && (
          <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500">
            <span className="material-symbols-outlined text-sm">attach_file</span>
            <span>{note.attachments.length} attachment{note.attachments.length > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Course/Subject */}
        {note.course && (
          <div className="mt-3">
            <Badge variant="filled" color="primary" size="xs">
              {note.course}
            </Badge>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          {note.wordCount && (
            <span>{note.wordCount} words</span>
          )}
          {note.readTime && (
            <span>{note.readTime} min read</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView?.(note)}
          >
            View Note
          </Button>
        </div>
      </div>
    </motion.div>
  );
});

NoteCard.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string,
    preview: PropTypes.string,
    image: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    course: PropTypes.string,
    author: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      avatar: PropTypes.string
    }),
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string,
    attachments: PropTypes.arrayOf(PropTypes.object),
    wordCount: PropTypes.number,
    readTime: PropTypes.number
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onShare: PropTypes.func,
  onPin: PropTypes.func,
  onArchive: PropTypes.func,
  onView: PropTypes.func,
  isPinned: PropTypes.bool,
  isArchived: PropTypes.bool,
  currentUser: PropTypes.shape({
    id: PropTypes.string
  }),
  className: PropTypes.string
};

NoteCard.displayName = 'NoteCard';

export default NoteCard;