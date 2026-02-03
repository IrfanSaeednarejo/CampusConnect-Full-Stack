import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';

/**
 * Advanced Join Society Form Component - Handles society membership requests
 * Includes application form, requirements check, and approval workflow
 */
const JoinSocietyForm = React.forwardRef(({
  society,
  user,
  onJoin,
  onCancel,
  requirements = [],
  applicationQuestions = [],
  isLoading = false,
  className = '',
  ...props
}, ref) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(0);

  // Check if user meets requirements
  const checkRequirements = () => {
    const unmetRequirements = requirements.filter(req => {
      switch (req.type) {
        case 'minimum_year':
          return user.year < req.value;
        case 'gpa_minimum':
          return user.gpa < req.value;
        case 'department':
          return req.value && !req.value.includes(user.department);
        case 'membership_fee':
          return req.value > 0; // Will be handled separately
        default:
          return false;
      }
    });

    return {
      met: unmetRequirements.length === 0,
      unmet: unmetRequirements
    };
  };

  const requirementsCheck = checkRequirements();

  // Handle form input change
  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle answer change
  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Validate required fields
    if (!formData.motivation) {
      newErrors.motivation = 'Please explain why you want to join this society';
    }

    // Validate answers
    applicationQuestions.forEach(question => {
      if (question.required && !answers[question.id]) {
        newErrors[`answer_${question.id}`] = 'This question is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onJoin?.({
        societyId: society.id,
        userId: user.id,
        motivation: formData.motivation,
        answers: answers,
        additionalInfo: formData.additionalInfo
      });
      setShowForm(false);
    } catch (error) {
      console.error('Join request failed:', error);
    }
  };

  // Render requirements step
  const renderRequirementsStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Membership Requirements
        </h3>
        <p className="text-sm text-gray-600">
          Please review the requirements to join {society.name}
        </p>
      </div>

      <div className="space-y-3">
        {requirements.map((req, index) => {
          const isMet = !requirementsCheck.unmet.some(u => u.id === req.id);

          return (
            <div
              key={index}
              className={`p-3 rounded-lg border-2 ${
                isMet
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`material-symbols-outlined ${
                    isMet ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isMet ? 'check_circle' : 'cancel'}
                  </span>
                  <div>
                    <div className="font-medium text-gray-900">{req.title}</div>
                    <div className="text-sm text-gray-600">{req.description}</div>
                  </div>
                </div>
                {!isMet && (
                  <Badge variant="filled" color="danger" size="xs">
                    Not Met
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {requirementsCheck.met ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800 text-center">
            ✓ You meet all requirements! You can proceed with your application.
          </p>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800 text-center">
            You don't meet all requirements. Please review the unmet requirements above.
          </p>
        </div>
      )}

      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={() => setCurrentStep(1)}
          disabled={!requirementsCheck.met}
          className="flex-1"
        >
          Continue to Application
        </Button>
      </div>
    </div>
  );

  // Render application form step
  const renderApplicationStep = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Application Form
        </h3>
        <p className="text-sm text-gray-600">
          Tell us why you want to join {society.name}
        </p>
      </div>

      {/* Motivation */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Why do you want to join this society? <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.motivation || ''}
          onChange={(e) => handleInputChange('motivation', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.motivation ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Share your motivation for joining this society..."
        />
        {errors.motivation && (
          <p className="text-xs text-red-600 mt-1">{errors.motivation}</p>
        )}
      </div>

      {/* Application Questions */}
      {applicationQuestions.map((question, index) => (
        <div key={question.id}>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {question.question}
            {question.required && <span className="text-red-500">*</span>}
          </label>
          {question.type === 'text' && (
            <textarea
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors[`answer_${question.id}`] ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={question.placeholder}
            />
          )}
          {question.type === 'select' && (
            <select
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors[`answer_${question.id}`] ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select an option</option>
              {question.options.map((option, optIndex) => (
                <option key={optIndex} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
          {errors[`answer_${question.id}`] && (
            <p className="text-xs text-red-600 mt-1">
              {errors[`answer_${question.id}`]}
            </p>
          )}
        </div>
      ))}

      {/* Additional Info */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Additional Information (Optional)
        </label>
        <textarea
          value={formData.additionalInfo || ''}
          onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Any additional information you'd like to share..."
        />
      </div>

      {/* Membership Fee */}
      {requirements.find(r => r.type === 'membership_fee') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-blue-900">Membership Fee</div>
              <div className="text-sm text-blue-700">
                ${requirements.find(r => r.type === 'membership_fee').value}
              </div>
            </div>
            <Badge variant="filled" color="info">Required</Badge>
          </div>
        </div>
      )}

      <div className="flex space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(0)}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Submitting...' : 'Submit Application'}
        </Button>
      </div>
    </form>
  );

  return (
    <>
      <Button
        ref={ref}
        onClick={() => setShowForm(true)}
        className={className}
        {...props}
      >
        Join Society
      </Button>

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setCurrentStep(0);
          setFormData({});
          setAnswers({});
          setErrors({});
        }}
        title={`Join ${society.name}`}
        size="md"
      >
        <div className="p-6">
          {/* Society Info */}
          <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-gray-200">
            <Avatar
              src={society.logo}
              name={society.name}
              size="md"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{society.name}</h3>
              <p className="text-sm text-gray-600">{society.category}</p>
            </div>
          </div>

          {/* Steps */}
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="requirements"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {renderRequirementsStep()}
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="application"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {renderApplicationStep()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>
    </>
  );
});

JoinSocietyForm.propTypes = {
  society: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    logo: PropTypes.string,
    category: PropTypes.string
  }).isRequired,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    year: PropTypes.number,
    gpa: PropTypes.number,
    department: PropTypes.string
  }).isRequired,
  onJoin: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  requirements: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      type: PropTypes.string,
      title: PropTypes.string,
      description: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.array])
    })
  ),
  applicationQuestions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      question: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['text', 'select']),
      required: PropTypes.bool,
      placeholder: PropTypes.string,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string,
          label: PropTypes.string
        })
      )
    })
  ),
  isLoading: PropTypes.bool,
  className: PropTypes.string
};

JoinSocietyForm.displayName = 'JoinSocietyForm';

export default JoinSocietyForm;