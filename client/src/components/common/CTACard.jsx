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
}) {
  return (
    <Card className={`mt-12 text-center ${className}`}>
      <h2 className="text-[#e6edf3] text-2xl font-bold mb-3">
        {title}
      </h2>
      <p className="text-[#8b949e] text-sm mb-6">
        {description}
      </p>
      <div className="flex justify-center">
        <Button variant={buttonVariant} onClick={onButtonClick}>
          {buttonText}
        </Button>
      </div>
    </Card>
  );
}
