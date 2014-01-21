var debug = require('debug')('thuck')

var Transform = require('stream').Transform
  , inherits = require('util').inherits
  , assert = require('assert')

module.exports = Thuck
inherits(Thuck, Transform)

function Thuck (flag, options) {
  if (!(this instanceof Thuck)) {
    return new Thuck(flag, options)
  }

  flag = parseInt(flag)
  if (isNaN(flag) || flag < 0 || flag > 0xff) {
    throw new Error('flag should be a integer from 0 to 255.')
  }

  Transform.call(this, options)

  this.flag = flag
  this.reset()

  debug('initialized with flag %s', flag)
}

Thuck.prototype._transform = function (chunk, encoding, done) {
  if (this._collecting) {
    var remains = this._totalLength - this._collectedLength

    if (chunk.length > remains) {
      debug('received %s, collected ending %s, next %s',
        chunk.length, remains, chunk.length - remains)
      this._collected.push(chunk.slice(0, remains))
      this.push(Buffer.concat(this._collected))
      this.reset()
      return this._transform(chunk.slice(remains), encoding, done)
    } else if (chunk.length === remains) {
      debug('collected ending %s', chunk.length)
      this._collected.push(chunk)
      this.push(Buffer.concat(this._collected))
      this.reset()
      return done()
    } else {
      debug('collected %s, remains %s', chunk.length, remains)
      this._collected.push(chunk)
      this._collectedLength += chunk.length
      return done()
    }
  } else {
    if (chunk.length >= 5 && chunk[0] === this.flag) {
      this._collecting = true
      this._collected = []
      this._collectedLength = 0
      this._totalLength = chunk.readUInt32LE(1)
      debug('start collecting with total size %s', this._totalLength)
      return this._transform(chunk.slice(5), encoding, done)
    }
  }
}

Thuck.prototype.reset = function () {
  this._collecting = false
  this._collected = []
  this._collectedLength = 0
  this._totalLength = 0
  debug('properties reseted')
}
