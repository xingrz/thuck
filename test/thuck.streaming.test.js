var thuck = require('../')
  , stream = require('stream')
  , inherits = require('util').inherits

function CountingStream (count) {
  stream.Readable.call(this)
  this.chunks = []
  for (var i = 0; i < count; i++) {
    this.chunks[i] = new Buffer(
        Math.floor(0x10 + Math.random() * 0xef).toString(16)
      , 'hex')
  }
  this.whole = Buffer.concat(this.chunks)
}

inherits(CountingStream, stream.Readable)

CountingStream.prototype._read = function () {
  this.push(this.chunks.shift())
}

describe('thuck.streaming.test.js', function () {

  it('should pipe', function (done) {
    var FLAG = 2
      , LENGTH = 24

    var dest = thuck(FLAG)
      , counting = new CountingStream(LENGTH)

    dest.once('data', function (chunk) {
      chunk.toString('hex').should.equal(counting.whole.toString('hex'))
      done()
    })

    var header = new Buffer(5)
    header.writeUInt8(FLAG, 0)
    header.writeUInt32LE(LENGTH, 1)
    dest.write(header)

    counting.pipe(dest)
  })

  it('should write', function (done) {
    var FLAG = 5
      , DATA = 'this is a very long sentence that very very long'

    var dest = thuck(FLAG)

    dest.once('data', function (chunk) {
      chunk.toString('utf8').should.equal(DATA)
      done()
    })

    var buffer = new Buffer(DATA, 'utf8')
      , header = new Buffer(5)
    header.writeUInt8(FLAG, 0)
    header.writeUInt32LE(buffer.length, 1)
    dest.write(header)
    dest.write(buffer)
  })

  it('should write continuously', function (done) {
    var FLAG = 8
      , DATA1_1 = 'this is a very long sen'
      , DATA1_2 = 'tence that very very long'
      , DATA2 = 'this is the other very long sentence'

    var dest = thuck(FLAG)

    var count = 0

    dest.on('data', function (chunk) {
      count++
      if (count == 1) {
        chunk.toString('utf8').should.equal(DATA1_1 + DATA1_2)
      } else if (count == 2) {
        chunk.toString('utf8').should.equal(DATA2)
        done()
      }
    })

    var buffer1_1 = new Buffer(DATA1_1, 'utf8')
      , buffer1_2 = new Buffer(DATA1_2, 'utf8')
      , header1 = new Buffer(5)

    header1.writeUInt8(FLAG, 0)
    header1.writeUInt32LE(buffer1_1.length + buffer1_2.length, 1)

    var buffer2 = new Buffer(DATA2, 'utf8')
      , header2 = new Buffer(5)

    header2.writeUInt8(FLAG, 0)
    header2.writeUInt32LE(buffer2.length, 1)

    dest.write(Buffer.concat([ header1, buffer1_1 ]))
    dest.write(Buffer.concat([ buffer1_2, header2 ]))
    dest.write(buffer2)
  })

  it('should split multiple packet', function (done) {
    var FLAG = 8
      , DATA1 = 'this is a very long sentence that very very long'
      , DATA2 = 'this is the other very long sentence'

    var dest = thuck(FLAG)

    var count = 0

    dest.on('data', function (chunk) {
      count++
      if (count == 1) {
        chunk.toString('utf8').should.equal(DATA1)
      } else if (count == 2) {
        chunk.toString('utf8').should.equal(DATA2)
        done()
      }
    })

    var buffer1 = new Buffer(DATA1, 'utf8')
      , header1 = new Buffer(5)

    header1.writeUInt8(FLAG, 0)
    header1.writeUInt32LE(buffer1.length, 1)

    var buffer2 = new Buffer(DATA2, 'utf8')
      , header2 = new Buffer(5)

    header2.writeUInt8(FLAG, 0)
    header2.writeUInt32LE(buffer2.length, 1)

    dest.write(Buffer.concat([ header1, buffer1, header2, buffer2 ]))
  })

})
