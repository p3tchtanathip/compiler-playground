import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import './CodeEditor.scss';

interface CodeEditorProps {
  onRunCode: (code: string) => void;
  initialCode: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ onRunCode, initialCode }) => {
  const [code, setCode] = React.useState(initialCode);

  const onChange = React.useCallback((value: string) => {
    setCode(value);
  }, []);

  const handleRunCode = () => {
    onRunCode(code);
  };

  return (
    <div className="code-editor">
      <CodeMirror
        value={code}
        height="400px"
        theme="dark"
        extensions={[python()]}
        onChange={onChange}
      />
      <button className="run-button" onClick={handleRunCode}>
        Run Code
      </button>
    </div>
  );
};

export default CodeEditor;