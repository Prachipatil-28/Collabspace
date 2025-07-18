// src/autocomplete/python.js
export const pythonCompletions = [
  {
    label: "def function",
    kind: 14, // Snippet
    insertText: "def ${1:function}(${2:args}):\n\t${0}",
    detail: "Defines a new function",
  },
  {
    label: "class",
    kind: 7, // Class
    insertText: "class ${1:ClassName}:\n\tdef __init__(self${2:, args}):\n\t\t${0}",
    detail: "Defines a new class with constructor",
  },
  {
    label: "for loop",
    kind: 14, // Snippet
    insertText: "for ${1:item} in ${2:iterable}:\n\t${0}",
    detail: "Basic for loop structure",
  },
  {
    label: "print",
    kind: 1, // Method
    insertText: "print(${1:value})",
    detail: "Prints a value to the console",
  },
];