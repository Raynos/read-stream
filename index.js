var Stream = require("readable-stream")
    , extend = require("xtend")
    , Queue = require("./lib/queue")

ReadStream.read = defaultRead
ReadStream.end = defaultEnd

module.exports = ReadStream

ReadStream.fromArray = require("./array")

function ReadStream(read, end, state) {
    if (typeof end !== "function") {
        state = end
        end = null
    }

    read = read || defaultRead
    end = end || defaultEnd

    var stream = new Stream()
        , ended = false
        , queue = Queue(stream)

    extend(queue, state || {})

    stream.read = handleRead
    stream.end = handleEnd
    queue.stream = stream

    return queue

    function handleRead(bytes) {
        if (ended) {
            return null
        }

        var result = read.call(stream, bytes, queue)

        return result === undefined ? null : result
    }

    function handleEnd() {
        if (ended) {
            return
        }

        ended = true
        end.call(stream)
    }
}

function defaultEnd() {
    this.emit("end")
}

function defaultRead(bytes, queue) {
    return queue.shift()
}