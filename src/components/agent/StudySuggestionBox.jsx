import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import IconButton from '../common/IconButton';
import ProgressBar from '../common/ProgressBar';
import Tabs from '../common/Tabs';

/**
 * Advanced Study Suggestion Box Component - AI-powered personalized study recommendations
 * Provides adaptive learning paths, resource suggestions, and progress tracking
 */
const StudySuggestionBox = React.forwardRef(({
  student,
  currentCourses = [],
  completedCourses = [],
  studyGoals = [],
  learningStyle = 'visual',
  studyStreak = 0,
  weeklyGoal = 10,
  studyHoursThisWeek = 0,
  onSuggestionAccepted,
  onSuggestionRejected,
  onResourceAccessed,
  onProgressUpdated,
  isGenerating = false,
  className = '',
  ...props
}, ref) => {
  const [activeTab, setActiveTab] = useState('recommendations');
  const [suggestions, setSuggestions] = useState([]);
  const [learningPath, setLearningPath] = useState([]);
  const [studyPlan, setStudyPlan] = useState([]);
  const [isPersonalizing, setIsPersonalizing] = useState(false);

  // Suggestion categories
  const suggestionTypes = {
    course: { icon: 'school', color: 'primary', label: 'Courses' },
    resource: { icon: 'library_books', color: 'info', label: 'Resources' },
    project: { icon: 'code', color: 'success', label: 'Projects' },
    skill: { icon: 'lightbulb', color: 'warning', label: 'Skills' },
    break: { icon: 'coffee', color: 'secondary', label: 'Study Breaks' }
  };

  // Generate AI-powered suggestions
  const generateSuggestions = useCallback(async () => {
    setIsPersonalizing(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock AI-generated suggestions based on student's profile
    const mockSuggestions = [
      {
        id: 'course-1',
        type: 'course',
        title: 'Advanced React Development',
        description: 'Master advanced React concepts including hooks, context, and performance optimization',
        difficulty: 'intermediate',
        duration: '8 weeks',
        rating: 4.8,
        enrolled: 12500,
        relevance_score: 0.95,
        reason: 'Based on your current React projects and career goals',
        prerequisites: ['Basic React', 'JavaScript ES6+'],
        outcomes: ['Build complex React applications', 'Optimize app performance', 'Master advanced patterns']
      },
      {
        id: 'resource-1',
        type: 'resource',
        title: 'System Design Interview Guide',
        description: 'Comprehensive guide covering distributed systems, scalability, and design patterns',
        format: 'interactive_book',
        duration: '10 hours',
        rating: 4.9,
        downloads: 50000,
        relevance_score: 0.88,
        reason: 'Essential for software engineering interviews',
        skills_covered: ['System Design', 'Scalability', 'Database Design']
      },
      {
        id: 'project-1',
        type: 'project',
        title: 'Build a Real-time Chat Application',
        description: 'Create a full-stack chat app with WebSocket, authentication, and file sharing',
        difficulty: 'advanced',
        duration: '3 weeks',
        technologies: ['React', 'Node.js', 'Socket.io', 'MongoDB'],
        relevance_score: 0.92,
        reason: 'Combines your interest in full-stack development and real-time features'
      },
      {
        id: 'skill-1',
        type: 'skill',
        title: 'Docker Containerization',
        description: 'Learn to containerize applications for consistent deployment across environments',
        difficulty: 'beginner',
        duration: '1 week',
        practical_value: 'high',
        relevance_score: 0.85,
        reason: 'Critical skill for modern software deployment'
      }
    ];

    // Generate learning path
    const mockLearningPath = [
      {
        phase: 'Foundation',
        weeks: '1-4',
        focus: 'Strengthen core programming fundamentals',
        courses: ['Data Structures & Algorithms', 'Database Design', 'API Development'],
        milestones: ['Complete 3 coding challenges', 'Build REST API', 'Design database schema']
      },
      {
        phase: 'Specialization',
        weeks: '5-12',
        focus: 'Deep dive into chosen technology stack',
        courses: ['Advanced React', 'Node.js Microservices', 'Cloud Deployment'],
        milestones: ['Build portfolio project', 'Deploy to production', 'Write technical blog']
      },
      {
        phase: 'Professional Development',
        weeks: '13-24',
        focus: 'Develop industry-ready skills and network',
        courses: ['System Design', 'Technical Interview Prep', 'Soft Skills'],
        milestones: ['Pass technical interviews', 'Build professional network', 'Contribute to open source']
      }
    ];

    // Generate study plan
    const mockStudyPlan = [
      {
        day: 'Monday',
        focus: 'Core Programming',
        activities: [
          '2 hours: Data Structures practice',
          '1 hour: Algorithm analysis',
          '1 hour: Code review'
        ],
        resources: ['LeetCode', 'GeeksforGeeks']
      },
      {
        day: 'Tuesday',
        focus: 'Web Development',
        activities: [
          '2 hours: React development',
          '1 hour: API integration',
          '1 hour: Testing'
        ],
        resources: ['React Documentation', 'Jest Testing']
      },
      {
        day: 'Wednesday',
        focus: 'System Design',
        activities: [
          '2 hours: Design patterns study',
          '1 hour: Case studies',
          '1 hour: Group discussion'
        ],
        resources: ['System Design Primer', 'Case studies']
      },
      {
        day: 'Thursday',
        focus: 'Projects & Practice',
        activities: [
          '3 hours: Personal project work',
          '1 hour: Code refactoring'
        ],
        resources: ['GitHub', 'Stack Overflow']
      },
      {
        day: 'Friday',
        focus: 'Review & Planning',
        activities: [
          '1 hour: Weekly review',
          '1 hour: Next week planning',
          '2 hours: Skill development'
        ],
        resources: ['Personal notes', 'Learning roadmap']
      },
      {
        day: 'Saturday',
        focus: 'Deep Work',
        activities: [
          '4 hours: Focused study session',
          '2 hours: Research and exploration'
        ],
        resources: ['Technical blogs', 'Research papers']
      },
      {
        day: 'Sunday',
        focus: 'Rest & Integration',
        activities: [
          'Light review of weekly learnings',
          'Plan for next week',
          'Relax and recharge'
        ],
        resources: ['Meditation apps', 'Light reading']
      }
    ];

    setSuggestions(mockSuggestions);
    setLearningPath(mockLearningPath);
    setStudyPlan(mockStudyPlan);
    setIsPersonalizing(false);
  }, [student, currentCourses, completedCourses, studyGoals, learningStyle]);

  // Handle suggestion actions
  const handleSuggestionAccept = (suggestion) => {
    onSuggestionAccepted?.(suggestion);
  };

  const handleSuggestionReject = (suggestion) => {
    onSuggestionRejected?.(suggestion);
  };

  const handleResourceAccess = (resource) => {
    onResourceAccessed?.(resource);
  };

  // Calculate progress
  const weeklyProgress = Math.min((studyHoursThisWeek / weeklyGoal) * 100, 100);

  // Auto-generate suggestions on mount
  useEffect(() => {
    if (suggestions.length === 0 && !isGenerating) {
      generateSuggestions();
    }
  }, [generateSuggestions, suggestions.length, isGenerating]);

  // Render recommendations tab
  const renderRecommendations = () => (
    <div className="space-y-6">
      {/* AI Personalization Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <span className="material-symbols-outlined text-blue-600">psychology</span>
          <div>
            <h4 className="text-sm font-medium text-blue-900">AI-Personalized Recommendations</h4>
            <p className="text-sm text-blue-700 mt-1">
              Based on your learning style ({learningStyle}), current courses, and career goals,
              here are tailored suggestions to accelerate your progress.
            </p>
          </div>
        </div>
      </div>

      {/* Study Progress */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Weekly Study Progress</h4>
          <Badge variant="rounded" color={weeklyProgress >= 100 ? 'success' : 'primary'}>
            {studyHoursThisWeek}/{weeklyGoal} hours
          </Badge>
        </div>
        <ProgressBar value={weeklyProgress} size="sm" color="primary" />
        <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
          <span>Study streak: {studyStreak} days 🔥</span>
          <span>{weeklyProgress.toFixed(1)}% complete</span>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {suggestions.map((suggestion, index) => {
          const typeConfig = suggestionTypes[suggestion.type];

          return (
            <motion.div
              key={suggestion.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start space-x-4">
                {/* Type Icon */}
                <div className={`w-10 h-10 bg-${typeConfig.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <span className={`material-symbols-outlined text-${typeConfig.color}-600`}>
                    {typeConfig.icon}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                        <Badge variant="outline" size="xs" color={typeConfig.color}>
                          {typeConfig.label}
                        </Badge>
                        <Badge variant="outline" size="xs" color={
                          suggestion.difficulty === 'beginner' ? 'success' :
                          suggestion.difficulty === 'intermediate' ? 'warning' : 'danger'
                        }>
                          {suggestion.difficulty}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>

                      {/* Metadata */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                        {suggestion.duration && <span>⏱️ {suggestion.duration}</span>}
                        {suggestion.rating && <span>⭐ {suggestion.rating}</span>}
                        {suggestion.enrolled && <span>👥 {suggestion.enrolled.toLocaleString()} enrolled</span>}
                        {suggestion.downloads && <span>📥 {suggestion.downloads.toLocaleString()} downloads</span>}
                      </div>

                      {/* AI Reason */}
                      <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3">
                        <p className="text-xs text-blue-800">
                          <span className="font-medium">Why this matches you:</span> {suggestion.reason}
                        </p>
                      </div>

                      {/* Outcomes/Resources */}
                      {suggestion.outcomes && (
                        <div className="mb-3">
                          <h5 className="text-xs font-medium text-gray-700 mb-1">Learning Outcomes:</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {suggestion.outcomes.map((outcome, idx) => (
                              <li key={idx}>• {outcome}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {suggestion.skills_covered && (
                        <div className="flex flex-wrap gap-1">
                          {suggestion.skills_covered.map((skill, idx) => (
                            <Badge key={idx} variant="outline" size="xs" color="info">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Relevance Score */}
                    <div className="text-right ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {(suggestion.relevance_score * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500">Relevance</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex space-x-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSuggestionAccept(suggestion)}
                      >
                        Add to Plan
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionReject(suggestion)}
                      >
                        Not Interested
                      </Button>
                    </div>

                    {suggestion.type === 'resource' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResourceAccess(suggestion)}
                      >
                        Access Resource
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  // Render learning path tab
  const renderLearningPath = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Learning Journey</h3>
        <p className="text-gray-600">
          6-month personalized learning path based on your goals and current skill level
        </p>
      </div>

      <div className="space-y-4">
        {learningPath.map((phase, index) => (
          <motion.div
            key={index}
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            {/* Connector Line */}
            {index < learningPath.length - 1 && (
              <div className="absolute left-6 top-16 w-0.5 h-16 bg-blue-200" />
            )}

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{phase.phase}</h4>
                    <Badge variant="outline" color="primary">
                      {phase.weeks}
                    </Badge>
                  </div>

                  <p className="text-gray-600 mb-3">{phase.focus}</p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Recommended Courses</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {phase.courses.map((course, idx) => (
                          <li key={idx}>• {course}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Milestones</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {phase.milestones.map((milestone, idx) => (
                          <li key={idx}>• {milestone}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // Render study plan tab
  const renderStudyPlan = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Weekly Study Schedule</h3>
        <p className="text-gray-600">
          Optimized study plan based on your learning patterns and goals
        </p>
      </div>

      <div className="grid gap-4">
        {studyPlan.map((day, index) => (
          <motion.div
            key={day.day}
            className="bg-white border border-gray-200 rounded-lg p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {day.day.charAt(0)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{day.day}</h4>
                  <p className="text-sm text-gray-600">{day.focus}</p>
                </div>
              </div>

              <Badge variant="outline" color="primary">
                {day.activities.length} activities
              </Badge>
            </div>

            <div className="space-y-2">
              {day.activities.map((activity, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                  <span className="text-gray-700">{activity}</span>
                </div>
              ))}
            </div>

            {day.resources && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex flex-wrap gap-1">
                  {day.resources.map((resource, idx) => (
                    <Badge key={idx} variant="outline" size="xs" color="info">
                      {resource}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );

  // Loading state
  if (isGenerating || isPersonalizing) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-8 ${className}`}>
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
          />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isPersonalizing ? 'Personalizing Your Learning' : 'Generating Suggestions'}
          </h3>
          <p className="text-gray-600">
            {isPersonalizing
              ? 'Analyzing your learning patterns and goals...'
              : 'AI is creating personalized study recommendations...'
            }
          </p>
        </div>
      </div>
    );
  }

  // Tab content
  const tabContent = [
    {
      id: 'recommendations',
      label: 'Recommendations',
      content: renderRecommendations()
    },
    {
      id: 'learning-path',
      label: 'Learning Path',
      content: renderLearningPath()
    },
    {
      id: 'study-plan',
      label: 'Study Plan',
      content: renderStudyPlan()
    }
  ];

  return (
    <div ref={ref} className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`} {...props}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-purple-600">school</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI Study Assistant</h2>
              <p className="text-sm text-gray-600">
                Personalized learning recommendations powered by AI
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="rounded" color="success">
              {studyStreak} day streak
            </Badge>
            <Button variant="outline" size="sm" onClick={generateSuggestions}>
              <span className="material-symbols-outlined text-sm mr-1">refresh</span>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="p-6">
        <Tabs
          tabs={tabContent}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="minimal"
        />
      </div>
    </div>
  );
});

StudySuggestionBox.propTypes = {
  student: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    academicInterests: PropTypes.arrayOf(PropTypes.string),
    careerGoals: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  currentCourses: PropTypes.arrayOf(PropTypes.object),
  completedCourses: PropTypes.arrayOf(PropTypes.object),
  studyGoals: PropTypes.arrayOf(PropTypes.object),
  learningStyle: PropTypes.oneOf(['visual', 'auditory', 'kinesthetic', 'reading']),
  studyStreak: PropTypes.number,
  weeklyGoal: PropTypes.number,
  studyHoursThisWeek: PropTypes.number,
  onSuggestionAccepted: PropTypes.func,
  onSuggestionRejected: PropTypes.func,
  onResourceAccessed: PropTypes.func,
  onProgressUpdated: PropTypes.func,
  isGenerating: PropTypes.bool,
  className: PropTypes.string
};

StudySuggestionBox.displayName = 'StudySuggestionBox';

export default StudySuggestionBox;