import React, { useState } from 'react';
import CodeEditor from './components/CodeEditor';
import './App.scss';

const App: React.FC = () => {
  const [code, setCode] = useState<string>("# Write your Python code here\nn = int(input('Enter a number: '))\nfor i in range(n):\n    print(i)");
  const [output, setOutput] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [ws, setWs] = useState<WebSocket | null>(null)
  
  const handleRunCode = (code: string) => {
    setOutput('');
    setCode(code);

    if (ws) {
      ws.close();
    }
    
    connectWebSocket(code);
  };

  const connectWebSocket = (code: string) => {
    const newWs = new WebSocket('ws://localhost:8080/ws');
    setWs(newWs);

    newWs.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'error') {
          setOutput(prev => `${prev}\n<span class="error-text">${message.content}</span>\n`);
          setInputValue('');
        } else {
          setOutput(prev => `${prev}${message.content}`);
        }
      } catch (e) {
        setOutput(prev => `${prev}${event.data}\n`);
      }
    };

    newWs.onopen = () => {
      setIsConnected(true);
      console.log('Connection opened');
      setOutput(`<span class="connection-text">=== Connection Opened ===\n\n</span>`);
      newWs.send(JSON.stringify({
        type: 'code',
        content: code
      }));
    };

    newWs.onclose = () => {
      console.log('Connection closed');
      if (isConnected) {
        setOutput(prev => `${prev}\n<span class="connection-text">=== Connection Closed ===\n</span>`);
        setWs(null);
        setIsConnected(false);
      }
    };

    newWs.onerror = (error) => {
      console.error('WebSocket error:', error);
      setOutput(prev => `${prev}<span class="connection-text">=== Connection Error ===\n</span>`);
    };
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && ws && ws.readyState === WebSocket.OPEN) {
      setOutput(prev => `${prev}${inputValue}\n`);
      ws.send(JSON.stringify({
        type: 'input',
        content: inputValue
      }));
      setInputValue('');
    }
  };

  return (
    <div className="container">
      <div className="editor-container">
        <CodeEditor 
          onRunCode={handleRunCode} 
          initialCode={code}
        />
      </div>
      <div className="output-container">
        <div 
          id="output" 
          className="output" 
          dangerouslySetInnerHTML={{ __html: output }}
        />
        <input
          type="text"
          className="input"
          placeholder="Enter your input here..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyPress}
        />
      </div>
    </div>
  );
};

export default App;