export const CODE_TEMPLATES = {
    javascript: `
  function greet(name) {
    console.log("Hello, " + name + "!");
  }
  
  greet("Paul");
  `,
    python: `
  def greet(name):
      print("Hello, " + name + "!")
  
  greet("Paul")
  `,
    java: `
  public class Main {
    public static void main(String[] args) {
      System.out.println("Hello, World!");
    }
  }
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
  };