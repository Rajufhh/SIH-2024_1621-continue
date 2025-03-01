import React, { useState } from 'react';

const AiModel = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [history, setHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newHistory = [...history, { role: "user", parts: query }];
    setHistory(newHistory);

    try {
      const res = await fetch('http://localhost:8000/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          history: newHistory
        }),
      });

      const data = await res.text();
      setResponse(data);
      setHistory([...newHistory, { role: "model", parts: data }]);
    } catch (error) {
      console.error(error);
      setResponse('Error querying the AI model.');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query"
        />
        <button type="submit">Submit</button>
      </form>
      <div>
        <p>Response: {response}</p>
      </div>
    </div>
  );
};

export default AiModel;
