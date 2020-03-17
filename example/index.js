/* eslint-disable no-unused-vars */
const Queuery = require('../dist/umd').default

function normal () {
  const q = new Queuery()
  q.taskWithName(1, () => Promise.resolve(1))
  q.taskWithName(2, () => Promise.resolve(2))
  q.taskWithName(3, () => Promise.resolve(3))
  q.taskWithName(1, () => Promise.reject(new Error('Just an error.')))
  q.start(results => {
    console.log(results)
  })
}

function limit () {
  const q = new Queuery({
    limit: 1
  })
  const createPromise = (delay) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(delay)
        resolve(delay)
      }, delay)
    })
  }
  q.taskWithName(1, () => createPromise(1000))
  q.taskWithName(2, () => createPromise(1000))
  q.taskWithName(3, () => createPromise(1000))
  q.taskWithName(1, () => createPromise(1000))
  q.start(results => {
    console.log(results)
  })
}

function verbose () {
  const q = new Queuery({
    verbose: true
  })
  q.taskWithName(1, () => Promise.resolve(1))
  q.taskWithName(2, () => Promise.resolve(2))
  q.taskWithName(3, () => Promise.resolve(3))
  q.taskWithName(1, () => Promise.reject(new Error('Just an error.')))
  q.start(results => {
    console.log(results)
  })
}

function noRetry () {
  const q = new Queuery({
    verbose: true,
    retries: 0
  })
  q.taskWithName(1, () => Promise.resolve(1))
  q.taskWithName(2, () => Promise.resolve(2))
  q.taskWithName(3, () => Promise.resolve(3))
  q.taskWithName(1, () => Promise.reject(new Error('Just an error.')))
  q.start(results => {
    console.log(results)
  })
}
