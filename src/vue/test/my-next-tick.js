import { noop } from 'shared/util'
import { handleError } from './error'
import { isIE, isIOS, isNative } from './env'

export let isUsingMicroTask = false

const callbacks = []
let pending = false
let timerFunc // 延迟函数

// 队列存储任务,先存先执行
function flushCallbacks(){
    pending = false
    const copies = callbacks.slice(0)
    callbacks.length = 0
    for(let i = 0;i<copies.length;i++){
        copies[i]()
    }
}

if(typeof Promise !== 'undefined' && isNative(Promise)){
    const p = Promise.resolve()
    timerFunc = ()=>{
        p.then(flushCallbacks)
        if(isIOS) setTimeout(noop)
    }
    isUsingMicroTask = true
}else if(!isIE && typeof MutationObserver !== 'undefined' && isNative(MutationObserver) ||
MutationObserver.toString() === '[object MutationObserverConstructor]'){
    let counter = 1
    const observer = new MutationObserver(flushCallbacks)
    const textNode = document.createTextNode(String(counter))
    observer.observe(textNode,{
        characterData:true
    })
    timerFunc = () => {
        counter = (counter + 1) % 2
        textNode.data = String(counter)
      }
      isUsingMicroTask = true
}else if(typeof setImmediate !== undefined && isNative(setImmediate)){
    // 为什么首选 setImmediate 呢？
    // 这是有原因的，因为 setImmediate 拥有比 setTimeout 更好的性能，
    // 这个问题很好理解，setTimeout 在将回调注册为 (macro)task 之前要不停的做超时检测，
    // 而 setImmediate 则不需要，这就是优先选用 setImmediate 的原因。
    timerFunc = ()=>{
        setImmediate(flushCallbacks)
    }
}else{
    timerFunc = ()=>{
        setTimeout(flushCallbacks,0)
    }
}

export function nextTick(cb?: Function,ctx?: Object){
    let _resolve
    callbacks.push(()=>{
        if(cb){
            try{
                cb.call(ctx)
            }catch(e){
                handleError(e,ctx,'nextTick')
            }
        }else if(_resolve){
            _resolve(ctx)
        }
    })

    if(!pending){
        pending = true
        timerFunc() // 把回调函数序列添加到微任务
    }

    if(!cb && typeof Promise !== 'undefined'){ // 执行先于回调函数序列的执行，所以上面的_resolve一定会有值
        return new Promise(resolve=>{
            _resolve = resolve
        })
    }
}




