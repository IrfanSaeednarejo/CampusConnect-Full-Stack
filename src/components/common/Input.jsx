import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Advanced Input Component with validation, icons, masking, and animations
 * Supports multiple input types, validation states, and accessibility features
 */
const Input = React.forwardRef(
  (
    {
      type = "text",
      placeholder = "",
      value = "",
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      onKeyDown,
      name,
      id,
      label,
      helperText,
      error,
      success,
      disabled = false,
      required = false,
      readOnly = false,
      autoComplete,
      autoFocus = false,
      maxLength,
      minLength,
      pattern,
      icon,
      iconPosition = "left",
      clearable = false,
      loading = false,
      size = "md",
      variant = "default",
      className = "",
      containerClassName = "",
      mask,
      maskChar = "_",
      transform,
      validate,
      showCount = false,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(
      value || defaultValue || ""
    );
    const [maskedValue, setMaskedValue] = useState("");
    const inputRef = useRef(null);
    const combinedRef = ref || inputRef;

    // Handle controlled vs uncontrolled
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    // Validation state
    const [validationError, setValidationError] = useState("");
    const [isValid, setIsValid] = useState(false);

    // Base styles
    const baseStyles =
      "w-full bg-white border transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 read-only:bg-gray-50 read-only:cursor-default";

    // Size styles
    const sizes = {
      xs: "px-2 py-1 text-xs",
      sm: "px-3 py-1.5 text-sm",
      md: "px-3 py-2 text-base",
      lg: "px-4 py-3 text-lg",
      xl: "px-4 py-4 text-xl",
    };

    // Variant styles
    const variants = {
      default:
        "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
      filled:
        "border-transparent bg-gray-100 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
      outlined:
        "border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
      minimal:
        "border-b-2 border-gray-300 bg-transparent focus:border-blue-500 rounded-none px-0",
    };

    // State styles
    const stateStyles = {
      error: "border-red-500 focus:border-red-500 focus:ring-red-500/20",
      success:
        "border-green-500 focus:border-green-500 focus:ring-green-500/20",
    };

    // Apply input mask
    const applyMask = (inputValue) => {
      if (!mask) return inputValue;

      let result = "";
      let inputIndex = 0;

      for (let i = 0; i < mask.length && inputIndex < inputValue.length; i++) {
        const maskChar = mask[i];
        const inputChar = inputValue[inputIndex];

        if (maskChar === "9") {
          // Digit
          if (/\d/.test(inputChar)) {
            result += inputChar;
            inputIndex++;
          }
        } else if (maskChar === "A") {
          // Letter
          if (/[a-zA-Z]/.test(inputChar)) {
            result += inputChar;
            inputIndex++;
          }
        } else if (maskChar === "*") {
          // Alphanumeric
          if (/[a-zA-Z0-9]/.test(inputChar)) {
            result += inputChar;
            inputIndex++;
          }
        } else {
          result += maskChar;
          if (inputChar === maskChar) {
            inputIndex++;
          }
        }
      }

      return result;
    };

    // Transform input value
    const applyTransform = (inputValue) => {
      if (!transform) return inputValue;

      switch (transform) {
        case "uppercase":
          return inputValue.toUpperCase();
        case "lowercase":
          return inputValue.toLowerCase();
        case "capitalize":
          return (
            inputValue.charAt(0).toUpperCase() +
            inputValue.slice(1).toLowerCase()
          );
        default:
          return transform(inputValue);
      }
    };

    // Custom validation
    const runValidation = (inputValue) => {
      if (!validate) return { isValid: true, error: "" };

      if (typeof validate === "function") {
        const result = validate(inputValue);
        return typeof result === "string"
          ? { isValid: false, error: result }
          : { isValid: result, error: "" };
      }

      return { isValid: true, error: "" };
    };

    // Handle input change
    const handleChange = (e) => {
      let newValue = e.target.value;

      // Apply mask
      if (mask) {
        newValue = applyMask(newValue);
      }

      // Apply transform
      newValue = applyTransform(newValue);

      // Update internal state
      if (!isControlled) {
        setInternalValue(newValue);
      }

      // Run validation
      const validation = runValidation(newValue);
      setValidationError(validation.error);
      setIsValid(validation.isValid);

      // Call onChange
      onChange?.(e, {
        value: newValue,
        isValid: validation.isValid,
        error: validation.error,
      });
    };

    // Handle focus
    const handleFocus = (e) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    // Handle blur
    const handleBlur = (e) => {
      setIsFocused(false);
      const validation = runValidation(currentValue);
      setValidationError(validation.error);
      setIsValid(validation.isValid);
      onBlur?.(e, {
        value: currentValue,
        isValid: validation.isValid,
        error: validation.error,
      });
    };

    // Clear input
    const handleClear = () => {
      const newValue = "";
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(
        { target: { value: newValue, name } },
        { value: newValue, isValid: true, error: "" }
      );
      setValidationError("");
      setIsValid(false);
      combinedRef.current?.focus();
    };

    // Combine classes
    const inputClasses = [
      baseStyles,
      sizes[size],
      variants[variant],
      error || validationError ? stateStyles.error : "",
      success && !error && !validationError ? stateStyles.success : "",
      icon ? (iconPosition === "left" ? "pl-10" : "pr-10") : "",
      clearable && currentValue ? "pr-10" : "",
      loading ? "pr-10" : "",
      showCount ? "pr-16" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const containerClasses = ["relative", containerClassName]
      .filter(Boolean)
      .join(" ");

    // Render icon
    const renderIcon = () => {
      if (!icon) return null;

      const iconElement = React.isValidElement(icon) ? (
        icon
      ) : (
        <span className="material-symbols-outlined text-gray-400">{icon}</span>
      );

      return (
        <div
          className={`absolute inset-y-0 flex items-center pointer-events-none ${
            iconPosition === "left" ? "left-0 pl-3" : "right-0 pr-3"
          }`}
        >
          {React.cloneElement(iconElement, {
            className: `${iconElement.props.className || ""} text-lg`,
          })}
        </div>
      );
    };

    // Render clear button
    const renderClearButton = () => {
      if (!clearable || !currentValue || disabled || readOnly) return null;

      return (
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
          onClick={handleClear}
          tabIndex={-1}
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      );
    };

    // Render loading spinner
    const renderLoadingSpinner = () => {
      if (!loading) return null;

      return (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <motion.div
            className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      );
    };

    // Render character count
    const renderCharacterCount = () => {
      if (!showCount || !maxLength) return null;

      const count = currentValue?.length || 0;
      const isOverLimit = count > maxLength;

      return (
        <div
          className={`absolute inset-y-0 right-0 flex items-center pr-3 text-xs ${
            isOverLimit ? "text-red-500" : "text-gray-400"
          }`}
        >
          {count}/{maxLength}
        </div>
      );
    };

    return (
      <div className={containerClasses}>
        {/* Label */}
        <AnimatePresence>
          {label && (
            <motion.label
              htmlFor={id || name}
              className={`block text-sm font-medium mb-1 ${
                error || validationError
                  ? "text-red-600"
                  : success
                  ? "text-green-600"
                  : "text-gray-700"
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </motion.label>
          )}
        </AnimatePresence>

        {/* Input Container */}
        <div className="relative">
          {renderIcon()}

          <motion.input
            ref={combinedRef}
            type={type}
            id={id || name}
            name={name}
            value={currentValue}
            placeholder={placeholder}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={onKeyDown}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            maxLength={maxLength}
            minLength={minLength}
            pattern={pattern}
            className={inputClasses}
            {...props}
          />

          {renderClearButton()}
          {renderLoadingSpinner()}
          {renderCharacterCount()}
        </div>

        {/* Helper Text / Error Message */}
        <AnimatePresence>
          {(helperText || error || validationError) && (
            <motion.div
              className={`mt-1 text-sm ${
                error || validationError ? "text-red-600" : "text-gray-500"
              }`}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              {error || validationError || helperText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  onKeyDown: PropTypes.func,
  name: PropTypes.string,
  id: PropTypes.string,
  label: PropTypes.string,
  helperText: PropTypes.string,
  error: PropTypes.string,
  success: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  readOnly: PropTypes.bool,
  autoComplete: PropTypes.string,
  autoFocus: PropTypes.bool,
  maxLength: PropTypes.number,
  minLength: PropTypes.number,
  pattern: PropTypes.string,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  iconPosition: PropTypes.oneOf(["left", "right"]),
  clearable: PropTypes.bool,
  loading: PropTypes.bool,
  size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  variant: PropTypes.oneOf(["default", "filled", "outlined", "minimal"]),
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  mask: PropTypes.string,
  maskChar: PropTypes.string,
  transform: PropTypes.oneOfType([
    PropTypes.oneOf(["uppercase", "lowercase", "capitalize"]),
    PropTypes.func,
  ]),
  validate: PropTypes.func,
  showCount: PropTypes.bool,
};

Input.displayName = "Input";

export default Input;
