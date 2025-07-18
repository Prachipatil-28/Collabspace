export const LANG_VERSIONS = {
    javascript: "18.15.0",
    typescript: "5.0.3",
    python: "3.10.0",
    java: "15.0.2",
  };


  
  export const CODE_TEMPLATES = {
    javascript: `
  function greet(name) {
    console.log("Hello, " + name + "!");
  }
  
  greet("Paul");
  `,
    typescript: `
  type Params = {
    name: string;
  };
  
  function greet(data: Params) {
    console.log("Hello, " + data.name + "!");
  }
  
  greet({ name: "Paul" });
  `,
    python: `
def greet(name):
    print("Hello, " + name + "!")
  
greet("Paul")
  `,

  java: `
   public void greet(String name){
        System.out.println("Hello, " + name + "!");
  }

  greet("Gana");
  `,
  };
  