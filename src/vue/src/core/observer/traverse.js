/* @flow */

import { _Set as Set, isObject } from '../util/index'
import type { SimpleSet } from '../util/index'
import VNode from '../vdom/vnode'

const seenObjects = new Set()

/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 */
/*
  递归遍历一个对象唤起所有转换
  getter，以便对象内的每个嵌套属性
  收集为"深层"依赖项。
 */

// 递归地读取被观察属性的所有子属性的值，这样被观察属性的所有子属性都将会收集到观察者，从而达到深度观测的目的。
export function traverse (val: any) {
  _traverse(val, seenObjects)
  seenObjects.clear()
}

function _traverse (val: any, seen: SimpleSet) {
  let i, keys
  const isA = Array.isArray(val)
  if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
    return
  }

  // 处理循环引用：开始
  // 例：obj1和obj2互相引用
  // const obj1 = {}
  // const obj2 = {}

  // obj1.data = obj2
  // obj2.data = obj1
  // 我们可以使用一个变量来存储那些已经被遍历过的对象，当再次遍历该对象时程序会发现该对象已经被遍历过了，这时会跳过遍历，从而避免死循环
  if (val.__ob__) {
    const depId = val.__ob__.dep.id
    if (seen.has(depId)) {
      return
    }
    seen.add(depId)
  }
  // 处理循环引用：结束

  if (isA) {
    i = val.length
    while (i--) _traverse(val[i], seen)
  } else {
    keys = Object.keys(val)
    i = keys.length
    while (i--) _traverse(val[keys[i]], seen)
  }
}
