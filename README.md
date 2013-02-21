# read-stream

[![build status][1]][2] [![dependency status][3]][4]

[![browser support][5]][6]

Base class for readable streams

This should be used for object streams only.

## Example push model

A push source can be turned into a `Readable Stream` by creating
an instance of the source and creating a stream.

When the `onread` listener of the stream get's called it's time
to start consuming data from the source. (like `source.resume()`
or `source.readStart()`). Note that `onread` may get called
multiple times even when the source your wrapping in a stream
has already started. So `resume()` / `readStart()` should be handle
being called multiple times.

When you get actual data out of the raw source you should `push(data)`
into the stream. `push` returns a boolean whether or not the
stream's buffer is full. If it's full you need to stop reading
from the source (like `source.pause()` or `source.readStop()`).

`push()` returns false when the internal buffer matches the
`highWaterMark`. This defaults to `100` for `ReadStream`. You can
configure it using

```js
var stream = ReadStream({
    highWaterMark: 20
}, function onread() { ... })
```

If the source emits some kind of `EOF` you should call `push(null)`
and if the source emits some kind of error you can just `emit("error", err)`

```js
var ReadStream = require("read-stream")

var socket = connect(...)
var stream = ReadStream(function onread(push, cb) {
    socket.readStart()
})

socket.ondata = function (chunk) {
    var needsMore = stream.push(chunk)

    if (!needsMore) {
        socket.readStop()
    }
}

socket.onend = function () {
    stream.push(null)
}

socket.onerror = function (err) {
    stream.emit("error", err)
}

stream.pipe(process.stdout)
```

## Example pull model

A pull source can be made into a `Readable Stream` in a way easier
fashion. Create an instance of the raw pull source and create a
stream.

When the `onread` listener of the stream is called you should
pull data out of the underlying source and `push()` it into
the stream. If you `push()` data into the stream and the underlying
buffer is below the `lowWaterMark` then `onread` will be called
again immediately. The `lowWaterMark` can be configured and defaults
to 0

```js
var stream = ReadStream({
    lowWaterMark: 5
}, function onread() {})
```

When a user calls `read()` on the stream and the internal buffer
is below the `highWaterMark` after read removes an item then
`onread` will be called again.

Note that it the underlying source returns an `err` or returns
an `EOF` you should `emit("error", err)` and `push(null)` respectively.

```js
var ReadStream = require("read-stream")

var source = db.cursor(...)
var stream = ReadStream(function onread(push, cb) {
    cursor.nextObject(function (err, item) {
        if (err) {
            return stream.emit("error", err)
        }

        push(item || null)
    })
})

stream.pipe(process.stdout)
```

## Example array

If you want to turn an array into a stream for testing / example
purposes then use the `array` function.

```js
var fromArray = require("read-stream/array")
var stream = fromArray(["one", "two"])

stream.pipe(process.stdout)
```

## Example callback

If you want to turn a callback operation into a stream then
you can use the `callback` function.

```js
var callback = require("read-stream/callback")

var stream = callback(function (cb) {
    fs.readFile(someUri, cb)
})

stream.pipe(process.stdout)
```

## Installation

`npm install read-stream`

## Contributors

 - Raynos

## MIT Licenced

  [1]: https://secure.travis-ci.org/Raynos/read-stream.png
  [2]: http://travis-ci.org/Raynos/read-stream
  [3]: http://david-dm.org/Raynos/read-stream.png
  [4]: http://david-dm.org/Raynos/read-stream
  [5]: http://ci.testling.com/Raynos/read-stream.png
  [6]: http://ci.testling.com/Raynos/read-stream
