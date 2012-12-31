var ReadStream = require("./index")

module.exports = fromArray

function fromArray(array) {
    var queue = ReadStream()
        , stream = queue.stream

    array.forEach(function (item) {
        queue.push(item)
    })

    queue.end()

    return stream
}
