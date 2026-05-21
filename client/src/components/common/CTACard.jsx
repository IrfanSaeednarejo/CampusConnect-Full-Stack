import Card from "./Card";
import Button from "./Button";

/**
 * CTACard Component - Reusable Call-to-Action Card
 * 
 * Used for promoting actions like "Create Event", "Register as Mentor", etc.
 * Provides consistent styling and layout for CTA sections across pages
 * 
 * @param {string} title - Main heading text
 * @param {string} description - Subtitle/description text
 * @param {string} buttonText - Button label
 * @param {function} onButtonClick - Click handler for button
 * @param {string} buttonVariant - Button style variant (default: "primary")
 * @param {string} className - Additional CSS classes
 */
export default function CTACard({
  title,
  description,
  buttonText,
  onButtonClick,
  buttonVariant = "primary",
  className = "",
  isDark = true,
}) {
  return (
    <Card isDark={isDark} className={`mt-12 text-center ${className}`}>
      <h2
        className={`mb-3 text-2xl font-bold transition-colors duration-300 ${
          isDark ? "text-[#e6edf3]" : "text-[#162033]"
        }`}
      >
        {title}
      </h2>
      <p
        className={`mb-6 text-sm transition-colors duration-300 ${
          isDark ? "text-[#8b949e]" : "text-[#526277]"
        }`}
      >
        {description}
      </p>
      <div className="flex justify-center">
        <Button
          variant={buttonVariant}
          onClick={onButtonClick}
          className={
            !isDark && buttonVariant === "primary"
              ? "bg-[#1D4ED8] text-white hover:bg-[#1E40AF] shadow-[0_10px_24px_rgba(29,78,216,0.18)]"
              : ""
          }
        >
          {buttonText}
        </Button>
      </div>
    </Card>
  );
}
