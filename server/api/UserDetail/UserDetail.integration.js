/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newUserDetail;

describe('UserDetail API:', function() {
  describe('GET /api/UserDetails', function() {
    var UserDetails;

    beforeEach(function(done) {
      request(app)
        .get('/api/UserDetails')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          UserDetails = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      UserDetails.should.be.instanceOf(Array);
    });
  });

  describe('POST /api/UserDetails', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/UserDetails')
        .send({
          name: 'New UserDetail',
          info: 'This is the brand new UserDetail!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newUserDetail = res.body;
          done();
        });
    });

    it('should respond with the newly created UserDetail', function() {
      newUserDetail.name.should.equal('New UserDetail');
      newUserDetail.info.should.equal('This is the brand new UserDetail!!!');
    });
  });

  describe('GET /api/UserDetails/:id', function() {
    var UserDetail;

    beforeEach(function(done) {
      request(app)
        .get(`/api/UserDetails/${newUserDetail._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          UserDetail = res.body;
          done();
        });
    });

    afterEach(function() {
      UserDetail = {};
    });

    it('should respond with the requested UserDetail', function() {
      UserDetail.name.should.equal('New UserDetail');
      UserDetail.info.should.equal('This is the brand new UserDetail!!!');
    });
  });

  describe('PUT /api/UserDetails/:id', function() {
    var updatedUserDetail;

    beforeEach(function(done) {
      request(app)
        .put(`/api/UserDetails/${newUserDetail._id}`)
        .send({
          name: 'Updated UserDetail',
          info: 'This is the updated UserDetail!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedUserDetail = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedUserDetail = {};
    });

    it('should respond with the updated UserDetail', function() {
      updatedUserDetail.name.should.equal('Updated UserDetail');
      updatedUserDetail.info.should.equal('This is the updated UserDetail!!!');
    });

    it('should respond with the updated UserDetail on a subsequent GET', function(done) {
      request(app)
        .get(`/api/UserDetails/${newUserDetail._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let UserDetail = res.body;

          UserDetail.name.should.equal('Updated UserDetail');
          UserDetail.info.should.equal('This is the updated UserDetail!!!');

          done();
        });
    });
  });

  describe('PATCH /api/UserDetails/:id', function() {
    var patchedUserDetail;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/UserDetails/${newUserDetail._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched UserDetail' },
          { op: 'replace', path: '/info', value: 'This is the patched UserDetail!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedUserDetail = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedUserDetail = {};
    });

    it('should respond with the patched UserDetail', function() {
      patchedUserDetail.name.should.equal('Patched UserDetail');
      patchedUserDetail.info.should.equal('This is the patched UserDetail!!!');
    });
  });

  describe('DELETE /api/UserDetails/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/UserDetails/${newUserDetail._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when UserDetail does not exist', function(done) {
      request(app)
        .delete(`/api/UserDetails/${newUserDetail._id}`)
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
