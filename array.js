var Stream = require("./index")

module.exports = fromArray

function fromArray(arr) {
    return Stream(function (push) {
        arr.forEach(function (v) {
            push(v)
        })

        push(null)
    })
}
