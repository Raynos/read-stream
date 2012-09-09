# read-stream

Base class for readable streams

## Example array

```
var from = require("read-stream")
    , stream = from(["one", "two"])

stream.pipe(process.stdout)
```

## Example function

```
var from = require("read-stream")
    // buffer is a shared array amongst all read calls
    , stream = from(function read(bytes, buffer) {
        var count = buffer.count = ++buffer.count || 0

        if (count < 5) {
            return count.toString()    
        } else {
            this.emit("end")
        }
    })

stream.pipe(process.stdout)
```

## Installation

`npm install read-stream`

## Contributors

 - Raynos

## MIT Licenced