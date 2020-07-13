/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newCoupon;

describe('Coupon API:', function() {
  describe('GET /api/Coupons', function() {
    var Coupons;

    beforeEach(function(done) {
      request(app)
        .get('/api/Coupons')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          Coupons = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      Coupons.should.be.instanceOf(Array);
    });
  });

  describe('POST /api/Coupons', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/Coupons')
        .send({
          name: 'New Coupon',
          info: 'This is the brand new Coupon!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newCoupon = res.body;
          done();
        });
    });

    it('should respond with the newly created Coupon', function() {
      newCoupon.name.should.equal('New Coupon');
      newCoupon.info.should.equal('This is the brand new Coupon!!!');
    });
  });

  describe('GET /api/Coupons/:id', function() {
    var Coupon;

    beforeEach(function(done) {
      request(app)
        .get(`/api/Coupons/${newCoupon._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          Coupon = res.body;
          done();
        });
    });

    afterEach(function() {
      Coupon = {};
    });

    it('should respond with the requested Coupon', function() {
      Coupon.name.should.equal('New Coupon');
      Coupon.info.should.equal('This is the brand new Coupon!!!');
    });
  });

  describe('PUT /api/Coupons/:id', function() {
    var updatedCoupon;

    beforeEach(function(done) {
      request(app)
        .put(`/api/Coupons/${newCoupon._id}`)
        .send({
          name: 'Updated Coupon',
          info: 'This is the updated Coupon!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedCoupon = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedCoupon = {};
    });

    it('should respond with the updated Coupon', function() {
      updatedCoupon.name.should.equal('Updated Coupon');
      updatedCoupon.info.should.equal('This is the updated Coupon!!!');
    });

    it('should respond with the updated Coupon on a subsequent GET', function(done) {
      request(app)
        .get(`/api/Coupons/${newCoupon._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let Coupon = res.body;

          Coupon.name.should.equal('Updated Coupon');
          Coupon.info.should.equal('This is the updated Coupon!!!');

          done();
        });
    });
  });

  describe('PATCH /api/Coupons/:id', function() {
    var patchedCoupon;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/Coupons/${newCoupon._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Coupon' },
          { op: 'replace', path: '/info', value: 'This is the patched Coupon!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedCoupon = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedCoupon = {};
    });

    it('should respond with the patched Coupon', function() {
      patchedCoupon.name.should.equal('Patched Coupon');
      patchedCoupon.info.should.equal('This is the patched Coupon!!!');
    });
  });

  describe('DELETE /api/Coupons/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/Coupons/${newCoupon._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when Coupon does not exist', function(done) {
      request(app)
        .delete(`/api/Coupons/${newCoupon._id}`)
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
