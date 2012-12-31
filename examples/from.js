var assert = require("assert")
    , setInterval = require("timers").setInterval
    , clearInterval = require("timers").clearInterval

    , from = require("../from")
    , createStream = require("./util/createStream")

    , list = []
    , output = createStream(list)

from(function (push, end) {
    var count = 0

    var timer = setInterval(function () {
        count++
        if (count < 5) {
            push(count)
        } else {
            clearInterval(timer)
            end()
            this.once("end", check)
        }
    }.bind(this), 500)
}).pipe(output)

function check() {
    assert.deepEqual(
        [1, 2, 3, 4, "ended"]
        , list
    )
}
