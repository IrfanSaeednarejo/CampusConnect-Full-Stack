import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import IconButton from '../common/IconButton';
import ProgressBar from '../common/ProgressBar';
import Modal from '../common/Modal';

/**
 * Advanced Wellbeing Checkin Component - AI-powered mental health monitoring and support
 * Provides mood tracking, stress assessment, and personalized wellness recommendations
 */
const WellbeingCheckin = React.forwardRef(({
  user,
  checkinHistory = [],
  currentMood = null,
  stressLevel = null,
  sleepQuality = null,
  onCheckinComplete,
  onSupportRequested,
  onResourceAccessed,
  onEmergencyContact,
  isAnalyzing = false,
  className = '',
  ...props
}, ref) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check-in steps
  const steps = [
    { id: 'mood', title: 'How are you feeling?', icon: 'sentiment_satisfied' },
    { id: 'stress', title: 'Stress Level', icon: 'psychology' },
    { id: 'sleep', title: 'Sleep Quality', icon: 'bedtime' },
    { id: 'energy', title: 'Energy Level', icon: 'battery_full' },
    { id: 'social', title: 'Social Connection', icon: 'people' },
    { id: 'analysis', title: 'AI Analysis', icon: 'analytics' },
    { id: 'recommendations', title: 'Personalized Support', icon: 'self_improvement' }
  ];

  // Mood options
  const moodOptions = [
    { value: 'excellent', label: 'Excellent', emoji: '😊', color: 'success', score: 5 },
    { value: 'good', label: 'Good', emoji: '🙂', color: 'success', score: 4 },
    { value: 'okay', label: 'Okay', emoji: '😐', color: 'warning', score: 3 },
    { value: 'low', label: 'Low', emoji: '😕', color: 'warning', score: 2 },
    { value: 'poor', label: 'Poor', emoji: '😢', color: 'danger', score: 1 }
  ];

  // Stress levels
  const stressLevels = [
    { value: 'very_low', label: 'Very Low', score: 1 },
    { value: 'low', label: 'Low', score: 2 },
    { value: 'moderate', label: 'Moderate', score: 3 },
    { value: 'high', label: 'High', score: 4 },
    { value: 'very_high', label: 'Very High', score: 5 }
  ];

  // Sleep quality
  const sleepQualityOptions = [
    { value: 'excellent', label: 'Excellent (8+ hours)', score: 5 },
    { value: 'good', label: 'Good (7-8 hours)', score: 4 },
    { value: 'fair', label: 'Fair (6-7 hours)', score: 3 },
    { value: 'poor', label: 'Poor (5-6 hours)', score: 2 },
    { value: 'very_poor', label: 'Very Poor (<5 hours)', score: 1 }
  ];

  // Energy levels
  const energyLevels = [
    { value: 'very_high', label: 'Very High', emoji: '⚡', score: 5 },
    { value: 'high', label: 'High', emoji: '🔋', score: 4 },
    { value: 'moderate', label: 'Moderate', emoji: '🪫', score: 3 },
    { value: 'low', label: 'Low', emoji: '🪫', score: 2 },
    { value: 'very_low', label: 'Very Low', emoji: '🪫', score: 1 }
  ];

  // Social connection
  const socialOptions = [
    { value: 'very_connected', label: 'Very Connected', score: 5 },
    { value: 'connected', label: 'Connected', score: 4 },
    { value: 'somewhat_connected', label: 'Somewhat Connected', score: 3 },
    { value: 'isolated', label: 'Isolated', score: 2 },
    { value: 'very_isolated', label: 'Very Isolated', score: 1 }
  ];

  // Handle response selection
  const handleResponseSelect = (stepId, value) => {
    setResponses(prev => ({
      ...prev,
      [stepId]: value
    }));

    // Auto-advance to next step after a short delay
    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }, 500);
  };

  // Generate AI analysis and recommendations
  const generateAnalysis = useCallback(async () => {
    setIsSubmitting(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Calculate overall wellbeing score
    const scores = Object.values(responses);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const overallScore = Math.round(averageScore * 20); // Convert to percentage

    // Generate analysis based on responses
    const mockAnalysis = {
      overallScore,
      status: overallScore >= 80 ? 'excellent' : overallScore >= 60 ? 'good' : overallScore >= 40 ? 'concerning' : 'critical',
      summary: generateSummary(overallScore, responses),
      trends: generateTrends(checkinHistory),
      riskFactors: identifyRiskFactors(responses),
      strengths: identifyStrengths(responses)
    };

    // Generate personalized recommendations
    const mockRecommendations = generateRecommendations(overallScore, responses, checkinHistory);

    setAnalysis(mockAnalysis);
    setRecommendations(mockRecommendations);
    setIsSubmitting(false);

    setCurrentStep(6); // Move to recommendations step
  }, [responses, checkinHistory]);

  // Helper functions for analysis
  const generateSummary = (score, responses) => {
    if (score >= 80) {
      return "You're doing exceptionally well! Your responses indicate strong mental wellbeing and effective self-care practices.";
    } else if (score >= 60) {
      return "You're managing well overall, but there are a few areas that could benefit from additional attention.";
    } else if (score >= 40) {
      return "Your responses suggest some challenges that may benefit from additional support and self-care strategies.";
    } else {
      return "Your responses indicate significant challenges. Please consider reaching out for professional support.";
    }
  };

  const generateTrends = (history) => {
    if (history.length < 2) return [];

    const recent = history.slice(-3);
    const avgRecent = recent.reduce((sum, checkin) => sum + checkin.overallScore, 0) / recent.length;
    const avgPrevious = history.length > 3
      ? history.slice(-6, -3).reduce((sum, checkin) => sum + checkin.overallScore, 0) / 3
      : avgRecent;

    if (avgRecent > avgPrevious + 5) {
      return ["Improving trend in overall wellbeing"];
    } else if (avgRecent < avgPrevious - 5) {
      return ["Declining trend in overall wellbeing"];
    } else {
      return ["Stable wellbeing levels"];
    }
  };

  const identifyRiskFactors = (responses) => {
    const risks = [];

    if (responses.stress >= 4) risks.push("High stress levels detected");
    if (responses.sleep <= 2) risks.push("Poor sleep quality may impact wellbeing");
    if (responses.energy <= 2) risks.push("Low energy levels affecting daily functioning");
    if (responses.social <= 2) risks.push("Limited social connections");

    return risks;
  };

  const identifyStrengths = (responses) => {
    const strengths = [];

    if (responses.mood >= 4) strengths.push("Strong emotional resilience");
    if (responses.stress <= 2) strengths.push("Effective stress management");
    if (responses.sleep >= 4) strengths.push("Good sleep hygiene");
    if (responses.social >= 4) strengths.push("Strong social support network");

    return strengths;
  };

  const generateRecommendations = (score, responses, history) => {
    const recommendations = [];

    // Immediate actions based on current state
    if (responses.mood <= 2) {
      recommendations.push({
        type: 'immediate',
        title: 'Practice Deep Breathing',
        description: 'Take 5 minutes to practice the 4-7-8 breathing technique',
        action: 'breathing_exercise',
        priority: 'high'
      });
    }

    if (responses.stress >= 4) {
      recommendations.push({
        type: 'immediate',
        title: 'Stress Relief Activity',
        description: 'Try a 10-minute meditation or listen to calming music',
        action: 'meditation',
        priority: 'high'
      });
    }

    if (responses.sleep <= 2) {
      recommendations.push({
        type: 'lifestyle',
        title: 'Improve Sleep Routine',
        description: 'Establish a consistent bedtime routine and limit screen time before bed',
        action: 'sleep_hygiene',
        priority: 'medium'
      });
    }

    // Professional support recommendations
    if (score <= 40 || (responses.mood <= 2 && responses.stress >= 4)) {
      recommendations.push({
        type: 'professional',
        title: 'Consider Professional Support',
        description: 'Reach out to a counselor or mental health professional for additional support',
        action: 'professional_help',
        priority: 'urgent'
      });
    }

    // Long-term recommendations
    recommendations.push({
      type: 'lifestyle',
      title: 'Build Resilience',
      description: 'Practice daily gratitude and maintain social connections',
      action: 'resilience_building',
      priority: 'low'
    });

    return recommendations;
  };

  // Handle check-in completion
  const handleComplete = () => {
    const checkinData = {
      timestamp: new Date().toISOString(),
      responses,
      analysis,
      recommendations,
      overallScore: analysis.overallScore
    };

    onCheckinComplete?.(checkinData);
  };

  // Handle emergency contact
  const handleEmergencyContact = () => {
    setShowEmergencyModal(true);
  };

  // Auto-advance to analysis when all questions answered
  useEffect(() => {
    const requiredSteps = ['mood', 'stress', 'sleep', 'energy', 'social'];
    const allAnswered = requiredSteps.every(step => responses[step] !== undefined);

    if (allAnswered && currentStep < 5) {
      setCurrentStep(5);
      // Auto-generate analysis after a delay
      setTimeout(() => {
        generateAnalysis();
      }, 1000);
    }
  }, [responses, currentStep, generateAnalysis]);

  // Render mood selection step
  const renderMoodStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="text-center space-y-6"
    >
      <div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">How are you feeling today?</h3>
        <p className="text-gray-600">Select the option that best describes your current mood</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {moodOptions.map((mood) => (
          <motion.button
            key={mood.value}
            onClick={() => handleResponseSelect('mood', mood.score)}
            className={`p-6 rounded-lg border-2 transition-all ${
              responses.mood === mood.score
                ? `border-${mood.color}-500 bg-${mood.color}-50`
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-4xl mb-2">{mood.emoji}</div>
            <div className="font-medium text-gray-900">{mood.label}</div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  // Render stress level step
  const renderStressStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">How stressed do you feel?</h3>
        <p className="text-gray-600">Rate your current stress level from 1 (very low) to 5 (very high)</p>
      </div>

      <div className="max-w-md mx-auto">
        {stressLevels.map((level) => (
          <motion.button
            key={level.value}
            onClick={() => handleResponseSelect('stress', level.score)}
            className={`w-full p-4 mb-2 rounded-lg border-2 text-left transition-all ${
              responses.stress === level.score
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{level.label}</span>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < level.score ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  // Render sleep quality step
  const renderSleepStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">How was your sleep last night?</h3>
        <p className="text-gray-600">Quality and quantity of sleep significantly impact wellbeing</p>
      </div>

      <div className="max-w-lg mx-auto space-y-3">
        {sleepQualityOptions.map((option) => (
          <motion.button
            key={option.value}
            onClick={() => handleResponseSelect('sleep', option.score)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              responses.sleep === option.score
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{option.label}</span>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < option.score ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  // Render energy level step
  const renderEnergyStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">What's your energy level like?</h3>
        <p className="text-gray-600">How energetic and motivated do you feel right now?</p>
      </div>

      <div className="max-w-md mx-auto">
        {energyLevels.map((level) => (
          <motion.button
            key={level.value}
            onClick={() => handleResponseSelect('energy', level.score)}
            className={`w-full p-4 mb-2 rounded-lg border-2 transition-all ${
              responses.energy === level.score
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{level.emoji}</span>
                <span className="font-medium text-gray-900">{level.label}</span>
              </div>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < level.score ? 'bg-yellow-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  // Render social connection step
  const renderSocialStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">How connected do you feel?</h3>
        <p className="text-gray-600">Rate your sense of social connection and support</p>
      </div>

      <div className="max-w-md mx-auto">
        {socialOptions.map((option) => (
          <motion.button
            key={option.value}
            onClick={() => handleResponseSelect('social', option.score)}
            className={`w-full p-4 mb-2 rounded-lg border-2 text-left transition-all ${
              responses.social === option.score
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{option.label}</span>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < option.score ? 'bg-purple-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.button>
        ))}
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
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
        <motion.span
          className="material-symbols-outlined text-blue-600 text-2xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          psychology
        </motion.span>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Analyzing Your Responses
        </h3>
        <p className="text-gray-600">
          Our AI is processing your check-in data to provide personalized insights and support recommendations...
        </p>
      </div>

      {isSubmitting && (
        <div className="max-w-md mx-auto">
          <ProgressBar value={75} size="lg" color="primary" />
          <p className="text-sm text-gray-500 mt-2">Generating personalized recommendations...</p>
        </div>
      )}
    </motion.div>
  );

  // Render recommendations step
  const renderRecommendationsStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Overall Score */}
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
          analysis.status === 'excellent' ? 'bg-green-100' :
          analysis.status === 'good' ? 'bg-blue-100' :
          analysis.status === 'concerning' ? 'bg-yellow-100' : 'bg-red-100'
        }`}>
          <span className={`text-3xl font-bold ${
            analysis.status === 'excellent' ? 'text-green-600' :
            analysis.status === 'good' ? 'text-blue-600' :
            analysis.status === 'concerning' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {analysis.overallScore}
          </span>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Your Wellbeing Score
        </h3>

        <Badge
          variant="rounded"
          color={
            analysis.status === 'excellent' ? 'success' :
            analysis.status === 'good' ? 'primary' :
            analysis.status === 'concerning' ? 'warning' : 'danger'
          }
          size="lg"
        >
          {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
        </Badge>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-gray-700">{analysis.summary}</p>
      </div>

      {/* Risk Factors */}
      {analysis.riskFactors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-red-900 mb-2 flex items-center">
            <span className="material-symbols-outlined text-red-600 mr-2">warning</span>
            Areas of Concern
          </h4>
          <ul className="space-y-1">
            {analysis.riskFactors.map((risk, index) => (
              <li key={index} className="text-sm text-red-800 flex items-start">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-900 mb-2 flex items-center">
            <span className="material-symbols-outlined text-green-600 mr-2">check_circle</span>
            Your Strengths
          </h4>
          <ul className="space-y-1">
            {analysis.strengths.map((strength, index) => (
              <li key={index} className="text-sm text-green-800 flex items-start">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Personalized Recommendations</h4>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <motion.div
              key={index}
              className={`border rounded-lg p-4 ${
                rec.priority === 'urgent' ? 'border-red-300 bg-red-50' :
                rec.priority === 'high' ? 'border-orange-300 bg-orange-50' :
                rec.priority === 'medium' ? 'border-blue-300 bg-blue-50' :
                'border-green-300 bg-green-50'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h5 className="font-medium text-gray-900">{rec.title}</h5>
                    <Badge
                      variant="outline"
                      size="xs"
                      color={
                        rec.priority === 'urgent' ? 'danger' :
                        rec.priority === 'high' ? 'warning' :
                        rec.priority === 'medium' ? 'primary' : 'success'
                      }
                    >
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{rec.description}</p>

                  {rec.type === 'professional' && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSupportRequested?.(rec)}
                      >
                        Get Support
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onResourceAccessed?.(rec)}
                      >
                        Learn More
                      </Button>
                    </div>
                  )}
                </div>

                <div className={`w-8 h-8 rounded-full flex items-center justify-center ml-4 ${
                  rec.type === 'immediate' ? 'bg-blue-100' :
                  rec.type === 'lifestyle' ? 'bg-green-100' :
                  rec.type === 'professional' ? 'bg-red-100' : 'bg-purple-100'
                }`}>
                  <span className={`material-symbols-outlined text-sm ${
                    rec.type === 'immediate' ? 'text-blue-600' :
                    rec.type === 'lifestyle' ? 'text-green-600' :
                    rec.type === 'professional' ? 'text-red-600' : 'text-purple-600'
                  }`}>
                    {rec.action === 'breathing_exercise' ? 'air' :
                     rec.action === 'meditation' ? 'self_improvement' :
                     rec.action === 'sleep_hygiene' ? 'bedtime' :
                     rec.action === 'professional_help' ? 'support' : 'lightbulb'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <Button variant="ghost" onClick={handleEmergencyContact}>
          <span className="material-symbols-outlined text-red-600 mr-1">emergency</span>
          Emergency Support
        </Button>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setCurrentStep(0)}>
            Retake Check-in
          </Button>
          <Button onClick={handleComplete}>
            Complete Check-in
          </Button>
        </div>
      </div>
    </motion.div>
  );

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderMoodStep();
      case 1:
        return renderStressStep();
      case 2:
        return renderSleepStep();
      case 3:
        return renderEnergyStep();
      case 4:
        return renderSocialStep();
      case 5:
        return renderAnalysisStep();
      case 6:
        return renderRecommendationsStep();
      default:
        return renderMoodStep();
    }
  };

  return (
    <>
      <div ref={ref} className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`} {...props}>
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600">favorite</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Daily Wellbeing Check-in</h2>
                <p className="text-sm text-gray-600">
                  Take a moment to check in with yourself - your wellbeing matters
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Progress indicator */}
              <div className="flex items-center space-x-1">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Close button */}
              <IconButton
                icon="close"
                size="sm"
                className="text-gray-400 hover:text-gray-600"
              />
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

      {/* Emergency Contact Modal */}
      <Modal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        title="Emergency Support"
        size="sm"
      >
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-red-600 text-xl">emergency</span>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Immediate Help?</h3>
            <p className="text-gray-600 mb-4">
              If you're experiencing a mental health crisis or need immediate support,
              please reach out to these resources:
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="material-symbols-outlined text-red-600">call</span>
                <div className="text-left">
                  <div className="font-medium text-red-900">Emergency Hotline</div>
                  <div className="text-sm text-red-700">24/7 Crisis Support</div>
                </div>
              </div>
              <Button variant="danger" size="sm">
                Call Now
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="material-symbols-outlined text-blue-600">chat</span>
                <div className="text-left">
                  <div className="font-medium text-blue-900">Crisis Text Line</div>
                  <div className="text-sm text-blue-700">Text HOME to 741741</div>
                </div>
              </div>
              <Button variant="primary" size="sm">
                Text Now
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setShowEmergencyModal(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
});

WellbeingCheckin.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    avatar: PropTypes.string
  }).isRequired,
  checkinHistory: PropTypes.arrayOf(
    PropTypes.shape({
      timestamp: PropTypes.string,
      overallScore: PropTypes.number,
      responses: PropTypes.object
    })
  ),
  currentMood: PropTypes.number,
  stressLevel: PropTypes.number,
  sleepQuality: PropTypes.number,
  onCheckinComplete: PropTypes.func,
  onSupportRequested: PropTypes.func,
  onResourceAccessed: PropTypes.func,
  onEmergencyContact: PropTypes.func,
  isAnalyzing: PropTypes.bool,
  className: PropTypes.string
};

WellbeingCheckin.displayName = 'WellbeingCheckin';

export default WellbeingCheckin;