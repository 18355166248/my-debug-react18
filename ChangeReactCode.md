3. 开启自定义配置
   create-react-app 提供了自定义配置的方式，那就是使用 npm run eject，因为这是个不可恢复的操作，使用前，注意把代码先提交了，当然你不提交，create-react-app 也会提示你进行提交。
   npm run eject
   复制代码
   执行成功后，我们再看下 package.json 文件，会发生很多变化，注意在 scripts 这里，以前是：
   {
   "scripts": {
   "start": "react-scripts start",
   "build": "react-scripts build",
   "test": "react-scripts test",
   "eject": "react-scripts eject"
   }
   }

复制代码
现在变成了：
"scripts": {
"start": "node scripts/start.js",
"build": "node scripts/build.js",
"test": "node scripts/test.js"
},
复制代码
我们查看 scripts/start.js 文件，通过查看其中的代码，可以发现 webpack 的配置文件放在了 config/webpack.config.js 下 4. 修改 webpack alias
我们打开 config/webpack.config.js 文件，搜索 alias，修改如下：
// 修改之前
alias: {
// Support React Native Web
// https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
'react-native': 'react-native-web',
// Allows for better profiling with ReactDevTools
...(isEnvProductionProfile && {
'react-dom$': 'react-dom/profiling',
'scheduler/tracing': 'scheduler/tracing-profiling',
}),
...(modules.webpackAliases || {}),
},

// 修改之后
alias: {
react: path.join(paths.appSrc, 'react/packages/react'),
'react-dom': path.join(paths.appSrc, 'react/packages/react-dom')
}
复制代码
现在我们执行 npm start 启动下项目，你会发现有 142 个编译错误……

但不用害怕，我们慢慢解决。
有一类报错是这样的：

这类问题都可以通过 alias 解决，最终 alias 的配置修改如下：
// 修改之后
alias: {
react: path.join(paths.appSrc, 'react/packages/react'),
'react-dom': path.join(paths.appSrc, 'react/packages/react-dom'),
shared: path.join(paths.appSrc, 'react/packages/shared'),
'react-reconciler': path.join(paths.appSrc, 'react/packages/react-reconciler')
}
复制代码
再次执行 npm start，你会发现只有 5 个报错了：

5. 错误 1：修改 React 和 ReactDOM 引入方式
   在这剩余的 5 个报错中，有一个报错是：

为了避免这个错误，我们打开 react-app/src/index.js，修改 React 和 ReactDOM 的引入方式：
// react-app/src/index.js

// 修改前
import React from 'react';
import ReactDOM from 'react-dom/client';

// 修改后
import _ as React from 'react';
import _ as ReactDOM from 'react-dom/client';
复制代码 6. 错误 2：修改 Scheduler
有两个报错如下：

按照指示，我们打开 react-app/src/react/packages/react-reconciler/src/Scheduler.js 文件：
// this doesn't actually exist on the scheduler, but it _does_
// on scheduler/unstable_mock, which we'll need for internal testing
export const unstable_yieldValue = Scheduler.unstable_yieldValue;
export const unstable_setDisableYieldValue =
Scheduler.unstable_setDisableYieldValue;
复制代码
经过搜索，这两个常量的定义是在 react-app/src/react/packages/scheduler/src/forks/SchedulerMock.js 下，我们引入并修改一下：
// react-app/src/react/packages/react-reconciler/src/Scheduler.js

// 在开头引入 SchedulerMock
import \* as SchedulerMock from 'scheduler/src/forks/SchedulerMock';

// 修改前
export const unstable_yieldValue = Scheduler.unstable_yieldValue;
export const unstable_setDisableYieldValue = Scheduler.unstable_setDisableYieldValue;

// 修改后
export const unstable_yieldValue = SchedulerMock.unstable_yieldValue;
export const unstable_setDisableYieldValue = SchedulerMock.unstable_setDisableYieldValue;
复制代码 7. 错误 3：关掉 ESlint
还有一个报错是：

为了简单起见，我们直接关掉 ESlint，打开 react-app/config/webpack.config.js 文件，搜索 disableESLintPlugin：
// react-app/config/webpack.config.js

// 修改前
const disableESLintPlugin = process.env.DISABLE_ESLINT_PLUGIN === 'true';
// 修改后
const disableESLintPlugin = true;
复制代码 8. 错误 4：环境变量
到这里应该就没有编译错了，但是重新运行后，页面空白，打开控制台，我们会看到报错：

React 的源码里有直接使用 **DEV**等环境变量，我们直接替换掉，修改 config/env.js：
// react-app/config/env.js

// 修改前
const stringified = {
'process.env': Object.keys(raw).reduce((env, key) => {
env[key] = JSON.stringify(raw[key]);
return env;
}, {})
};

// 修改后(只修改 **DEV** 还会有其他的相同报错，所以我们直接一次改齐)
const stringified = {
'process.env': Object.keys(raw).reduce((env, key) => {
env[key] = JSON.stringify(raw[key]);
return env;
}, {}),
**DEV**: true,
**EXPERIMENTAL**: true,
**PROFILE**: true
};
复制代码 9. 错误 5：\_\_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
还有报错：

首先找到报错文件：react-app/src/react/packages/shared/ReactSharedInternals.js：
import \* as React from 'react';

const ReactSharedInternals =
React.\_\_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

export default ReactSharedInternals;
复制代码
通过全局搜索 \_\_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED，我们最终找到 ReactSharedInternals 的定义在 react-app/src/react/packages/react/src/ReactSharedInternals.js，我们修改如下：
// react-app/src/react/packages/shared/ReactSharedInternals.js

// 修改前
const ReactSharedInternals = React.\_\_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

// 修改后
import ReactSharedInternals from 'react/src/ReactSharedInternals'
复制代码 10. 错误 6：This module must be shimmed by a specific renderer
还有报错：

打开 src/react/packages/react-reconciler/src/ReactFiberHostConfig.js
// We expect that our Rollup, Jest, and Flow configurations
// always shim this module with the corresponding host config
// (either provided by a renderer, or a generic shim for npm).
//
// We should never resolve to this file, but it exists to make
// sure that if we _do_ accidentally break the configuration,
// the failure isn't silent.

throw new Error('This module must be shimmed by a specific renderer.');
复制代码
可以看到这个文件是会在编译的时候被替换成对应的 host config，我们直接修改如下：
// src/react/packages/react-reconciler/src/ReactFiberHostConfig.js

// 修改前
throw new Error('This module must be shimmed by a specific renderer.');

// 修改后
export \* from "./forks/ReactFiberHostConfig.dom";
复制代码 11. 调试
到这里，代码应该已经可以正常运行起来了。
我们可以直接修改 react 的源码文件进行调试，浏览器会自动刷新，比如我修改了 react/packages/scheduler/src/SchedulerMinHeap.js 等文件：
export function push(heap: Heap, node: Node): void {
const index = heap.length;
heap.push(node);
console.log(JSON.stringify(heap))
siftUp(heap, node, index);
}

作者：冴羽
链接：https://juejin.cn/post/7168821587251036167
来源：稀土掘金
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
