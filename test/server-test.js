let chai = require('chai')
let chaiHttp = require('chai-http')
let app = require('../app')
let should = chai.should()

chai.use(chaiHttp)

describe('EndPoint Testing', () => {
    it('GET / should return 200 status',(done) => {
        chai.request(app)
        .get('/')
        .end((err,res) => {
            res.should.have.status(200)
            done()
        })
    })
})