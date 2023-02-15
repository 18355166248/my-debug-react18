import { useEffect, useState, Component, useLayoutEffect } from "react";
import "./App.css";

// class App extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       num: 0,
//     };
//   }

//   componentDidUpdate () {
//     console.log(333)
//   }

//   render() {
//     return (
//       <div className="App">
//         <header
//           className="App-header"
//           onClick={() => {
//             console.log(2222);
//             this.setState((old) => ({
//               num: (old.num = 1),
//             }), () => {
//               console.log(66)
//             });
//           }}
//           // onClickCapture={captureClick}
//         >
//           App
//           <h1
//           // onClick={handleClickChid} onClickCapture={captureClickChild}
//           >
//             {this.state.num}
//           </h1>
//         </header>
//       </div>
//     );
//   }
// }

function App() {
  const [num, setNum] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setNum((number) => number + 1);
    }, 1000);
  }, []);

  useEffect(() => {
    console.log("第二个effect");
  });

  useLayoutEffect(() => {
    console.log("useLayoutEffect");
  });

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
