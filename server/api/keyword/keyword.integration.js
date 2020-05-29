/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newKeyword;

describe('Keyword API:', function() {
  describe('GET /api/keywords', function() {
    var keywords;

    beforeEach(function(done) {
      request(app)
        .get('/api/keywords')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          keywords = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      keywords.should.be.instanceOf(Array);
    });
  });

  describe('POST /api/keywords', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/keywords')
        .send({
          name: 'New Keyword',
          info: 'This is the brand new keyword!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newKeyword = res.body;
          done();
        });
    });

    it('should respond with the newly created keyword', function() {
      newKeyword.name.should.equal('New Keyword');
      newKeyword.info.should.equal('This is the brand new keyword!!!');
    });
  });

  describe('GET /api/keywords/:id', function() {
    var keyword;

    beforeEach(function(done) {
      request(app)
        .get(`/api/keywords/${newKeyword._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          keyword = res.body;
          done();
        });
    });

    afterEach(function() {
      keyword = {};
    });

    it('should respond with the requested keyword', function() {
      keyword.name.should.equal('New Keyword');
      keyword.info.should.equal('This is the brand new keyword!!!');
    });
  });

  describe('PUT /api/keywords/:id', function() {
    var updatedKeyword;

    beforeEach(function(done) {
      request(app)
        .put(`/api/keywords/${newKeyword._id}`)
        .send({
          name: 'Updated Keyword',
          info: 'This is the updated keyword!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedKeyword = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedKeyword = {};
    });

    it('should respond with the updated keyword', function() {
      updatedKeyword.name.should.equal('Updated Keyword');
      updatedKeyword.info.should.equal('This is the updated keyword!!!');
    });

    it('should respond with the updated keyword on a subsequent GET', function(done) {
      request(app)
        .get(`/api/keywords/${newKeyword._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let keyword = res.body;

          keyword.name.should.equal('Updated Keyword');
          keyword.info.should.equal('This is the updated keyword!!!');

          done();
        });
    });
  });

  describe('PATCH /api/keywords/:id', function() {
    var patchedKeyword;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/keywords/${newKeyword._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Keyword' },
          { op: 'replace', path: '/info', value: 'This is the patched keyword!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedKeyword = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedKeyword = {};
    });

    it('should respond with the patched keyword', function() {
      patchedKeyword.name.should.equal('Patched Keyword');
      patchedKeyword.info.should.equal('This is the patched keyword!!!');
    });
  });

  describe('DELETE /api/keywords/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/keywords/${newKeyword._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when keyword does not exist', function(done) {
      request(app)
        .delete(`/api/keywords/${newKeyword._id}`)
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
