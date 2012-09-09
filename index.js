"use strict";

var Stream = require("readable-stream")

from.end = defaultEnd

module.exports = from

function from(read, end) {
    if (Array.isArray(read)) {
        return from(readArray)
    }

    var stream = new Stream()
        , ended = false
        , buffer = []

    end = end || defaultEnd

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
        var result = read.call(stream, bytes, buffer)

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