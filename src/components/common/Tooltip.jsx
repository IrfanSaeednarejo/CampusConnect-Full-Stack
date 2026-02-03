import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

/**
 * Advanced Tooltip Component with positioning, animations, and accessibility
 * Supports hover, click, and focus triggers with customizable content
 */
const Tooltip = React.forwardRef(
  (
    {
      children,
      content,
      placement = "top",
      trigger = "hover",
      delay = 300,
      hideDelay = 0,
      showArrow = true,
      interactive = false,
      disabled = false,
      className = "",
      tooltipClassName = "",
      ...props
    },
    ref,
  ) => {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const tooltipRef = useRef(null);
    const timeoutRef = useRef(null);
    const hideTimeoutRef = useRef(null);

    // Combined ref
    const combinedRef = ref || triggerRef;

    // Calculate tooltip position
    const calculatePosition = () => {
      if (!combinedRef.current || !tooltipRef.current) return;

      const triggerRect = combinedRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;

      let top = 0;
      let left = 0;

      switch (placement) {
        case "top":
          top = triggerRect.top + scrollY - tooltipRect.height - 8;
          left =
            triggerRect.left +
            scrollX +
            triggerRect.width / 2 -
            tooltipRect.width / 2;
          break;
        case "bottom":
          top = triggerRect.bottom + scrollY + 8;
          left =
            triggerRect.left +
            scrollX +
            triggerRect.width / 2 -
            tooltipRect.width / 2;
          break;
        case "left":
          top =
            triggerRect.top +
            scrollY +
            triggerRect.height / 2 -
            tooltipRect.height / 2;
          left = triggerRect.left + scrollX - tooltipRect.width - 8;
          break;
        case "right":
          top =
            triggerRect.top +
            scrollY +
            triggerRect.height / 2 -
            tooltipRect.height / 2;
          left = triggerRect.right + scrollX + 8;
          break;
        case "top-left":
          top = triggerRect.top + scrollY - tooltipRect.height - 8;
          left = triggerRect.left + scrollX;
          break;
        case "top-right":
          top = triggerRect.top + scrollY - tooltipRect.height - 8;
          left = triggerRect.right + scrollX - tooltipRect.width;
          break;
        case "bottom-left":
          top = triggerRect.bottom + scrollY + 8;
          left = triggerRect.left + scrollX;
          break;
        case "bottom-right":
          top = triggerRect.bottom + scrollY + 8;
          left = triggerRect.right + scrollX - tooltipRect.width;
          break;
      }

      // Ensure tooltip stays within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (left < 0) left = 8;
      if (left + tooltipRect.width > viewportWidth)
        left = viewportWidth - tooltipRect.width - 8;
      if (top < 0) top = 8;
      if (top + tooltipRect.height > viewportHeight)
        top = viewportHeight - tooltipRect.height - 8;

      setTooltipPosition({ top, left });
    };

    // Show tooltip
    const showTooltip = () => {
      if (disabled) return;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        // Calculate position after showing to get correct dimensions
        setTimeout(calculatePosition, 0);
      }, delay);
    };

    // Hide tooltip
    const hideTooltip = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, hideDelay);
    };

    // Handle click trigger
    const handleClick = () => {
      if (trigger === "click") {
        setIsVisible(!isVisible);
        if (isVisible) {
          setTimeout(calculatePosition, 0);
        }
      }
    };

    // Handle focus
    const handleFocus = () => {
      if (trigger === "focus") {
        showTooltip();
      }
    };

    // Handle blur
    const handleBlur = () => {
      if (trigger === "focus") {
        hideTooltip();
      }
    };

    // Handle mouse enter/leave for interactive tooltips
    const handleTooltipMouseEnter = () => {
      if (interactive && timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    const handleTooltipMouseLeave = () => {
      if (interactive) {
        hideTooltip();
      }
    };

    // Update position on scroll/resize
    useEffect(() => {
      if (!isVisible) return;

      const handleUpdate = () => calculatePosition();

      window.addEventListener("scroll", handleUpdate);
      window.addEventListener("resize", handleUpdate);

      return () => {
        window.removeEventListener("scroll", handleUpdate);
        window.removeEventListener("resize", handleUpdate);
      };
    }, [isVisible]);

    // Cleanup timeouts
    useEffect(() => {
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      };
    }, []);

    // Animation variants
    const tooltipVariants = {
      hidden: {
        opacity: 0,
        scale: 0.8,
        y: placement.startsWith("top")
          ? 5
          : placement.startsWith("bottom")
            ? -5
            : 0,
        x: placement.endsWith("left")
          ? 5
          : placement.endsWith("right")
            ? -5
            : 0,
      },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        x: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 25,
        },
      },
      exit: {
        opacity: 0,
        scale: 0.8,
        y: placement.startsWith("top")
          ? 5
          : placement.startsWith("bottom")
            ? -5
            : 0,
        x: placement.endsWith("left")
          ? 5
          : placement.endsWith("right")
            ? -5
            : 0,
        transition: { duration: 0.15 },
      },
    };

    // Render arrow
    const renderArrow = () => {
      if (!showArrow) return null;

      const arrowClasses = {
        top: "bottom-[-4px] left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900",
        bottom:
          "top-[-4px] left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900",
        left: "right-[-4px] top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900",
        right:
          "left-[-4px] top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900",
      };

      return (
        <div
          className={`absolute w-0 h-0 ${arrowClasses[placement.split("-")[0]]}`}
        />
      );
    };

    // If no content, just render children
    if (!content) return children;

    const tooltipContent = (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            className={`fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg max-w-xs wrap-break-word ${tooltipClassName}`}
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
            }}
            variants={tooltipVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
            role="tooltip"
          >
            {content}
            {renderArrow()}
          </motion.div>
        )}
      </AnimatePresence>
    );

    return (
      <>
        <div
          ref={combinedRef}
          className={`inline-block ${className}`}
          onMouseEnter={trigger === "hover" ? showTooltip : undefined}
          onMouseLeave={trigger === "hover" ? hideTooltip : undefined}
          onClick={handleClick}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        >
          {children}
        </div>

        {createPortal(tooltipContent, document.body)}
      </>
    );
  },
);

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  content: PropTypes.node,
  placement: PropTypes.oneOf([
    "top",
    "bottom",
    "left",
    "right",
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
  ]),
  trigger: PropTypes.oneOf(["hover", "click", "focus"]),
  delay: PropTypes.number,
  hideDelay: PropTypes.number,
  showArrow: PropTypes.bool,
  interactive: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  tooltipClassName: PropTypes.string,
};

Tooltip.displayName = "Tooltip";

export default Tooltip;
