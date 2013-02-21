var process = require("process")

module.exports = PullSource

function PullSource(arr, sync) {
    return {
        nextObject: nextObject
    }

    function nextObject(cb) {
        if (sync) {
            cb(null, arr.shift() || null)
        } else {
            process.nextTick(function () {
                cb(null, arr.shift() || null)
            })
        }
    }
}
