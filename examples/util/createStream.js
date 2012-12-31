var Stream = require("stream")

module.exports = createStream

function createStream(list) {
    var stream = new Stream()

    stream.write = function (chunk) {
        console.log(chunk)
        list.push(chunk)
        return true
    }

    stream.end = function () {
        console.log("ended")
        list.push("ended")
    }

    return stream
}
