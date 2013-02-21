var process = require("process")

module.exports = PushSource

function PushSource(arr, sync) {
    var source = {
        readStop: readStop
        , readStart: readStart
    }
    var looping

    return source

    function readStart() {
        if (looping) {
            return
        }

        looping = true
        loop()
    }

    function readStop() {
        looping = false
    }

    function loop() {
        if (!looping) {
            return
        }

        source.ondata(arr.shift() || null)
        if (sync) {
            loop()
        } else {
            process.nextTick(loop)
        }
    }
}
