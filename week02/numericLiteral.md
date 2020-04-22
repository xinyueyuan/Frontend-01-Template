### Number Literals

DecimalDigit
```js
/[0-9]/
```

NonZeroDigit
```js
/[1-9]/
```

DecimalDigits
```js
/[0-9]*/
```

ExponentIndicator
```js
/[e|E]/
```

SignedInteger
```js
/[+|-]?[0-9]*/
```

ExponentPart
```js
/[e|E][+|-]?[0-9]*/
```

DecimalIntegerLiteral
```js
/^(0|([1-9][0-9]*)$/
```

十进制
```js
/^(0|([1-9]\d*)?)+([\.]\d*([e|E][+|-]?\d+)*)?$/
```

二进制
```js
/^(0[bB][01]+)$/
```

八进制
```js
/^(0[oO][0-7]+)$/
```

十六进制
```js
/^(0[xX][0-9a-fA-F]+)$/
```

Numeric Literal
```js
/^(0|([1-9]\d*)?)+([\.]\d*([e|E][+|-]?\d+)*)?$|^(0[bB][01]+)$|^(0[oO][0-7]+)$|^(0[xX][0-9a-fA-F]+)$/
```

