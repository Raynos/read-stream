# read-stream

Base class for readable streams

## Example

```
var from = require("read-stream")
    , to = require("write-stream")

from([1,2,3,4]).pipe(to([], function (array) {
    assert.equal(array, [1,2,3,4])
}))
```

## Installation

`npm install read-stream`

## Contributors

 - Raynos

## MIT Licenced