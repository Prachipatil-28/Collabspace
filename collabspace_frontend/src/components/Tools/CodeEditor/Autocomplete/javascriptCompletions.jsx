export const javascriptCompletions = [
  {
    label: "console.log",
    kind: 1, // Method
    insertText: "console.log(${1:value});",
    detail: "Logs a value to the console",
  },
  {
    label: "function",
    kind: 14, // Snippet
    insertText: "function ${1:name}(${2:args}) {\n\t${0}\n}",
    detail: "Creates a new function",
  },
  {
    label: "forEach",
    kind: 1, // Method
    insertText: "${1:array}.forEach((${2:item}) => {\n\t${0}\n});",
    detail: "Iterates over an array",
  },
  {
    label: "async function",
    kind: 14, // Snippet
    insertText: "async function ${1:name}(${2:args}) {\n\t${0}\n}",
    detail: "Creates an async function",
  },
];