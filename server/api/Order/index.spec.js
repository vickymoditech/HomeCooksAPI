/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var OrderCtrlStub = {
  index: 'OrderCtrl.index',
  show: 'OrderCtrl.show',
  create: 'OrderCtrl.create',
  upsert: 'OrderCtrl.upsert',
  patch: 'OrderCtrl.patch',
  destroy: 'OrderCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var OrderIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './Order.controller': OrderCtrlStub
});

describe('Order API Router:', function() {
  it('should return an express router instance', function() {
    OrderIndex.should.equal(routerStub);
  });

  describe('GET /api/Orders', function() {
    it('should route to Order.controller.index', function() {
      routerStub.get
        .withArgs('/', 'OrderCtrl.index')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/Orders/:id', function() {
    it('should route to Order.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'OrderCtrl.show')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/Orders', function() {
    it('should route to Order.controller.create', function() {
      routerStub.post
        .withArgs('/', 'OrderCtrl.create')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/Orders/:id', function() {
    it('should route to Order.controller.upsert', function() {
      routerStub.put
        .withArgs('/:id', 'OrderCtrl.upsert')
        .should.have.been.calledOnce;
    });
  });

  describe('PATCH /api/Orders/:id', function() {
    it('should route to Order.controller.patch', function() {
      routerStub.patch
        .withArgs('/:id', 'OrderCtrl.patch')
        .should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/Orders/:id', function() {
    it('should route to Order.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'OrderCtrl.destroy')
        .should.have.been.calledOnce;
    });
  });
});
