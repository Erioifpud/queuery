# Queuery
[![Build Status](https://travis-ci.org/Erioifpud/erio-vuex-persist.svg?branch=master)](https://travis-ci.org/Erioifpud/erio-vuex-persist)
[![npm](https://img.shields.io/npm/v/erio-vuex-persist.svg?color=red)](http://npmjs.com/erio-vuex-persist)
[![license](https://img.shields.io/github/license/erioifpud/erio-vuex-persist.svg)]()

迷你的并发 Promise 处理器，可以**限制同时运行**的任务数量，默认有**错误重试**功能。

默认的并发数量是 3，错误重试次数也是 3

## 安装
```
yarn add queuery
```

## 例子
```javascript
const Queuery = require('queuery')

const q = new Queuery({
  // 并发数量，默认为 3
  limit: 3,
  // 重试次数，默认为 3
  retries: 3,
  // 打印详细状态，默认为 false
  verbose: false
})
q.task((name) => Promise.resolve(name), 'resolve')
q.taskWithName('reject', () => Promise.reject('error'))
q.start((results) => {
  console.log(results)
})
```

## TODO
- 过滤不合法参数
- Promise polyfill
- 完善队列操作
- index.d.ts
- 补全单元测试