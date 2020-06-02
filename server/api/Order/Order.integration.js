/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newOrder;

describe('Order API:', function() {
  describe('GET /api/Orders', function() {
    var Orders;

    beforeEach(function(done) {
      request(app)
        .get('/api/Orders')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          Orders = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      Orders.should.be.instanceOf(Array);
    });
  });

  describe('POST /api/Orders', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/Orders')
        .send({
          name: 'New Order',
          info: 'This is the brand new Order!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newOrder = res.body;
          done();
        });
    });

    it('should respond with the newly created Order', function() {
      newOrder.name.should.equal('New Order');
      newOrder.info.should.equal('This is the brand new Order!!!');
    });
  });

  describe('GET /api/Orders/:id', function() {
    var Order;

    beforeEach(function(done) {
      request(app)
        .get(`/api/Orders/${newOrder._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          Order = res.body;
          done();
        });
    });

    afterEach(function() {
      Order = {};
    });

    it('should respond with the requested Order', function() {
      Order.name.should.equal('New Order');
      Order.info.should.equal('This is the brand new Order!!!');
    });
  });

  describe('PUT /api/Orders/:id', function() {
    var updatedOrder;

    beforeEach(function(done) {
      request(app)
        .put(`/api/Orders/${newOrder._id}`)
        .send({
          name: 'Updated Order',
          info: 'This is the updated Order!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedOrder = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedOrder = {};
    });

    it('should respond with the updated Order', function() {
      updatedOrder.name.should.equal('Updated Order');
      updatedOrder.info.should.equal('This is the updated Order!!!');
    });

    it('should respond with the updated Order on a subsequent GET', function(done) {
      request(app)
        .get(`/api/Orders/${newOrder._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let Order = res.body;

          Order.name.should.equal('Updated Order');
          Order.info.should.equal('This is the updated Order!!!');

          done();
        });
    });
  });

  describe('PATCH /api/Orders/:id', function() {
    var patchedOrder;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/Orders/${newOrder._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Order' },
          { op: 'replace', path: '/info', value: 'This is the patched Order!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedOrder = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedOrder = {};
    });

    it('should respond with the patched Order', function() {
      patchedOrder.name.should.equal('Patched Order');
      patchedOrder.info.should.equal('This is the patched Order!!!');
    });
  });

  describe('DELETE /api/Orders/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/Orders/${newOrder._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when Order does not exist', function(done) {
      request(app)
        .delete(`/api/Orders/${newOrder._id}`)
        .expect(404)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });
  });
});
