import React from "react";
import PropTypes from "prop-types";

/**
 * LegalSection - For rendering a legal/terms section with number, title, content, and optional list
 */
const LegalSection = ({ number, title, content, list }) => (
  <div className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#161b22]/50 to-[#0d1117]/50 backdrop-blur-sm border border-[#30363d]/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
    <div className="flex items-start gap-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30 text-lg font-bold text-primary">
        {number}
      </div>
      <div className="flex-1">
        <h2 className="text-[#c9d1d9] text-xl md:text-2xl font-bold leading-tight tracking-[-0.015em] pb-3 mb-3 border-b border-primary/20">
          {title}
        </h2>
        <div className="text-[#c9d1d9] text-base md:text-lg font-normal leading-relaxed">
          {typeof content === "string" ? <p>{content}</p> : content}
        </div>
        {list && (
          <ul className="list-disc space-y-2 pl-6 md:pl-8 pt-4 text-[#c9d1d9] text-base md:text-lg leading-relaxed">
            {list.map((item, idx) => (
              <li
                key={idx}
                className="hover:text-primary transition-colors duration-300"
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>
);

LegalSection.propTypes = {
  number: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  list: PropTypes.arrayOf(PropTypes.string),
};

export default LegalSection;
