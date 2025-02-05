import React, { useState } from "react";
import CodeEditor from "./components/CodeEditor";
import "./App.scss"

const App: React.FC = () => {
  const [code, setCode] = useState("# Write your Python code here\nprint('Hello, World!')");
  const [output, setOutput] = useState<string | null>(null);
  const [userInput, setUserInput] = useState<string | null>("");

  const handleRun = async () => {
    console.log("Code to run:", code);
    console.log("User input:", userInput);
    setOutput(null);

    try {
      const submitResponse = await fetch("http://localhost:8080/submit_code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: "python",
          source_code: code,
          input: userInput,
        }),
      });

      if (!submitResponse.ok) {
        throw new Error(`Submit failed: ${await submitResponse.text()}`);
      }

      const { id } = await submitResponse.json();
      console.log("Code submitted, ID:", id);

      const executeResponse = await fetch(`http://localhost:8080/execute_code?id=${id}`, {
        method: "POST",
      });

      if (!executeResponse.ok) {
        throw new Error(`Execution failed: ${await executeResponse.text()}`);
      }

      const result = await executeResponse.json();
      console.log("Execution result:", result);

      setOutput(result.output);
    } catch (error) {
      console.error("Error executing code:", error);
      setOutput(`${error}`);
    }
  };

  return (
    <div className="container">
      <h1>Online Python Compiler</h1>
      <div className="mainContent">
        <div className="editorSection">
          <CodeEditor value={code} onChange={setCode} height="400px" />
          <textarea
            placeholder="Enter input for your code..."
            value={userInput || ""}
            onChange={(e) => setUserInput(e.target.value)}
            className="inputArea"
          />
          <button className="runButton" onClick={handleRun}>Run Code</button>
        </div>

        <div className="outputSection">
          <h3 style={{ margin: "0px" }}>Output:</h3>
          <pre>{output}</pre>
        </div>
      </div>
    </div>
  );
};

export default App;