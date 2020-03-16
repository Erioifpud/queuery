export default class Queuery {
  constructor (options) {
    const { limit = 3, retries = 3, verbose } = options || {}
    this.queue = []
    this.running = 0
    this.limit = limit
    this.retries = retries
    this.results = []
    this.verbose = verbose
  }

  task (promiseWrapper, ...args) {
    this.taskWithName(args, promiseWrapper, ...args)
  }

  taskWithName (name, promiseWrapper, ...args) {
    this.queue.push({
      name,
      promiseWrapper,
      args: args.length ? args : [],
      retries: 0
    })
  }

  remove (name) {
    const index = this.queue.findIndex(item => item.name === name)
    if (index === -1) {
      return
    }
    this.queue.splice(index, 1)
    this.verbose && console.log(name, 'removed')
  }

  __checkNext (done) {
    if (!this.queue.length) {
      done()
      return
    }
    const item = this.queue.shift()
    const { name, promiseWrapper, args, retries } = item
    if (!retries) {
      this.running++
    }
    const promise = promiseWrapper(...args)
    promise.then(data => {
      this.running--
      this.verbose && console.log(name, 'finished')
      this.results.push({
        name,
        payload: data
      })
      this.__checkNext(done)
      return data
    }).catch((err) => {
      if (retries < this.retries) {
        this.queue.push({
          ...item,
          retries: retries + 1
        })
        this.verbose && console.log(name, 'is retrying: ', retries)
        this.__checkNext(done)
      } else {
        this.running--
        this.verbose && console.error(name, 'failed')
        this.results.push({
          name,
          payload: err
        })
        this.__checkNext(done)
        return err
      }
    })
  }

  start (onFinish) {
    const length = this.queue.length < this.limit ? this.queue.length : this.limit
    if (!length) {
      onFinish(this.results)
      return
    }
    const getDone = (resolve) => {
      let count = 0
      return () => {
        count++
        if (count >= length) {
          resolve()
        }
      }
    }
    new Promise((resolve) => {
      const done = getDone(resolve)
      for (let i = 0; i < length; i++) {
        this.__checkNext(done)
      }
    }).then(() => {
      onFinish(this.results)
    })
  }
}
