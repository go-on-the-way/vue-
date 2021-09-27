import type Watcher from './watcher'
import { remove } from '../util/index'
import config from '../config'

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
// Dep是一个可观察对象的抽象类,可以有多个指令订阅它
export default class Dep {
  static target: ?Watcher; // 静态属性,当前观察者
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = [] // 一个可观察实例可以有多个观察者
  }

  addSub (sub: Watcher) { // 注册观察者
    this.subs.push(sub)
  }

  removeSub (sub: Watcher) { // 移除观察者
    remove(this.subs, sub)
  }

  depend () {
    if (Dep.target) {
      Dep.target.addDep(this) // 观察者添加依赖
    }
  }

  // 通知观察者更新
  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id) // 按照id升序排列
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

// The current target watcher being evaluated. //evaluate:赋值
// This is globally unique because only one watcher
// can be evaluated at a time.
// 当前观察者
Dep.target = null
const targetStack = []

export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}

export function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
