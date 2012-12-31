var assert = require("assert")
    , setInterval = require("timers").setInterval
    , clearInterval = require("timers").clearInterval

    , ReadStream = require("..")
    , fromArray = require("../array")
    , createStream = require("./util/createStream")

    , list = []
    , output = createStream(list)

var one = fromArray([1,2,3,4]).pipe(output)

var three = ReadStream()
    , threeCount = 0

var timer = setInterval(function () {
    threeCount++
    if (threeCount < 5) {
        three.push(threeCount)
    } else {
        clearInterval(timer)
        three.end()
        three.stream.once("end", check)
    }
}, 500)

three.stream.pipe(output)

fromArray(["one", "two"]).pipe(output)

process.on("exit", function () {
    console.log("list", list)
})

function check() {
    assert.deepEqual(
        [1, 2, 3, 4, "one", "two", "ended"
            , "ended", 1, 2, 3, 4, "ended"]
        , list
    )
}
