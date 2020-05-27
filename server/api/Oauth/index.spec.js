/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var OauthCtrlStub = {
  index: 'OauthCtrl.index',
  show: 'OauthCtrl.show',
  create: 'OauthCtrl.create',
  upsert: 'OauthCtrl.upsert',
  patch: 'OauthCtrl.patch',
  destroy: 'OauthCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var OauthIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './Oauth.controller': OauthCtrlStub
});

describe('Oauth API Router:', function() {
  it('should return an express router instance', function() {
    OauthIndex.should.equal(routerStub);
  });

  describe('GET /api/Oauths', function() {
    it('should route to Oauth.controller.index', function() {
      routerStub.get
        .withArgs('/', 'OauthCtrl.index')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/Oauths/:id', function() {
    it('should route to Oauth.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'OauthCtrl.show')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/Oauths', function() {
    it('should route to Oauth.controller.create', function() {
      routerStub.post
        .withArgs('/', 'OauthCtrl.create')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/Oauths/:id', function() {
    it('should route to Oauth.controller.upsert', function() {
      routerStub.put
        .withArgs('/:id', 'OauthCtrl.upsert')
        .should.have.been.calledOnce;
    });
  });

  describe('PATCH /api/Oauths/:id', function() {
    it('should route to Oauth.controller.patch', function() {
      routerStub.patch
        .withArgs('/:id', 'OauthCtrl.patch')
        .should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/Oauths/:id', function() {
    it('should route to Oauth.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'OauthCtrl.destroy')
        .should.have.been.calledOnce;
    });
  });
});
