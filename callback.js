var ReadStream = require("./index")

module.exports = callback

function callback(options, generator) {
    if (typeof options === "function") {
        generator = options
        options = null
    }

    return ReadStream(options, function (push, cb) {
        generator(cb)
    })
}
