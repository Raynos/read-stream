var test = require("tape")

var PushSource = require("./sources/push")
var ReadStream = require("../index")
var toArray = require("./utils/toArray")

test("push stream", function (assert) {
    var source = PushSource([1, 2, 3, 4])
    var s = ReadStream(function onread(push, cb) {
        source.readStart()
    })

    source.ondata = function (chunk) {
        var needsMore = s.push(chunk)

        if (!needsMore) {
            source.readStop()
        }
    }

    s.pipe(toArray(function (list) {
        assert.deepEqual(list, [1, 2, 3, 4])
        assert.end()
    }))
})

test("push stream (backpressure)", function (assert) {
    var source = PushSource([1, 2, 3, 4, 5, 6, 7, 8], true)
    var s = ReadStream({
        highWaterMark: 4
    }, function onread() {
        source.readStart()
    })

    source.ondata = function (chunk) {
        var needsMore = s.push(chunk)

        if (!needsMore) {
            source.readStop()
        }
    }
    var state = s._readableState

    s.read(0)
    assert.equal(state.length, 4)

    s.once("readable", function () {
        assert.ok(true)
        assert.end()
    })
})

test("high watermark (push)", function (assert) {
    var s = ReadStream({
        highWaterMark: 6
    })

    for (var i = 0; i < 6; i++) {
        var needsMore = s.push(i)
        assert.equal(needsMore, i === 5 ? false : true)
    }

    assert.end()
})

test("low watermark (push)", function (assert) {
    var called = 0
    var reading = 0
    var s = ReadStream({
        lowWaterMark: 3
        , highWaterMark: 6
    }, function onread(push) {
        called++

        if (reading) {
            assert.equal(s.push(42), false)
        }
    })

    // when push() and length <= lwm then called++
    assert.equal(called, 0)
    assert.equal(s.push(0), true)
    assert.equal(called, 1)
    assert.equal(s.push(1), true)
    assert.equal(called, 2)
    assert.equal(s.push(2), true)
    assert.equal(called, 3)
    assert.equal(s.push(3), true)
    assert.equal(called, 3)
    assert.equal(s.push(4), true)
    assert.equal(called, 3)
    // when push() and length >= hwm then returned false
    assert.equal(s.push(5), false)
    assert.equal(called, 3)
    assert.equal(s.push(6), false)
    assert.equal(called, 3)
    s.push(7, 8)
    assert.equal(called, 3)
    assert.deepEqual(s._readableState.buffer, [0, 1, 2, 3, 4, 5, 6, 7, 8])

    reading = true

    assert.equal(s.read(), 0)
    assert.equal(called, 3)
    assert.equal(s.read(), 1)
    assert.equal(called, 3)
    // when read() and length <= hwm then called++
    assert.equal(s.read(), 2)
    assert.equal(called, 4)
    // length is 6 when s.read() finished, but length became 7
    // when _read was called and the value 42 was pushed in
    assert.equal(s._readableState.length, 7)
    assert.equal(s._readableState.buffer[6], 42)
    assert.equal(s.read(), 3)
    assert.equal(called, 5)
    assert.equal(s.read(), 4)
    assert.equal(called, 6)
    s.push(null)
    // when we push in `null` then s.read() does not call _read
    // because this stream is ended so don't call _read
    assert.equal(s.read(), 5)
    assert.equal(called, 6)

    s.pipe(toArray(function (array) {
        assert.deepEqual(array, [6, 7, 8, 42, 42, 42])
        assert.end()
    }))
})

function empty(a) { return a.end() }
