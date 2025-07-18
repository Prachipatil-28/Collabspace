export const javaCompletions = [
  {
    label: "public class",
    kind: 7, // Class
    insertText: "public class ${1:Main} {\n\tpublic static void main(String[] args) {\n\t\t${0}\n\t}\n}",
    detail: "Creates a new public class with main method",
  },
  {
    label: "System.out.println",
    kind: 1, // Method
    insertText: "System.out.println(${1:message});",
    detail: "Prints a message to the console",
  },
  {
    label: "for loop",
    kind: 14, // Snippet
    insertText: "for (int ${1:i} = 0; $1 < ${2:count}; $1++) {\n\t${0}\n}",
    detail: "Basic for loop structure",
  },
  {
    label: "if statement",
    kind: 14, // Snippet
    insertText: "if (${1:condition}) {\n\t${0}\n}",
    detail: "Basic if statement",
  },
];