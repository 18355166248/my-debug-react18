import { useEffect, useState } from "react";

export default function App() {
  const [count, dispatch] = useState(0);

  useEffect(() => {
    console.log(`渲染后执行, 当前count=${count}`);
  });
  return (
    <>
      <button
        onClick={() => {
          dispatch(count);
        }}
      >
        state不变 count={count}
      </button>
      <h3>
        命中dispatchAction中的节流优化 : is(eagerState, currentState) === true
      </h3>
      <p>但是`update`对象已经被添加到了`queue.pending`之上</p>
      <div>
        请在控制台打印:
        `document.getElementById('root')._reactRootContainer._internalRoot.current.child.memoizedState.queue.pending`
        可以看到`queue.pending`链表
      </div>
      <hr />

      <button
        onClick={() => {
          dispatch(count + 1);
        }}
      >
        state改变 count={count}
      </button>
      <div>
        再次打印:
        `document.getElementById('root')._reactRootContainer._internalRoot.current.child.memoizedState.queue.pending`
        可以看到`queue.pending`被清空
      </div>
    </>
  );
}
