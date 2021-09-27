// vue的构建

const fs = require('fs') // Node.js 提供的一组类似 UNIX（POSIX）标准的文件操作API
// path 模块的默认操作因运行 Node.js 应用程序的操作系统而异。 具体来说，当在 Windows 操作系统上运行时，path 模块将假定正在使用 Windows 风格的路径。
// 当使用 Windows 文件路径时，若要在任何操作系统上获得一致的结果，则使用 path.win32
// 在 POSIX 和 Windows 上
// path.win32.basename('C:\\temp\\myfile.html') // 返回: 'myfile.html'
// 当使用 POSIX 文件路径时，若要在任何操作系统上获得一致的结果，则使用 path.posix
// 在 POSIX 和 Windows 上
// path.posix.basename('/tmp/myfile.html')  // 返回: 'myfile.html'
const path = require('path') 
const zlib = require('zlib') // 压缩模块
const rollup = require('rollup') // rollup打包工具
const terser = require('terser') //A JavaScript parser and mangler/compressor toolkit for ES6+

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist')
}

let builds = require('./config').getAllBuilds()

// filter builds via command line arg
if (process.argv[2]) {
  const filters = process.argv[2].split(',')
  builds = builds.filter(b => {
    return filters.some(f => b.output.file.indexOf(f) > -1 || b._name.indexOf(f) > -1)
  })
} else {
  // filter out weex builds by default
  builds = builds.filter(b => {
    return b.output.file.indexOf('weex') === -1
  })
}

build(builds)

function build (builds) {
  let built = 0
  const total = builds.length
  const next = () => {
    buildEntry(builds[built]).then(() => {
      built++
      if (built < total) {
        next()
      }
    }).catch(logError)
  }

  next()
}

function buildEntry (config) {
  const output = config.output
  const { file, banner } = output
  const isProd = /(min|prod)\.js$/.test(file)
  return rollup.rollup(config)
    .then(bundle => bundle.generate(output))
    .then(({ output: [{ code }] }) => {
      if (isProd) {
        const minified = (banner ? banner + '\n' : '') + terser.minify(code, {
          toplevel: true,
          output: {
            ascii_only: true
          },
          compress: {
            pure_funcs: ['makeMap']
          }
        }).code
        return write(file, minified, true)
      } else {
        return write(file, code)
      }
    })
}

function write (dest, code, zip) {
  return new Promise((resolve, reject) => {
    function report (extra) {
      console.log(blue(path.relative(process.cwd(), dest)) + ' ' + getSize(code) + (extra || ''))
      resolve()
    }

    fs.writeFile(dest, code, err => {
      if (err) return reject(err)
      if (zip) {
        zlib.gzip(code, (err, zipped) => {
          if (err) return reject(err)
          report(' (gzipped: ' + getSize(zipped) + ')')
        })
      } else {
        report()
      }
    })
  })
}

function getSize (code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function logError (e) {
  console.log(e)
}

function blue (str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}
