module.exports = Queue

function Queue(stream) {
    var onread = stream._readableState.onread
        , ended = false
        , queue = {
            push: push
            , end: end
            , error: error
        }

    stream._read = noop

    return queue

    function push(chunk) {
        onread(null, chunk)
    }

    function end(chunk) {
        if (ended) {
            return
        }

        ended = true

        if (arguments.length) {
            push(chunk)
        }

        push(null)
    }

    function error(err) {
        stream.emit("error", err)
    }
}

function noop() {}
