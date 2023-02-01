import { useState } from "react";
import "./App.css";

function App() {
  const [num, setNum] = useState(0);
  return (
    <div className="App">
      <header
        className="App-header"
        onClick={() => setNum((number) => number + 1)}
      >
        App <h1>{num}</h1>
      </header>
    </div>
  );
}

export default App;
