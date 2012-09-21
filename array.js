var ReadStream = require("./index")

module.exports = fromArray

function fromArray(array, end) {
    var queue = ReadStream(readArray, end)
        , stream = queue.stream

    return stream

    function readArray(bytes) {
        if (array.length > 0) {
            return array.shift()
        } else if (array.length === 0) {
            process.nextTick(stream.end)
            return null
        }
    }
}