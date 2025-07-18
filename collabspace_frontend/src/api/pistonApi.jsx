import { LANG_VERSIONS } from "../components/Tools/CodeEditor/utils/Constant";
const API_URL = "https://emkc.org/api/v2/piston/execute";
export const executeCode = async (language, sourceCode) => {
  const data = {
    language: language,
    version: LANG_VERSIONS[language],
    files: [
      {
        content: sourceCode,
      },
    ],
  };
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await response.json();
};