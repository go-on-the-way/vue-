const data = {
    a: 1,
    b:2
}
  
for (const key in data) {
    const dep = []
    let val = data[key]

    Object.defineProperty(data, key, {
        set (newVal) {
            // 如果值没有变什么都不做
            if (newVal === val) return
            // 使用新值替换旧值
            val = newVal
            dep.forEach(fn => fn())
        },
        get () {
            // 此时 Target 变量中保存的就是依赖函数
            dep.push(Target)
            return val  // 将该值返回
        }
    })
}

// Target 是全局变量
let Target = null
// $watch 函数所做的事情就是想方设法地访问到你要观测的字段，从而触发该字段的 get 函数，进而收集依赖(观察者)。
function $watch (exp, fn) {
    // 将 Target 的值设置为 fn
    Target = fn
    // 读取字段值，触发 get 函数
    data[exp]
}

$watch('a', () => {
    console.log('第一个a依赖')
})

$watch('b', () => {
    console.log('第二个b依赖')
})

data.a = 3
data.b = 4
console.log(data.a)
console.log(data.b)

