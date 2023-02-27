import React, { useEffect, useLayoutEffect, useState } from "react";

function App() {
  const [count, setCount] = useState(0);
  const [bool, setBool] = useState(false);

  useEffect(() => {
    console.log(22);
  }, []);

  return (
    <div>
      <button onClick={() => setCount((i) => i + 1)}>点击Count+1</button>
      <button onClick={() => setBool(!bool)}>点击Count+1</button>
      <div>{count}</div>
      <div>{String(bool)}</div>
    </div>
  );
}

export default App;

// import React, { useEffect, useLayoutEffect, useState } from "react";

// function App() {
//   const [count, setCount] = useState(0);

//   useLayoutEffect(() => {
//     console.log("useLayoutEffect");
//   }, []);

//   useEffect(() => {
//     console.log(22);
//   }, []);

//   return (
//     <div>
//       <button onClick={() => setCount((i) => i + 1)}>点击Count+1</button>
//       {/* 这里因为key一样 所以最后 mapRemainingChildren 缓存的数据是 这样的 Map {0: {elementType: h1}} */}
//       {/* 所以每次只缓存了 h1的节点 并标记了要删除 deletions 标记, 这样 h3和h2 标签就一直不会被删除 每次点击都会保留 */}
//       <h3 key={count}>大{count}</h3>
//       <h2 key={count}>舌{count}</h2>
//       <h1 key={count}>头{count}</h1>
//     </div>
//   );
// }

// export default App;

// import React, { useState } from "react";

// function App() {
//   const [count, setCount] = useState(["A", "B", "C", "D", "E"]);

//   return (
//     <div>
//       <button onClick={() => setCount(["A", "B", "E", "C", "X", "Y"])}>
//         点击Count+1
//       </button>
//       <div>
//         {count.map((item) => (
//           <p key={item}>{item}</p>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default App;
