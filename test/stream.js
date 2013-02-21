var test = require("tape")
var process = require("process")
var setTimeout = require("timers").setTimeout
var Readable = require("readable-stream/readable")

var toArray = require("./utils/toArray")
var fromArray = require("../array")
var ReadStream = require("../index")

test("can read strings as objects", function (assert) {
    var s = fromArray(["one", "two", "three"])

    s.pipe(toArray(function (list) {
        assert.deepEqual(list, ["one", "two", "three"])
        assert.end()
    }))

    var s2 = fromArray(["one", "two", "three"])
    var v1 = s2.read()
    var v2 = s2.read()
    var v3 = s2.read(0)
    var v4 = s2.read()
    var v5 = s2.read()

    assert.equal(v1, "one")
    assert.equal(v2, "two")
    assert.equal(v3, null)
    assert.equal(v4, "three")
    assert.equal(v5, null)
})

test("read(0) works as expected", function (assert) {
    var count = 0
    var s = ReadStream(function (push, callback) {
        assert.equal(count, 1)
        count++
    })

    count++
    s.read(0)

    assert.equal(count, 2)
    assert.end()
})

test("can push falsey values", function (assert) {
    var s = ReadStream()
    s.push(false)
    s.push(0)
    s.push("")
    s.push(null)

    s.pipe(toArray(function (list) {
        assert.deepEqual(list, [false, 0 , ""])
        assert.end()
    }))
})

test("high water mark", function (assert) {
    var count = 99
    var list = []
    for (var i = 0; i < count; i++) {
        list.push(i)
    }

    var s = ReadStream(function (push, cb) {
        var bools = list.map(function (i) {
            return push(i)
        })

        assert.ok(bools.every(function (x) {
            return x === true
        }))

        var needMore = push(100)
        assert.equal(needMore, false)

        // console.log("s", s._readableState)
        assert.end()
    })

    s.read(0)
})

test("emits end", function (assert) {
    var s = ReadStream()
    var count = 0

    // end occurs nextTick after s.read()
    s.once("end", function () {
        assert.equal(count, 3)
        assert.end()
    })

    count++

    s.push(null)

    count++

    s.read(0)

    count++

    process.nextTick(function () {
        count++
    })
})

test("emits read", function (assert) {
    var s = ReadStream()
    var count = 0

    s.once("read", function () {
        assert.equal(count, 1)
        count++
    })

    count++

    s.read(0)

    assert.equal(count, 2)
    assert.end()
})

test("pushing after end drops the data", function (assert) {
    var s = ReadStream()

    s.push(1)
    s.push(2)
    s.push(null)
    s.push(3)
    s.push(4)

    assert.equal(s._readableState.buffer.length, 2)
    assert.end()
})

test("callback(err) works as expected", function (assert) {
    var s = ReadStream(function (push, callback) {
        callback(Error("hello"))
    })
    var count = 0

    s.once("error", function (err) {
        assert.equal(err.message, "hello")
        assert.equal(count, 1)
        count++
    })

    count++

    s.read(0)

    assert.equal(count, 2)
    assert.end()
})

test("callback() works as expected", function (assert) {
    var s = ReadStream(function (push, callback) {
        count++
        callback()
    })
    var count = 0

    s.once("end", function () {
        count++
    })

    count++

    s.read(0)

    assert.equal(count, 2)

    count++

    var res = s.read(1)

    assert.equal(res, null)
    assert.equal(count, 3)

    process.nextTick(function () {
        assert.equal(count, 4)
        assert.end()
    })
})

test("callback(null, value) works as expected", function (assert) {
    var s = ReadStream(function (push, callback) {
        count++
        callback(null, 42)
    })
    var count = 0

    s.once("end", function () {
        count++
    })

    count++

    s.read(0)

    assert.equal(count, 2)

    count++

    var res = s.read(1)

    assert.equal(res, 42)
    assert.equal(count, 3)

    process.nextTick(function () {
        assert.equal(count, 4)
        assert.end()
    })
})

test("stream considered ended after error", function (assert) {
    var s = ReadStream()
    var count = 0

    s.once("error", function (err) {
        assert.equal(count, 0)
        count++
        assert.equal(err.message, "foo")
    })

    s.emit("error", Error("foo"))

    count++

    assert.equal(count, 2)

    s.push(42)
    s.push(45)
    s.push(30)

    assert.equal(s._readableState.buffer.length, 0)
    assert.end()
})

/* complex */
test("backpressure respected", function (assert) {
    var source = ReadStream()
    var counter = 0
    source.push("one")
    source.push("two")
    source.push("three")
    source.push("four")
    source.push(null)

    // w1 reads one chunk and then closes
    var w1 = ReadStream()
    w1.write = function (chunk) {
        assert.equal(chunk, "one")
        w1.emit("close")
        // After w1 closed we should pipe the other two
        process.nextTick(function () {
            source.pipe(w2)
            source.pipe(w3)
        })
    }
    w1.end = noop

    // pipe happens on next tick so this is fine
    source.pipe(w1)

    var expected = ["two", "two", "three", "three", "four", "four"]

    var w2 = ReadStream()
    w2.write = function (chunk) {
        // Then w2 get's written to
        assert.equal(chunk, expected.shift())
        // counter is always zero because we decrement before drain
        assert.equal(counter, 0)

        counter++

        if (chunk === "four") {
            return true
        }

        setTimeout(function () {
            counter--
            w2.emit("drain")
        }, 10)

        return false
    }
    w2.end = noop

    var w3 = ReadStream()
    w3.write = function (chunk) {
        assert.equal(chunk, expected.shift())
        // counter is always 1 because this get's written to
        // after w2
        assert.equal(counter, 1)

        counter++

        if (chunk === "four") {
            // no backpressure
            return true
        }

        setTimeout(function () {
            counter--
            // longer back pressure
            w3.emit("drain")
        }, 50)

        return false
    }
    w3.end = function () {
        // two streams have incremented their counter once and
        // then returned true for no backpressure
        assert.equal(counter, 2)
        // all the chunks were delivered to w2 and w3
        assert.equal(expected.length, 0)
        assert.end()
    }
})

function noop() {}
