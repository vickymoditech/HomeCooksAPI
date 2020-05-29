/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var keywordCtrlStub = {
  index: 'keywordCtrl.index',
  show: 'keywordCtrl.show',
  create: 'keywordCtrl.create',
  upsert: 'keywordCtrl.upsert',
  patch: 'keywordCtrl.patch',
  destroy: 'keywordCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var keywordIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './keyword.controller': keywordCtrlStub
});

describe('Keyword API Router:', function() {
  it('should return an express router instance', function() {
    keywordIndex.should.equal(routerStub);
  });

  describe('GET /api/keywords', function() {
    it('should route to keyword.controller.index', function() {
      routerStub.get
        .withArgs('/', 'keywordCtrl.index')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/keywords/:id', function() {
    it('should route to keyword.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'keywordCtrl.show')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/keywords', function() {
    it('should route to keyword.controller.create', function() {
      routerStub.post
        .withArgs('/', 'keywordCtrl.create')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/keywords/:id', function() {
    it('should route to keyword.controller.upsert', function() {
      routerStub.put
        .withArgs('/:id', 'keywordCtrl.upsert')
        .should.have.been.calledOnce;
    });
  });

  describe('PATCH /api/keywords/:id', function() {
    it('should route to keyword.controller.patch', function() {
      routerStub.patch
        .withArgs('/:id', 'keywordCtrl.patch')
        .should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/keywords/:id', function() {
    it('should route to keyword.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'keywordCtrl.destroy')
        .should.have.been.calledOnce;
    });
  });
});
