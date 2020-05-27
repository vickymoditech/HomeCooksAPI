/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newOauth;

describe('Oauth API:', function() {
  describe('GET /api/Oauths', function() {
    var Oauths;

    beforeEach(function(done) {
      request(app)
        .get('/api/Oauths')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          Oauths = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      Oauths.should.be.instanceOf(Array);
    });
  });

  describe('POST /api/Oauths', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/Oauths')
        .send({
          name: 'New Oauth',
          info: 'This is the brand new Oauth!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newOauth = res.body;
          done();
        });
    });

    it('should respond with the newly created Oauth', function() {
      newOauth.name.should.equal('New Oauth');
      newOauth.info.should.equal('This is the brand new Oauth!!!');
    });
  });

  describe('GET /api/Oauths/:id', function() {
    var Oauth;

    beforeEach(function(done) {
      request(app)
        .get(`/api/Oauths/${newOauth._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          Oauth = res.body;
          done();
        });
    });

    afterEach(function() {
      Oauth = {};
    });

    it('should respond with the requested Oauth', function() {
      Oauth.name.should.equal('New Oauth');
      Oauth.info.should.equal('This is the brand new Oauth!!!');
    });
  });

  describe('PUT /api/Oauths/:id', function() {
    var updatedOauth;

    beforeEach(function(done) {
      request(app)
        .put(`/api/Oauths/${newOauth._id}`)
        .send({
          name: 'Updated Oauth',
          info: 'This is the updated Oauth!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedOauth = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedOauth = {};
    });

    it('should respond with the updated Oauth', function() {
      updatedOauth.name.should.equal('Updated Oauth');
      updatedOauth.info.should.equal('This is the updated Oauth!!!');
    });

    it('should respond with the updated Oauth on a subsequent GET', function(done) {
      request(app)
        .get(`/api/Oauths/${newOauth._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let Oauth = res.body;

          Oauth.name.should.equal('Updated Oauth');
          Oauth.info.should.equal('This is the updated Oauth!!!');

          done();
        });
    });
  });

  describe('PATCH /api/Oauths/:id', function() {
    var patchedOauth;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/Oauths/${newOauth._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Oauth' },
          { op: 'replace', path: '/info', value: 'This is the patched Oauth!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedOauth = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedOauth = {};
    });

    it('should respond with the patched Oauth', function() {
      patchedOauth.name.should.equal('Patched Oauth');
      patchedOauth.info.should.equal('This is the patched Oauth!!!');
    });
  });

  describe('DELETE /api/Oauths/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/Oauths/${newOauth._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when Oauth does not exist', function(done) {
      request(app)
        .delete(`/api/Oauths/${newOauth._id}`)
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
