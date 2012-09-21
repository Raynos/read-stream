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
        if (ended) {
            process.nextTick(stream.end)
        }
        queue.length = array.length
        return chunk
    }

    function push(chunk) {
        array.push(chunk)
        if (array.length === 1) {
            stream.emit("readable")
        }

        queue.length = array.length
    }

    function end() {
        ended = true
        if (array.length === 0) {
            stream.end()
        }
    }
}