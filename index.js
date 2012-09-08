'use strict';

var Stream = require('readable-stream')

// from
//
// a stream that reads from an source.
// source may be an array, or a function.
// from handles pause behaviour for you.

module.exports = from

function from(read) {
    if (Array.isArray(read)) {
        return from(readArray)
    }

    var stream = new Stream()
        , ended = false
        , buffer = []

    stream.readable = true
    stream.writable = false

    stream.read = handleRead
    stream.end = end

    stream.once("end", setReadable)

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

    function end() {
        ended = true
        stream.emit("end")
    }

    function setReadable() {
        ended = true
        stream.readable = false
    }
}