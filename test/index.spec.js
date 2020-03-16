import Queuery from '../src'
import debounce from 'debounce'
import { expect } from 'chai'
import { describe, it, beforeEach } from 'mocha'

describe('并发数量测试', () => {
  beforeEach(() => {
    const done = (() => {
      let count = 0
      return () => {
        count++
        return count
      }
    })()
    global.done = done
  })
  it('并发数量为 1（线性执行）', (mochaDone) => {
    const debounceDone = debounce(global.done, 10, true)
    const q = new Queuery({ limit: 1 })
    for (let i = 1; i <= 10; i++) {
      q.task(() => new Promise((resolve) => {
        setTimeout(() => {
          debounceDone()
          resolve()
        }, 100)
      }))
    }
    q.start(() => {
      setTimeout(() => {
        expect(debounceDone()).to.be.eq(11)
        mochaDone()
      }, 100)
    })
  })

  it('并发数量为 2（任务数量能平分）', (mochaDone) => {
    // const debounceDone = debounce(global.done, 10, true)
    const q = new Queuery({ limit: 2 })
    const startTime = new Date()
    for (let i = 1; i <= 10; i++) {
      q.task(() => new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, 100)
      }))
    }
    q.start(() => {
      const endTime = new Date()
      const delta = endTime - startTime
      expect(delta).is.lt(550) // 500ms(10 个任务拆分为 5 组) + 50ms 的宽裕时间
      mochaDone()
    })
  })

  it('并发数量为 3（任务数量不能平分）', (mochaDone) => {
    const q = new Queuery({ limit: 3 })
    const startTime = new Date()
    for (let i = 1; i <= 10; i++) {
      q.task(() => new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, 100)
      }))
    }
    q.start(() => {
      const endTime = new Date()
      const delta = endTime - startTime
      expect(delta).is.lt(450) // 400ms(10 个任务拆分为 4 组) + 50ms 的宽裕时间
      mochaDone()
    })
  })
})

describe('错误重试测试', () => {
  it('错误重试次数为 0', (mochaDone) => {
    const q = new Queuery({ retries: 0 })
    const startTime = new Date()
    q.task(() => new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error())
      }, 100)
    }))
    q.start(() => {
      const endTime = new Date()
      const delta = endTime - startTime
      expect(delta).is.lt(150) // 100ms(共执行 1 次，错误不重试) + 50ms 的宽裕时间
      mochaDone()
    })
  })

  it('错误重试次数为 2', (mochaDone) => {
    const q = new Queuery({ retries: 2 })
    const startTime = new Date()
    q.task(() => new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error())
      }, 100)
    }))
    q.start(() => {
      const endTime = new Date()
      const delta = endTime - startTime
      expect(delta).is.lt(350) // 300ms(共执行 3 次，错误重试 2 次) + 50ms 的宽裕时间
      mochaDone()
    })
  })
})

describe('基本功能测试', () => {
  it('任务队列为空', (mochaDone) => {
    const q = new Queuery({ verbose: true })
    q.start(() => {
      mochaDone()
    })
  })
})
