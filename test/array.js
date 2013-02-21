var test = require("tape")

var fromArray = require("../array")
var toArray = require("./utils/toArray")

test("can create stream from array", function (assert) {
    var stream = fromArray(["one", "two"])

    stream.pipe(toArray(function (list) {
        assert.deepEqual(list, ["one", "two"])
        assert.end()
    }))
})
