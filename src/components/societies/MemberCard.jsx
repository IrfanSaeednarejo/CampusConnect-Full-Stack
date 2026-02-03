import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import IconButton from '../common/IconButton';

/**
 * Advanced Member Card Component - Displays society member information
 * Shows member profile, role, activity, and interaction options
 */
const MemberCard = React.forwardRef(({
  member,
  currentUser,
  onMessage,
  onViewProfile,
  onRemoveMember,
  onPromote,
  onDemote,
  canManage = false,
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  // Determine if current user can manage this member
  const canManageThisMember = canManage && member.id !== currentUser?.id;

  // Get role badge color
  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'president':
      case 'admin':
        return 'danger';
      case 'vice president':
      case 'moderator':
        return 'warning';
      case 'treasurer':
      case 'secretary':
        return 'info';
      default:
        return 'secondary';
    }
  };

  // Render compact variant
  if (variant === 'compact') {
    return (
      <motion.div
        ref={ref}
        className={`bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow ${className}`}
        whileHover={{ y: -2 }}
        {...props}
      >
        <div className="flex items-center space-x-3">
          <Avatar
            src={member.avatar}
            name={member.name}
            size="md"
            status={member.isOnline ? 'online' : 'offline'}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900 truncate">{member.name}</h4>
              {member.role && (
                <Badge variant="outline" color={getRoleColor(member.role)} size="xs">
                  {member.role}
                </Badge>
              )}
            </div>
            {member.title && (
              <p className="text-sm text-gray-600 truncate">{member.title}</p>
            )}
            {member.joinedDate && (
              <p className="text-xs text-gray-500">
                Joined {new Date(member.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {canManageThisMember && (
              <IconButton
                icon="more_vert"
                size="sm"
                className="text-gray-400"
              />
            )}
            {member.id !== currentUser?.id && (
              <IconButton
                icon="chat"
                size="sm"
                className="text-gray-400"
                onClick={() => onMessage?.(member)}
              />
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Render default variant
  return (
    <motion.div
      ref={ref}
      className={`bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow ${className}`}
      whileHover={{ y: -2 }}
      {...props}
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar
              src={member.avatar}
              name={member.name}
              size="lg"
              status={member.isOnline ? 'online' : 'offline'}
            />

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                {member.isVerified && (
                  <span className="material-symbols-outlined text-blue-500 text-sm">verified</span>
                )}
              </div>
              {member.title && (
                <p className="text-sm text-gray-600">{member.title}</p>
              )}
              {member.department && (
                <p className="text-xs text-gray-500">{member.department}</p>
              )}
            </div>
          </div>

          {member.role && (
            <Badge variant="filled" color={getRoleColor(member.role)} size="sm">
              {member.role}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Bio */}
        {member.bio && (
          <p className="text-sm text-gray-700 mb-4 line-clamp-2">{member.bio}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {member.eventsAttended || 0}
            </div>
            <div className="text-xs text-gray-500">Events</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {member.postsCount || 0}
            </div>
            <div className="text-xs text-gray-500">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {member.contributions || 0}
            </div>
            <div className="text-xs text-gray-500">Contributions</div>
          </div>
        </div>

        {/* Skills/Interests */}
        {member.skills && member.skills.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-900 mb-2">Skills</h4>
            <div className="flex flex-wrap gap-1">
              {member.skills.slice(0, 4).map((skill, index) => (
                <Badge key={index} variant="outline" size="xs" color="info">
                  {skill}
                </Badge>
              ))}
              {member.skills.length > 4 && (
                <Badge variant="outline" size="xs" color="secondary">
                  +{member.skills.length - 4}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Join Date */}
        {member.joinedDate && (
          <div className="mb-4 text-xs text-gray-500">
            <span className="material-symbols-outlined text-xs mr-1">calendar_today</span>
            Joined {new Date(member.joinedDate).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric'
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {member.id !== currentUser?.id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMessage?.(member)}
              >
                <span className="material-symbols-outlined text-sm mr-1">chat</span>
                Message
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewProfile?.(member)}
            >
              View Profile
            </Button>
          </div>

          {canManageThisMember && (
            <div className="flex items-center space-x-1">
              {member.role?.toLowerCase() !== 'president' && (
                <>
                  {member.role?.toLowerCase() !== 'admin' && (
                    <IconButton
                      icon="arrow_upward"
                      size="sm"
                      className="text-blue-500"
                      onClick={() => onPromote?.(member)}
                      title="Promote"
                    />
                  )}
                  <IconButton
                    icon="arrow_downward"
                    size="sm"
                    className="text-yellow-500"
                    onClick={() => onDemote?.(member)}
                    title="Demote"
                  />
                </>
              )}
              <IconButton
                icon="person_remove"
                size="sm"
                className="text-red-500"
                onClick={() => onRemoveMember?.(member)}
                title="Remove Member"
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

MemberCard.propTypes = {
  member: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    title: PropTypes.string,
    department: PropTypes.string,
    bio: PropTypes.string,
    role: PropTypes.string,
    skills: PropTypes.arrayOf(PropTypes.string),
    isOnline: PropTypes.bool,
    isVerified: PropTypes.bool,
    joinedDate: PropTypes.string,
    eventsAttended: PropTypes.number,
    postsCount: PropTypes.number,
    contributions: PropTypes.number
  }).isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.string
  }),
  onMessage: PropTypes.func,
  onViewProfile: PropTypes.func,
  onRemoveMember: PropTypes.func,
  onPromote: PropTypes.func,
  onDemote: PropTypes.func,
  canManage: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'compact']),
  className: PropTypes.string
};

MemberCard.displayName = 'MemberCard';

export default MemberCard;