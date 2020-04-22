```js
function encode(string) {
    var code = string.codePointAt().toString(2)
    var codeLength = code.length
    var bytes = Math.ceil(codeLength / 6)
    var String = ''
    var results = []
    if(bytes === 1) {
        results.push(`0${code}`)
    } else {
        for(var i = bytes; i >= 1; i--) {
            if(i === bytes) {
                var placeHolder = '0'.padStart(i + 1, '1')
                var str = code.substr(i * -6,  codeLength - (i - 1)*6).padStart(8 - i - 1, '0')
                results.push(`${placeHolder}${str}`)
            } else {
                results.push(`10${code.substr(i * -6, 6)}`)
              
            }
        }
    }
    return results
}
```