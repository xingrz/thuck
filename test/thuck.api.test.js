var thuck = require('../')
  , stream = require('stream')

describe('thuck.api.test.js', function () {

  describe('thuck(flag)', function () {
    it('should return new instance of Thuck', function () {
      thuck(2).should.be.an.instanceof(thuck)
    })

    it('should be an instance of stream.Transform', function () {
      thuck(3).should.be.an.instanceof(stream.Transform)
    })

    it('should throw if no flag is specified', function () {
      thuck.bind(this).should.throw()
    })

    it('should throw if flag is not a number', function () {
      thuck.bind(this, 'throw').should.throw()
    })

    it('should throw if flag is not a byte', function () {
      thuck.bind(this, 1234).should.throw()
    })
  })

  describe('thuck.flag', function () {
    it('should be specified by thuck(flag)', function () {
      thuck(152).should.have.property('flag', 152)
    })

    it('should be a parsed integer specified by thuck(flag)', function () {
      thuck('92').should.have.property('flag', 92)
    })
  })

})
