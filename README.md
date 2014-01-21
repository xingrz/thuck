thuck
=====

[![Build Status](https://travis-ci.org/xingrz/thuck.png?branch=master)](https://travis-ci.org/xingrz/thuck)
[![Coverage Status](https://coveralls.io/repos/xingrz/thuck/badge.png)](https://coveralls.io/r/xingrz/thuck)
[![Dependency Status](https://david-dm.org/xingrz/thuck.png)](https://david-dm.org/xingrz/thuck)
[![NPM version](https://badge.fury.io/js/thuck.png)](http://badge.fury.io/js/thuck)

[![NPM](https://nodei.co/npm/thuck.png?downloads=true&stars=true)](https://nodei.co/npm/thuck)

A super simple protocol that concats crushed chunks emit by a TCP socket.


## Installation

```
$ npm install thuck
```


## Purpose

The original purpose of this project is that, when we send a bigger data via TCP sockets, the data is crushed by the underlying system into small pieces.

For example, once you "emit" 17KB of data on one side, the other side of the socket may triggers "data" serval times with 1KB chunks each. Then you may need to implement an algorithm to collect these pieces and concat them...

This project do this for you. The only thing you need to do is, send a byte of "flag" (which is defined by you and declare the beginning of the data) and four bytes (a integer) of the length.


## Usage

Say you have a "client", in Java:

```java
public void write(byte[] buffer) throws IOException {
    this.outStream.write(header(0xff, buffer.length))
    this.outStream.write(buffer)
    this.outStream.flush()
}

private static byte[] header(int flag, int length) {
    return new byte[] {
            (byte) flag,
            (byte) ((length & 0xff)),
            (byte) ((length >> 8) & 0xff),
            (byte) ((length >> 16) & 0xff),
            (byte) ((length >>> 24))
    };
}
```

Then on the "server" side, in JavaScript:

```js
var tcp = require('net')
  , thuck = require('thuck')

tcp.createServer(function (socket) {
  var incoming = socket.pipe(thuck(0xff))

  incoming.on('data', function (data) {
    // ...
  })
}).listen(7777)
```


## Shortcoming

The project is not perfect. It just fit my need well but some edge cases have not been considered yet:

- If those 5 bytes of header is crushed?
- If the session is not begins with a packet that starts with that 5-byte-header?
- Packet longer than 4294967295 bytes?

Please let me know your solution!


## Test

```
$ npm test
```


## License

This project is released under the terms of [MIT License](LICENSE).
