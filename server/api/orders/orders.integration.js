/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newOrders;

describe('Orders API:', function() {
  describe('GET /api/orders', function() {
    var orderss;

    beforeEach(function(done) {
      request(app)
        .get('/api/orders')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          orderss = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      orderss.should.be.instanceOf(Array);
    });
  });

  describe('POST /api/orders', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/orders')
        .send({
          name: 'New Orders',
          info: 'This is the brand new orders!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newOrders = res.body;
          done();
        });
    });

    it('should respond with the newly created orders', function() {
      newOrders.name.should.equal('New Orders');
      newOrders.info.should.equal('This is the brand new orders!!!');
    });
  });

  describe('GET /api/orders/:id', function() {
    var orders;

    beforeEach(function(done) {
      request(app)
        .get(`/api/orders/${newOrders._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          orders = res.body;
          done();
        });
    });

    afterEach(function() {
      orders = {};
    });

    it('should respond with the requested orders', function() {
      orders.name.should.equal('New Orders');
      orders.info.should.equal('This is the brand new orders!!!');
    });
  });

  describe('PUT /api/orders/:id', function() {
    var updatedOrders;

    beforeEach(function(done) {
      request(app)
        .put(`/api/orders/${newOrders._id}`)
        .send({
          name: 'Updated Orders',
          info: 'This is the updated orders!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedOrders = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedOrders = {};
    });

    it('should respond with the updated orders', function() {
      updatedOrders.name.should.equal('Updated Orders');
      updatedOrders.info.should.equal('This is the updated orders!!!');
    });

    it('should respond with the updated orders on a subsequent GET', function(done) {
      request(app)
        .get(`/api/orders/${newOrders._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let orders = res.body;

          orders.name.should.equal('Updated Orders');
          orders.info.should.equal('This is the updated orders!!!');

          done();
        });
    });
  });

  describe('PATCH /api/orders/:id', function() {
    var patchedOrders;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/orders/${newOrders._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Orders' },
          { op: 'replace', path: '/info', value: 'This is the patched orders!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedOrders = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedOrders = {};
    });

    it('should respond with the patched orders', function() {
      patchedOrders.name.should.equal('Patched Orders');
      patchedOrders.info.should.equal('This is the patched orders!!!');
    });
  });

  describe('DELETE /api/orders/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/orders/${newOrders._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when orders does not exist', function(done) {
      request(app)
        .delete(`/api/orders/${newOrders._id}`)
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
