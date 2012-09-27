module.exports = Queue

function Queue(stream) {
    var ended = false
        , array = []
        , queue = {
            shift: shift
            , push: push
            , end: end
            , length: 0
        }

    return queue

    function shift() {
        var chunk = array.shift()
        if (ended && array.length === 0) {
            process.nextTick(stream.end)
        }
        queue.length = array.length
        return chunk
    }

    function push(chunk) {
        if (!ended) {
            array.push(chunk)
            if (array.length === 1) {
                stream.emit("readable")
            }

            queue.length = array.length
        }
    }

    function end() {
        if (ended) {
            return
        }

        ended = true
        if (array.length === 0) {
            stream.emit("end")
        }
    }
}
