### String Literals

Hex4Digits
```js
/^[0-9a-fA-F]{4}$/
```

uHex4Digits 
```js
/^u[0-9a-fA-F]{4}$/	
```

u{ CodePoint }
```js
/^u(0?[0-9a-fA-F]?|10)?[0-9a-fA-F]{1,4}$/
```

UnicodeEscapeSequence ::
	u Hex4Digits
	u{ CodePoint }
```js
/^u(0?[0-9a-fA-F]?|10)?[0-9a-fA-F]{1,4}$/
```

HexEscapeSequence
```js
/^x[0-9a-fA-F]{2}$/
```

EscapeCharacter ::
	SingleEscapeCharacter
	DecimalDigit
	x
	u
```js
/^['"\\bfnrtv\dxu]$/
```

LineTerminator
```js
/^[\n\r\u2028\u2029]$/
```

NonEscapeCharacter ::
	SourceCharacter but not one of EscapeCharacter or LineTerminator
```js
/^(?!'"\\bfnrtv\dxu\n\r\u2028\u2029)*$/
```

CharacterEscapeSequence ::
	SingleEscapeCharacter
	NonEscapeCharacter
```js
/^(?!\dxu\n\r\u2028\u2029)*$/
```

EscapeSequence::
	CharacterEscapeSequence
	0 [lookahead ∉ DecimalDigit]
	HexEscapeSequence
	UnicodeEscapeSequence
```js
/^(?!\dxu\n\r\u2028\u2029)*$|^x[0-9a-fA-F]{2}$|^u(0?[0-9a-fA-F]?|10)?[0-9a-fA-F]{1,4}$/
```

SingleStringCharacter::
	SourceCharacter but not one of ' or \ or LineTerminator  
	<LS>
	<PS>
	\ EscapeSequence
	LineContinuation	
```js
/^\\?(?!'\\\dxu)*$|^\\x[0-9a-fA-F]{2}$|^\\u(0?[0-9a-fA-F]?|10)?[0-9a-fA-F]{1,4}$/
```	

SingleStringCharacters
```js
/^(\\?(?!'\\\dxu)*$|^\\x[0-9a-fA-F]{2}$|^\\u(0?[0-9a-fA-F]?|10)?[0-9a-fA-F]{1,4})*$/
```

SingleStringLiteral
```js
/^'(\\?(?!'\\\dxu)*$|^\\x[0-9a-fA-F]{2}$|^\\u(0?[0-9a-fA-F]?|10)?[0-9a-fA-F]{1,4})*'$/
```

DoubleStringLiteral
```js
/^"(\\?(?!"\\\dxu)*$|^\\x[0-9a-fA-F]{2}$|^\\u(0?[0-9a-fA-F]?|10)?[0-9a-fA-F]{1,4})*"$/
```













