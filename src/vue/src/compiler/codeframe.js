/* @flow */

const range = 2

export function generateCodeFrame (
  source: string,
  start: number = 0,
  end: number = source.length
): string {
  const lines = source.split(/\r?\n/)
  let count = 0
  const res = []
  for (let i = 0; i < lines.length; i++) {
    count += lines[i].length + 1
    if (count >= start) {
      for (let j = i - range; j <= i + range || end > count; j++) {
        if (j < 0 || j >= lines.length) continue
        res.push(`${j + 1}${repeat(` `, 3 - String(j + 1).length)}|  ${lines[j]}`)
        const lineLength = lines[j].length
        if (j === i) {
          // push underline
          const pad = start - (count - lineLength) + 1
          const length = end > count ? lineLength - pad : end - start
          res.push(`   |  ` + repeat(` `, pad) + repeat(`^`, length))
        } else if (j > i) {
          if (end > count) {
            const length = Math.min(end - count, lineLength)
            res.push(`   |  ` + repeat(`^`, length))
          }
          count += lineLength + 1
        }
      }
      break
    }
  }
  return res.join('\n')
}


// 此函数的的作用是将字符串str重复n次后输出
// 将str重复n次,相当于str自加n次,n(str+str+str+str+....+str),相当于要做n次加操作
// 一种方法通过遍历n次进行累加,时间复杂度为O(n)
// 另一种方法是通过平方求幂算法(https://blog.csdn.net/a1351937368/article/details/105463218)的思想进行累加,此方法的时间复杂度为O(logn)

// 此算法逻辑分析：依赖知识点,二进制数转10进制数、10进制转二进制,n = P1*(2^n1) + P2*(2^n2) .... +Pm*(2^nm) (Pm为常数(位权),为1或者0)
// 10进制转二进制可以通过多次除2取余，逆序排列得到
// 17：10001,17 = 1*2^0 + 0*2^1 + 0*2^2 + 0*2^3 + 1*2^4
function repeat (str, n) {
  let result = ''
  if (n > 0) {
    while (true) { // eslint-disable-line
      if (n & 1) { // 等价于 n % 2,n对2取余数,  ---二进制表示对应位是1的作求和操作，为0的不求和
        result += str // n为奇数时的处理
      }
      n >>>= 1 //无符号向右移一位等价于n除以2的商
      if (n <= 0) break
      str += str
      
    }
  }
  return result
}


// 改造成递归算法-分治算法
// 时间复杂度logn
// 假设n为17,可表示为17(8+8+1),8(4+4),4(2+2),2(1+1)
// 可以归纳得：n为奇数时，可表示为两相同偶数加基数(这里相当于str);n为偶数时,可拆分为两个相同奇数相加,继续拆分直到不能拆分为止。
function myRepeat(str,n){
  if(!n || n <= 0){
    return ''
  }

  if(n === 1){
    return str
  }

  let temp = myRepeat(str,n/2)
  if(n & 1){
    return str+temp+temp
  }else{
    return temp + temp
  }

}

