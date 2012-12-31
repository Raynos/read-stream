var Stream = require("readable-stream")
    , Queue = require("./lib/queue")

module.exports = ReadStream

ReadStream.from = require("./from")
ReadStream.callback = require("./callback")
ReadStream.fromArray = require("./array")

function ReadStream() {
    var stream = new Stream({
            objectStream: true
        })
        , queue = Queue(stream)

    queue.stream = stream

    return queue
}
