import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import IconButton from '../common/IconButton';
import Spinner from '../common/Spinner';
import ProgressBar from '../common/ProgressBar';

/**
 * Advanced Feedback Prompt Component - AI-powered feedback generation for mentoring
 * Generates personalized, actionable feedback based on session analysis
 */
const FeedbackPrompt = React.forwardRef(({
  session,
  mentee,
  mentor,
  sessionTranscript = [],
  onFeedbackGenerated,
  onFeedbackAccepted,
  onFeedbackEdited,
  onFeedbackRejected,
  isGenerating = false,
  className = '',
  ...props
}, ref) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedFeedback, setGeneratedFeedback] = useState(null);
  const [editedFeedback, setEditedFeedback] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Feedback types and categories
  const feedbackCategories = [
    { id: 'strengths', label: 'Strengths', icon: 'thumb_up', color: 'success' },
    { id: 'improvements', label: 'Areas for Improvement', icon: 'trending_up', color: 'warning' },
    { id: 'goals', label: 'Goal Setting', icon: 'flag', color: 'primary' },
    { id: 'resources', label: 'Recommended Resources', icon: 'library_books', color: 'info' },
    { id: 'action_items', label: 'Action Items', icon: 'checklist', color: 'secondary' }
  ];

  // Steps in feedback generation
  const steps = [
    { id: 'analysis', title: 'Analyzing Session', icon: 'analytics' },
    { id: 'generation', title: 'Generating Feedback', icon: 'psychology' },
    { id: 'review', title: 'Review & Edit', icon: 'edit' },
    { id: 'finalize', title: 'Finalize Feedback', icon: 'check_circle' }
  ];

  // Simulate AI analysis and feedback generation
  const generateFeedback = useCallback(async () => {
    setCurrentStep(0);
    setAnalysisProgress(0);

    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock AI-generated feedback
    const mockFeedback = {
      id: `feedback-${Date.now()}`,
      sessionId: session.id,
      menteeId: mentee.id,
      mentorId: mentor.id,
      generatedAt: new Date().toISOString(),
      categories: {
        strengths: [
          'Demonstrated strong problem-solving skills',
          'Showed excellent communication abilities',
          'Maintained positive attitude throughout the session',
          'Asked insightful questions about career development'
        ],
        improvements: [
          'Could benefit from more structured goal setting',
          'Consider improving time management techniques',
          'Practice more assertive communication in professional settings'
        ],
        goals: [
          'Complete at least 2 online courses in chosen field within 3 months',
          'Network with 5 professionals in target industry by end of quarter',
          'Develop a personal brand through LinkedIn and professional blog',
          'Improve technical skills through hands-on projects'
        ],
        resources: [
          'Recommended: "Cracking the Code Interview" by Gayle Laakmann McDowell',
          'Online course: "Career Development Masterclass" on Udemy',
          'Mentorship program: Local industry networking events',
          'Skill development: Codecademy or freeCodeCamp for technical skills'
        ],
        action_items: [
          'Schedule weekly check-ins to track progress',
          'Create a professional development plan with specific milestones',
          'Join at least one professional organization or online community',
          'Practice elevator pitch and networking conversations',
          'Set up informational interviews with professionals in target field'
        ]
      },
      overall_rating: 4.2,
      key_insights: [
        'Mentee shows strong potential and motivation for career growth',
        'Communication skills are developing well but need refinement',
        'Technical foundation is solid; focus on application and projects',
        'Goal orientation needs more structure and specificity'
      ],
      next_session_focus: 'Develop a comprehensive career development plan with specific, measurable goals',
      ai_confidence_score: 0.87
    };

    setGeneratedFeedback(mockFeedback);
    setEditedFeedback(JSON.stringify(mockFeedback, null, 2));
    setCurrentStep(1);

    // Start generation step
    setTimeout(() => setCurrentStep(2), 1000);

    onFeedbackGenerated?.(mockFeedback);
  }, [session, mentee, mentor, onFeedbackGenerated]);

  // Handle feedback acceptance
  const handleFeedbackAccept = () => {
    setCurrentStep(3);
    onFeedbackAccepted?.(generatedFeedback);
  };

  // Handle feedback editing
  const handleFeedbackEdit = () => {
    setIsEditing(true);
  };

  const handleFeedbackSave = () => {
    try {
      const parsedFeedback = JSON.parse(editedFeedback);
      setGeneratedFeedback(parsedFeedback);
      setIsEditing(false);
      onFeedbackEdited?.(parsedFeedback);
    } catch (error) {
      alert('Invalid JSON format. Please check your edits.');
    }
  };

  // Handle rating
  const handleRating = (rating) => {
    setFeedbackRating(rating);
  };

  // Render analysis step
  const renderAnalysisStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="text-center space-y-6"
    >
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
        <motion.span
          className="material-symbols-outlined text-blue-600 text-3xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          psychology
        </motion.span>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Analyzing Session Data
        </h3>
        <p className="text-gray-600 mb-4">
          Our AI is processing the session transcript and generating personalized feedback...
        </p>

        <div className="max-w-md mx-auto">
          <ProgressBar value={analysisProgress} size="lg" color="primary" />
          <p className="text-sm text-gray-500 mt-2">
            {analysisProgress < 30 && 'Reading session transcript...'}
            {analysisProgress >= 30 && analysisProgress < 60 && 'Identifying key discussion points...'}
            {analysisProgress >= 60 && analysisProgress < 90 && 'Analyzing communication patterns...'}
            {analysisProgress >= 90 && 'Generating personalized feedback...'}
          </p>
        </div>
      </div>
    </motion.div>
  );

  // Render feedback review step
  const renderReviewStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
          <span className="material-symbols-outlined text-green-600">check_circle</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          AI Feedback Generated
        </h3>
        <p className="text-gray-600">
          Review and customize the AI-generated feedback before sharing with your mentee
        </p>
      </div>

      {/* Session Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar src={mentee.avatar} name={mentee.name} size="sm" />
            <div>
              <div className="font-medium text-gray-900">{mentee.name}</div>
              <div className="text-sm text-gray-500">Mentee</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Session #{session.id}</div>
            <div className="text-sm text-gray-500">{session.duration} minutes</div>
          </div>
        </div>
      </div>

      {/* Feedback Content */}
      {generatedFeedback && (
        <div className="space-y-4">
          {/* AI Confidence Score */}
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <span className="material-symbols-outlined text-blue-600">verified</span>
              <span className="text-sm font-medium text-blue-900">AI Confidence Score</span>
            </div>
            <Badge variant="rounded" color="primary">
              {(generatedFeedback.ai_confidence_score * 100).toFixed(0)}%
            </Badge>
          </div>

          {/* Feedback Categories */}
          {Object.entries(generatedFeedback.categories).map(([categoryId, items]) => {
            const category = feedbackCategories.find(c => c.id === categoryId);
            if (!category) return null;

            return (
              <div key={categoryId} className="border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3 p-4 border-b border-gray-200">
                  <div className={`w-8 h-8 bg-${category.color}-100 rounded-lg flex items-center justify-center`}>
                    <span className={`material-symbols-outlined text-${category.color}-600 text-sm`}>
                      {category.icon}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900">{category.label}</h4>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    {items.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}

          {/* Key Insights */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2 flex items-center space-x-2">
              <span className="material-symbols-outlined">lightbulb</span>
              <span>Key Insights</span>
            </h4>
            <ul className="space-y-1">
              {generatedFeedback.key_insights.map((insight, index) => (
                <li key={index} className="text-sm text-yellow-800 flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Next Session Focus */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2 flex items-center space-x-2">
              <span className="material-symbols-outlined">schedule</span>
              <span>Recommended Focus for Next Session</span>
            </h4>
            <p className="text-sm text-green-800">{generatedFeedback.next_session_focus}</p>
          </div>

          {/* Raw JSON Editor */}
          <AnimatePresence>
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border border-gray-200 rounded-lg"
              >
                <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Edit Raw JSON</span>
                  <Button variant="outline" size="sm" onClick={handleFeedbackSave}>
                    Save Changes
                  </Button>
                </div>
                <div className="p-3">
                  <textarea
                    value={editedFeedback}
                    onChange={(e) => setEditedFeedback(e.target.value)}
                    className="w-full h-48 font-mono text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Edit feedback JSON..."
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Rating */}
      <div className="border-t border-gray-200 pt-4">
        <div className="text-center">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Rate this AI feedback</h4>
          <div className="flex justify-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                className={`text-2xl ${star <= feedbackRating ? 'text-yellow-400' : 'text-gray-300'}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <Button variant="ghost" onClick={() => setCurrentStep(0)}>
          Regenerate
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleFeedbackEdit}>
            {isEditing ? 'Cancel Edit' : 'Edit Feedback'}
          </Button>
          <Button variant="outline" onClick={() => onFeedbackRejected?.(generatedFeedback)}>
            Reject
          </Button>
          <Button onClick={handleFeedbackAccept}>
            Accept & Send
          </Button>
        </div>
      </div>
    </motion.div>
  );

  // Render finalization step
  const renderFinalizationStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="text-center space-y-6"
    >
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <span className="material-symbols-outlined text-green-600 text-3xl">
          send
        </span>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Feedback Sent Successfully!
        </h3>
        <p className="text-gray-600">
          Your personalized feedback has been shared with {mentee.name}.
          They'll receive a notification and can review it in their dashboard.
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Avatar src={mentee.avatar} name={mentee.name} size="md" />
          <div className="text-left flex-1">
            <div className="font-medium text-green-900">Feedback delivered to {mentee.name}</div>
            <div className="text-sm text-green-700">Personalized AI-generated insights and recommendations</div>
          </div>
          <Badge variant="rounded" color="success">
            Sent
          </Badge>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <Button variant="outline">
          Schedule Follow-up
        </Button>
        <Button>
          View Session History
        </Button>
      </div>
    </motion.div>
  );

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderAnalysisStep();
      case 1:
        return renderAnalysisStep(); // Still analyzing
      case 2:
        return renderReviewStep();
      case 3:
        return renderFinalizationStep();
      default:
        return renderAnalysisStep();
    }
  };

  // Auto-start analysis when component mounts
  useEffect(() => {
    if (!generatedFeedback && !isGenerating) {
      generateFeedback();
    }
  }, [generateFeedback, generatedFeedback, isGenerating]);

  if (isGenerating && !generatedFeedback) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-8 ${className}`}>
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-gray-600 mt-4">Generating AI feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`} {...props}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Feedback Generator</h2>
            <p className="text-gray-600 mt-1">
              Generate personalized, actionable feedback for your mentee
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? 'mr-4' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index < currentStep ? (
                    <span className="material-symbols-outlined text-xs">check</span>
                  ) : (
                    <span className="material-symbols-outlined text-xs">{step.icon}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    index < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 min-h-[500px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {renderCurrentStep()}
        </AnimatePresence>
      </div>
    </div>
  );
});

FeedbackPrompt.propTypes = {
  session: PropTypes.shape({
    id: PropTypes.string.isRequired,
    duration: PropTypes.number,
    topic: PropTypes.string
  }).isRequired,
  mentee: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string
  }).isRequired,
  mentor: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string
  }).isRequired,
  sessionTranscript: PropTypes.arrayOf(
    PropTypes.shape({
      speaker: PropTypes.string,
      message: PropTypes.string,
      timestamp: PropTypes.string
    })
  ),
  onFeedbackGenerated: PropTypes.func,
  onFeedbackAccepted: PropTypes.func,
  onFeedbackEdited: PropTypes.func,
  onFeedbackRejected: PropTypes.func,
  isGenerating: PropTypes.bool,
  className: PropTypes.string
};

FeedbackPrompt.displayName = 'FeedbackPrompt';

export default FeedbackPrompt;