var test = require("tape")
var setTimeout = require("timers").setTimeout

var callback = require("../callback")
var toArray = require("./utils/toArray")

test("callback api", function (assert) {
    var stream = callback(function (cb) {
        setTimeout(function () {
            cb(null, "some result")
        })
    })

    stream.pipe(toArray(function (list) {
        assert.deepEqual(list, ["some result"])
        assert.end()
    }))
})
