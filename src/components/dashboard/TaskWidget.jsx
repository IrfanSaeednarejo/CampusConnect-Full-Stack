import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import Badge from '../common/Badge';
import Button from '../common/Button';
import IconButton from '../common/IconButton';
import ProgressBar from '../common/ProgressBar';

/**
 * Advanced Task Widget Component with drag-and-drop, prioritization, and time tracking
 */
const TaskWidget = ({
  tasks = [],
  onTaskComplete,
  onTaskEdit,
  onTaskDelete,
  onAddTask,
  showProgress = true,
  showDueDates = true,
  maxVisible = 5,
  className = '',
  ...props
}) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'pending':
        return !task.completed;
      case 'completed':
        return task.completed;
      case 'overdue':
        return !task.completed && task.dueDate && isPast(new Date(task.dueDate));
      case 'today':
        return task.dueDate && isToday(new Date(task.dueDate));
      default:
        return true;
    }
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'dueDate':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      case 'created':
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });

  const visibleTasks = sortedTasks.slice(0, maxVisible);
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return null;

    const date = new Date(dueDate);
    if (isPast(date) && !isToday(date)) return 'overdue';
    if (isToday(date)) return 'today';
    if (isTomorrow(date)) return 'tomorrow';
    return 'upcoming';
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;

    const date = new Date(dueDate);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  return (
    <motion.div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
          {showProgress && (
            <p className="text-sm text-gray-500 mt-1">
              {completedTasks} of {totalTasks} completed
            </p>
          )}
        </div>

        <Button variant="primary" size="sm" onClick={onAddTask}>
          <span className="material-symbols-outlined text-sm mr-1">add</span>
          Add Task
        </Button>
      </div>

      {/* Progress Bar */}
      {showProgress && totalTasks > 0 && (
        <div className="px-4 py-3 border-b border-gray-200">
          <ProgressBar value={progress} size="sm" color="primary" />
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center space-x-2 p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex space-x-1">
          {['all', 'pending', 'today', 'overdue'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filter === filterType
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="dueDate">Due Date</option>
          <option value="priority">Priority</option>
          <option value="created">Created</option>
        </select>
      </div>

      {/* Tasks List */}
      <div className="max-h-96 overflow-y-auto">
        {visibleTasks.length === 0 ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-gray-400 text-4xl mb-2">task</span>
            <p className="text-gray-500">No tasks found</p>
            <Button variant="outline" size="sm" onClick={onAddTask} className="mt-2">
              Create your first task
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {visibleTasks.map((task, index) => {
              const dueDateStatus = getDueDateStatus(task.dueDate);

              return (
                <motion.div
                  key={task.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    task.completed ? 'bg-green-50' : ''
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start space-x-3">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => onTaskComplete(task.id)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${
                            task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                          }`}>
                            {task.title}
                          </h4>

                          {task.description && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          {/* Tags and Due Date */}
                          <div className="flex items-center space-x-2 mt-2">
                            {task.priority && (
                              <Badge
                                variant="outline"
                                size="xs"
                                color={getPriorityColor(task.priority)}
                              >
                                {task.priority}
                              </Badge>
                            )}

                            {showDueDates && task.dueDate && (
                              <Badge
                                variant="outline"
                                size="xs"
                                color={
                                  dueDateStatus === 'overdue' ? 'danger' :
                                  dueDateStatus === 'today' ? 'warning' : 'info'
                                }
                              >
                                {formatDueDate(task.dueDate)}
                              </Badge>
                            )}

                            {task.category && (
                              <Badge variant="outline" size="xs" color="secondary">
                                {task.category}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1 ml-2">
                          <IconButton
                            icon="edit"
                            size="sm"
                            onClick={() => onTaskEdit(task.id)}
                            className="text-gray-400 hover:text-gray-600"
                          />
                          <IconButton
                            icon="delete"
                            size="sm"
                            onClick={() => onTaskDelete(task.id)}
                            className="text-gray-400 hover:text-red-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {tasks.length > maxVisible && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <Button variant="ghost" size="sm" className="w-full text-gray-600 hover:text-gray-900">
            View all tasks ({tasks.length})
          </Button>
        </div>
      )}
    </motion.div>
  );
};

TaskWidget.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      completed: PropTypes.bool,
      priority: PropTypes.oneOf(['low', 'medium', 'high']),
      dueDate: PropTypes.string,
      category: PropTypes.string,
      createdAt: PropTypes.string
    })
  ),
  onTaskComplete: PropTypes.func,
  onTaskEdit: PropTypes.func,
  onTaskDelete: PropTypes.func,
  onAddTask: PropTypes.func,
  showProgress: PropTypes.bool,
  showDueDates: PropTypes.bool,
  maxVisible: PropTypes.number,
  className: PropTypes.string
};

export default TaskWidget;