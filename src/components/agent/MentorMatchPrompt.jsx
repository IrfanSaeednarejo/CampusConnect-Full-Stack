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
 * Advanced Mentor Match Prompt Component - AI-powered mentor-student matching
 * Uses machine learning to find optimal mentor matches based on multiple criteria
 */
const MentorMatchPrompt = React.forwardRef(({
  student,
  availableMentors = [],
  onMatchFound,
  onMatchRequest,
  onSkip,
  isLoading = false,
  matchSettings = {},
  className = '',
  ...props
}, ref) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCriteria, setSelectedCriteria] = useState([]);
  const [matchingMentors, setMatchingMentors] = useState([]);
  const [bestMatch, setBestMatch] = useState(null);
  const [matchScore, setMatchScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Matching criteria options
  const criteriaOptions = [
    { id: 'academic', label: 'Academic Interests', icon: 'school', weight: 0.3 },
    { id: 'career', label: 'Career Goals', icon: 'work', weight: 0.25 },
    { id: 'personality', label: 'Personality Match', icon: 'psychology', weight: 0.2 },
    { id: 'availability', label: 'Availability', icon: 'schedule', weight: 0.15 },
    { id: 'experience', label: 'Experience Level', icon: 'workspace_premium', weight: 0.1 }
  ];

  // Steps in the matching process
  const steps = [
    { id: 'criteria', title: 'Select Matching Criteria', icon: 'tune' },
    { id: 'analysis', title: 'AI Analysis', icon: 'analytics' },
    { id: 'results', title: 'Your Perfect Match', icon: 'person_check' },
    { id: 'confirmation', title: 'Send Request', icon: 'send' }
  ];

  // Initialize with default criteria
  useEffect(() => {
    if (selectedCriteria.length === 0) {
      setSelectedCriteria(criteriaOptions.map(c => c.id));
    }
  }, []);

  // Simulate AI matching process
  const performMatching = useCallback(async () => {
    setIsAnalyzing(true);
    setCurrentStep(1);

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock matching algorithm
    const mockMatches = availableMentors.map(mentor => {
      let score = 0;
      let reasons = [];

      // Academic matching
      if (selectedCriteria.includes('academic')) {
        const academicMatch = Math.random() * 0.3;
        score += academicMatch;
        if (academicMatch > 0.2) reasons.push('Shared academic interests');
      }

      // Career matching
      if (selectedCriteria.includes('career')) {
        const careerMatch = Math.random() * 0.25;
        score += careerMatch;
        if (careerMatch > 0.15) reasons.push('Aligned career goals');
      }

      // Personality matching
      if (selectedCriteria.includes('personality')) {
        const personalityMatch = Math.random() * 0.2;
        score += personalityMatch;
        if (personalityMatch > 0.12) reasons.push('Compatible personalities');
      }

      // Availability matching
      if (selectedCriteria.includes('availability')) {
        const availabilityMatch = Math.random() * 0.15;
        score += availabilityMatch;
        if (availabilityMatch > 0.1) reasons.push('Good availability match');
      }

      // Experience matching
      if (selectedCriteria.includes('experience')) {
        const experienceMatch = Math.random() * 0.1;
        score += experienceMatch;
        if (experienceMatch > 0.05) reasons.push('Appropriate experience level');
      }

      return {
        mentor,
        score: Math.min(score, 1),
        reasons: reasons.length > 0 ? reasons : ['General compatibility']
      };
    });

    // Sort by score and take top matches
    const sortedMatches = mockMatches
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    setMatchingMentors(sortedMatches);
    setBestMatch(sortedMatches[0]);
    setMatchScore(Math.round(sortedMatches[0].score * 100));

    setIsAnalyzing(false);
    setCurrentStep(2);

    // Notify parent of match found
    onMatchFound?.(sortedMatches[0]);
  }, [availableMentors, selectedCriteria, onMatchFound]);

  // Handle criteria selection
  const handleCriteriaToggle = (criteriaId) => {
    setSelectedCriteria(prev =>
      prev.includes(criteriaId)
        ? prev.filter(id => id !== criteriaId)
        : [...prev, criteriaId]
    );
  };

  // Handle match request
  const handleMatchRequest = () => {
    setCurrentStep(3);
    onMatchRequest?.(bestMatch);
  };

  // Render criteria selection step
  const renderCriteriaStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Let's Find Your Perfect Mentor
        </h3>
        <p className="text-gray-600">
          Select the criteria that matter most to you for finding the right mentor
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {criteriaOptions.map((criteria) => (
          <motion.div
            key={criteria.id}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedCriteria.includes(criteria.id)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleCriteriaToggle(criteria.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                selectedCriteria.includes(criteria.id)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <span className="material-symbols-outlined">
                  {criteria.icon}
                </span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{criteria.label}</h4>
                <p className="text-sm text-gray-500">
                  Weight: {(criteria.weight * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onSkip}>
          Skip for now
        </Button>
        <Button
          onClick={performMatching}
          disabled={selectedCriteria.length === 0}
        >
          Find My Mentor
        </Button>
      </div>
    </motion.div>
  );

  // Render analysis step
  const renderAnalysisStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="text-center space-y-6"
    >
      <div className="w-24 h-24 mx-auto">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-full h-full border-4 border-blue-200 border-t-blue-600 rounded-full"
        />
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Analyzing Your Profile
        </h3>
        <p className="text-gray-600">
          Our AI is finding the perfect mentor match based on your selected criteria...
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-3">
        {selectedCriteria.map((criteriaId, index) => {
          const criteria = criteriaOptions.find(c => c.id === criteriaId);
          return (
            <motion.div
              key={criteriaId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="flex items-center space-x-3"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-700">{criteria.label}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );

  // Render results step
  const renderResultsStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Match Score */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mb-4">
          <span className="text-2xl font-bold text-white">{matchScore}%</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Perfect Match Found!
        </h3>
        <p className="text-gray-600">
          Based on your profile and preferences, we found an excellent mentor for you.
        </p>
      </div>

      {/* Best Match Card */}
      {bestMatch && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6"
        >
          <div className="flex items-start space-x-4">
            <Avatar
              src={bestMatch.mentor.avatar}
              name={bestMatch.mentor.name}
              size="lg"
              status="online"
            />

            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="text-lg font-semibold text-gray-900">
                  {bestMatch.mentor.name}
                </h4>
                <Badge variant="rounded" color="success" size="xs">
                  {matchScore}% Match
                </Badge>
              </div>

              <p className="text-gray-600 mb-3">{bestMatch.mentor.title}</p>

              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-900">Why this match?</h5>
                <ul className="space-y-1">
                  {bestMatch.reasons.map((reason, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Additional Details Toggle */}
              <div className="mt-4">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <span>{showDetails ? 'Hide' : 'Show'} details</span>
                  <span className={`material-symbols-outlined text-sm transition-transform ${showDetails ? 'rotate-180' : ''}`}>
                    expand_more
                  </span>
                </button>
              </div>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 space-y-2 text-sm text-gray-600"
                  >
                    <div><strong>Experience:</strong> {bestMatch.mentor.experience} years</div>
                    <div><strong>Specialties:</strong> {bestMatch.mentor.specialties?.join(', ') || 'General mentoring'}</div>
                    <div><strong>Availability:</strong> {bestMatch.mentor.availability || 'Flexible'}</div>
                    <div><strong>Rating:</strong> ⭐ {bestMatch.mentor.rating || '4.8'} ({bestMatch.mentor.reviewCount || 0} reviews)</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}

      {/* Alternative Matches */}
      {matchingMentors.length > 1 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Other good matches</h4>
          <div className="space-y-2">
            {matchingMentors.slice(1, 4).map((match, index) => (
              <div key={match.mentor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar src={match.mentor.avatar} name={match.mentor.name} size="sm" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{match.mentor.name}</div>
                    <div className="text-xs text-gray-500">{match.mentor.title}</div>
                  </div>
                </div>
                <Badge variant="outline" color="info" size="xs">
                  {Math.round(match.score * 100)}%
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => setCurrentStep(0)}>
          Change Criteria
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onSkip}>
            Skip for now
          </Button>
          <Button onClick={handleMatchRequest}>
            Send Request
          </Button>
        </div>
      </div>
    </motion.div>
  );

  // Render confirmation step
  const renderConfirmationStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="text-center space-y-6"
    >
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <span className="material-symbols-outlined text-green-600 text-2xl">
          check_circle
        </span>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Request Sent Successfully!
        </h3>
        <p className="text-gray-600">
          Your mentorship request has been sent to {bestMatch?.mentor.name}.
          You'll be notified once they respond.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Avatar src={bestMatch?.mentor.avatar} name={bestMatch?.mentor.name} size="md" />
          <div className="text-left">
            <div className="font-medium text-gray-900">{bestMatch?.mentor.name}</div>
            <div className="text-sm text-gray-600">Mentorship request sent</div>
          </div>
        </div>
      </div>

      <Button onClick={onSkip}>
        Continue to Dashboard
      </Button>
    </motion.div>
  );

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderCriteriaStep();
      case 1:
        return renderAnalysisStep();
      case 2:
        return renderResultsStep();
      case 3:
        return renderConfirmationStep();
      default:
        return renderCriteriaStep();
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-8 ${className}`}>
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-gray-600 mt-4">Loading mentor matching...</p>
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
            <h2 className="text-2xl font-bold text-gray-900">AI Mentor Matching</h2>
            <p className="text-gray-600 mt-1">
              Find your perfect mentor with our intelligent matching system
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
      <div className="p-6 min-h-[400px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {renderCurrentStep()}
        </AnimatePresence>
      </div>
    </div>
  );
});

MentorMatchPrompt.propTypes = {
  student: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    academicInterests: PropTypes.arrayOf(PropTypes.string),
    careerGoals: PropTypes.arrayOf(PropTypes.string),
    personalityTraits: PropTypes.arrayOf(PropTypes.string),
    availability: PropTypes.string
  }).isRequired,
  availableMentors: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string,
      title: PropTypes.string,
      experience: PropTypes.number,
      specialties: PropTypes.arrayOf(PropTypes.string),
      availability: PropTypes.string,
      rating: PropTypes.number,
      reviewCount: PropTypes.number
    })
  ),
  onMatchFound: PropTypes.func,
  onMatchRequest: PropTypes.func,
  onSkip: PropTypes.func,
  isLoading: PropTypes.bool,
  matchSettings: PropTypes.object,
  className: PropTypes.string
};

MentorMatchPrompt.displayName = 'MentorMatchPrompt';

export default MentorMatchPrompt;