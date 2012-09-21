# read-stream

Base class for readable streams

## Example array

```
var fromArray = require("read-stream").fromArray
    , stream = fromArray(["one", "two"])

stream.pipe(process.stdout)
```

## Example function

```
var ReadStream = require("read-stream")
    // state is a shared object among all reads whose initial
    // value is set to be  { count: 0 }
    , stream = ReadStream(function read(bytes, state) {
        var count = ++state.count

        if (count < 5) {
            return count.toString()
        } else {
            process.nextTick(this.end)
        }
    }, { count: 0 })

stream.pipe(process.stdout)
```

## Example queue

```
var ReadStream = require("read-stream")
    , queue = ReadStream()
    , count = 0

var timer = setInterval(function () {
    count = ++count

    if (count < 5) {
        queue.push(count.toString())
    } else {
        clearInterval(timer)
        process.nextTick(this.end)
    }
}, 500)

queue.stream.pipe(process.stdout)
```

## Installation

`npm install read-stream`

## Contributors

 - Raynos

## MIT Licenced