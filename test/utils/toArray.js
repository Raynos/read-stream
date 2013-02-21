var Writable = require("readable-stream/writable")

module.exports = toArray

function toArray(callback) {
    var stream = new Writable()
    var list = []

    stream.write = function(chunk) {
        list.push(chunk)
    }

    stream.end = function() {
        callback(list)
    }

    return stream
}
