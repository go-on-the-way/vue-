import { observe } from "../src/core/observer";
import Dep from "../src/core/observer/dep";

export function defineReactive(
    obj:Object,
    key:String,
    val:any,
    customSetter?:?Function,
    shallow?:Boolean
){
    const dep = new Dep() // 声明一个与此属性值对应的可观察对象
    const property = Object.getOwnPropertyDescriptor(obj,key)
    if(property && property.configurable === false){
        return
    }

    const getter = property && property.get
    const setter = property && property.set
    if((!getter || setter) && arguments.length === 2){
        val = obj[key]
    }

    let childObserver = !shallow && observe(val)

    Object.defineProperty(obj,key,{
        enumerable: true,
        configurable: true,
        get: function reactiveGetter(){ // 属性被取值时进行订阅
            const value = getter ? getter.call(obj) : val
            if(Dep.target){
                dep.depend() // 当前观察者订阅此属性
                if (childOb) {
                    childOb.dep.depend() // 如果属性值不是基本类型的递归订阅
                    if (Array.isArray(value)) {
                        dependArray(value)
                    }
                }
            }
            return value
        },
        set: function reactiveSetter(newVal){
            const value = getter ? getter.call(obj) : val
            if(newVal === value || (newVal !== newVal && value !== value)){
                return
            }

            if (process.env.NODE_ENV !== 'production' && customSetter) {
                customSetter()
            }

            if (getter && !setter) return

            if (setter) {
                setter.call(obj, newVal)
            } else {
                val = newVal
            }

            childObserver = !shallow && observe(val)
            dep.notify()
        }
    })
}