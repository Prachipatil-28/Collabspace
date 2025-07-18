import React from "react";

const LangSwitch = ({ currentLanguage, onChange }) => {
  const languages = ["javascript", "python", "java", "typescript"];

  return (
    <select
      value={currentLanguage}
      onChange={(e) => onChange(e.target.value)}
      className="bg-gray-800 text-white p-1 rounded"
    >
      {languages.map((lang) => (
        <option key={lang} value={lang}>
          {lang.toUpperCase()}
        </option>
      ))}
    </select>
  );
};

export default LangSwitch;
