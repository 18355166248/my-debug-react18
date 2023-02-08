import { useState } from "react";
import "./App.css";

function App() {
  const [num, setNum] = useState(0);

  function handleClick() {
    console.log("父级冒泡阶段");
  }

  function captureClick() {
    console.log("父级捕获阶段");
  }

  function handleClickChid() {
    console.log("子级冒泡阶段");
  }

  function captureClickChild() {
    console.log("子级捕获阶段");
  }
  return (
    <div className="App">
      <header
        className="App-header"
        onClick={() => {
          console.log(2222);
          handleClick();
          setNum((number) => number + 1);
        }}
        // onClickCapture={captureClick}
      >
        App
        <h1
        // onClick={handleClickChid} onClickCapture={captureClickChild}
        >
          {num}
        </h1>
      </header>
    </div>
  );
}

export default App;
