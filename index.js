"use strict";

var Stream = require("readable-stream")

from.read = defaultRead
from.end = defaultEnd

module.exports = from

function from(read, end, state) {
    if (Array.isArray(read)) {
        return from(readArray)
    }

    if (typeof end !== "function") {
        state = end
        end = null
    }

    var stream = new Stream()
        , ended = false

    end = end || defaultEnd
    state = state || []

    stream.readable = true
    stream.writable = false

    stream.read = handleRead
    stream.end = handleEnd

    return stream

    function readArray(bytes) {
        if (read.length) {
            return read.shift()
        } else {
            this.emit("end")
        }
    }

    function handleRead(bytes) {
        if (ended) {
            return null
        }
        var result = read.call(stream, bytes, state)

        return result === undefined ? null : result
    }

    function handleEnd() {
        if (ended) {
            return
        }
        ended = true
        end.call(stream)
        stream.readable = false
    }
}

function defaultEnd() {
    this.emit("end")
}

function defaultRead(bytes, buffer) {
    return buffer.shift()
}