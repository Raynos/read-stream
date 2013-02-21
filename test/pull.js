var test = require("tape")
var process = require("process")

var PullSource = require("./sources/pull")
var ReadStream = require("../index")
var toArray = require("./utils/toArray")

test("pull stream", function (assert) {
    var source = PullSource([1, 2, 3, 4])
    var s = ReadStream(function onread(push, cb) {
        source.nextObject(consume)

        function consume(err, item) {
            push(err || item)
        }
    })

    s.pipe(toArray(function (list) {
        assert.deepEqual(list, [1, 2, 3, 4])
        assert.end()
    }))
})

test("pull stream (backpressure)", function (assert) {
    var source = PullSource([1, 2, 3, 4, 5, 6, 7, 8], true)
    var s = ReadStream(function onread(push, cb) {
        source.nextObject(consume)

        function consume(err, item) {
            if (err) {
                return cb(err)
            }

            push(item)
        }
    })
    var state = s._readableState

    s.read(0)
    assert.equal(state.length, 1)

    s.once("readable", function () {
        assert.ok(true)
        assert.end()
    })
})

test("low watermark (pull)", function (assert) {
    var s = ReadStream({
        lowWaterMark: 2
    }, function onread(push) {
        calls++
        push("foo")
    })
    var calls = 0

    s.read(0)

    assert.equal(calls, 3)

    s.push(null)

    s.pipe(toArray(function (list) {
        assert.equal(calls, 3)
        assert.deepEqual(list, ["foo", "foo", "foo"])
        assert.end()
    }))
})

test("can push many items at once", function (assert) {
    var s = ReadStream({
        lowWaterMark: 2
    }, function onread(push) {
        calls++
        push("foo", "foo", "foo")
    })
    var calls = 0

    s.read(0)

    assert.equal(calls, 1)

    s.push(null)

    s.pipe(toArray(function (list) {
        assert.equal(calls, 1)
        assert.deepEqual(list, ["foo", "foo", "foo"])
        assert.end()
    }))
})

test("high watermark (pull)", function (assert) {
    // if read() and then below hwm then _read
    // if push() and then below lwm then _read
    var s = ReadStream({
        lowWaterMark: 3
        , highWaterMark: 5
    }, function onread(push) {
        var curCalls = calls
        calls++
        process.nextTick(function () {
            assert.equal(calls, curCalls + 1)
            var length = s._readableState.buffer.length
            push("42")
            // if we are below lwm then pushing increments calls
            // immediately because onread is called
            if (length === 2) {
                assert.equal(calls, curCalls + 2)
            }
        })
    })
    var calls = 0

    s.push("1", "2", "3", "4", "5", "6", "7", "8")

    var v = s.read()

    assert.equal(calls, 0)
    assert.equal(v, "1")

    var v2 = s.read()

    assert.equal(calls, 0)
    assert.equal(v2, "2")

    // reading the third chunk drops the buffer to lenght 5
    // which invokes _read thus calls === 1
    var v3 = s.read()

    assert.equal(calls, 1)
    assert.equal(v3, "3")
    assert.equal(s._readableState.buffer.length, 5)

    process.nextTick(function () {
        assert.equal(s._readableState.buffer.length, 6)
        assert.equal(calls, 1)

        // reading the fourth chunk drops the buffer input to
        // length 5 again (it incremented by one because of
        // nextTick). Thus a second call to _read was made
        var v4 = s.read()

        assert.equal(calls, 2)
        assert.equal(v4, "4")

        var v5 = s.read()

        assert.equal(calls, 2)
        assert.equal(v5, "5")

        var v6 = s.read()

        assert.equal(calls, 2)
        assert.equal(v6, "6")

        var v7 = s.read()

        assert.equal(calls, 2)
        assert.equal(v7, "7")

        assert.equal(s._readableState.buffer.length, 2)

        // buffer is now two so when we push into the buffer
        // on the nextTick
        process.nextTick(function () {
            assert.equal(s._readableState.buffer.length, 3)
            assert.equal(calls, 3)
            // Because calls was incremented we will add another
            // item to the buffer on the next tick
            process.nextTick(function () {
                // When we pushed this 4th item, the buffer size
                // went to 4 which > lwm so we didn't increment
                // calls
                assert.equal(s._readableState.buffer.length, 4)
                assert.equal(calls, 3)

                // let's consume the rest of the buffer
                s.pipe(toArray(function (list) {
                    // because we ended the stream by pushing
                    // null, _read was not called again
                    assert.equal(calls, 3)
                    assert.deepEqual(list, ["8", "42", "42", "42"])
                    assert.end()
                }))

                s.push(null)
            })
        })
    })
})

function empty(a) { return a.end() }
