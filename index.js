var Readable = require("readable-stream/readable")

var slice = Array.prototype.slice

module.exports = ReadStream

function ReadStream(options, onread) {
    if (typeof options === "function") {
        onread = options
        options = null
    }

    if (!options) {
        options = {}
    }

    if (!options.objectMode) {
        options.objectMode = true
    }

    if (options.highWaterMark === undefined) {
        options.highWaterMark = 100
    }

    var ended = false
    var stream = new Readable(options)
    var _push = stream.push

    stream._read = handleRead
    stream.push = push
    stream.once("end", onend)
    stream.once("error", onerror)

    if (onread) {
        stream.on("read", onread)
    }

    return stream

    function handleRead(n, cb) {
        stream.emit("read", push, callback)
    }

    function callback(err, result) {
        if (ended) {
            return
        }

        if (err) {
            ended = true
            return stream.emit("error", err)
        }

        if (arguments.length === 2) {
            push(result)
        }

        ended = true

        _push.call(stream, null)
    }

    function push() {
        if (ended) {
            return true
        }

        if (arguments.length === 0) {
            return _push.call(stream)
        }

        var chunks = slice.call(arguments)
        var lastChunk = chunks.pop()

        for (var i = 0; i < chunks.length; i++) {
            var chunk = chunks[i]

            if (ended) {
                break
            }

            addChunk(chunk, true)

            if (chunk === null) {
                return false
            }
        }

        return addChunk(lastChunk)
    }

    function addChunk(chunk, enqueueChunk) {
        if (ended) {
            return
        }

        var state = stream._readableState

        if (chunk === null) {
            ended = true
            _push.call(stream, chunk)
            return false
        } else if (enqueueChunk) {
            state.length += 1
            state.buffer.push(chunk)
        } else {
            return _push.call(stream, chunk)
        }
    }

    function onend() {
        ended = true
    }

    function onerror(err) {
        ended = true

        if (stream.listeners("error").length === 0) {
            stream.emit("error", err)
        }
    }
}
