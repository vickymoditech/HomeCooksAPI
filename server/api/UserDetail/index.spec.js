/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var UserDetailCtrlStub = {
  index: 'UserDetailCtrl.index',
  show: 'UserDetailCtrl.show',
  create: 'UserDetailCtrl.create',
  upsert: 'UserDetailCtrl.upsert',
  patch: 'UserDetailCtrl.patch',
  destroy: 'UserDetailCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var UserDetailIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './UserDetail.controller': UserDetailCtrlStub
});

describe('UserDetail API Router:', function() {
  it('should return an express router instance', function() {
    UserDetailIndex.should.equal(routerStub);
  });

  describe('GET /api/UserDetails', function() {
    it('should route to UserDetail.controller.index', function() {
      routerStub.get
        .withArgs('/', 'UserDetailCtrl.index')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/UserDetails/:id', function() {
    it('should route to UserDetail.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'UserDetailCtrl.show')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/UserDetails', function() {
    it('should route to UserDetail.controller.create', function() {
      routerStub.post
        .withArgs('/', 'UserDetailCtrl.create')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/UserDetails/:id', function() {
    it('should route to UserDetail.controller.upsert', function() {
      routerStub.put
        .withArgs('/:id', 'UserDetailCtrl.upsert')
        .should.have.been.calledOnce;
    });
  });

  describe('PATCH /api/UserDetails/:id', function() {
    it('should route to UserDetail.controller.patch', function() {
      routerStub.patch
        .withArgs('/:id', 'UserDetailCtrl.patch')
        .should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/UserDetails/:id', function() {
    it('should route to UserDetail.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'UserDetailCtrl.destroy')
        .should.have.been.calledOnce;
    });
  });
});
