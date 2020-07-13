/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var CouponCtrlStub = {
  index: 'CouponCtrl.index',
  show: 'CouponCtrl.show',
  create: 'CouponCtrl.create',
  upsert: 'CouponCtrl.upsert',
  patch: 'CouponCtrl.patch',
  destroy: 'CouponCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var CouponIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './Coupon.controller': CouponCtrlStub
});

describe('Coupon API Router:', function() {
  it('should return an express router instance', function() {
    CouponIndex.should.equal(routerStub);
  });

  describe('GET /api/Coupons', function() {
    it('should route to Coupon.controller.index', function() {
      routerStub.get
        .withArgs('/', 'CouponCtrl.index')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/Coupons/:id', function() {
    it('should route to Coupon.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'CouponCtrl.show')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/Coupons', function() {
    it('should route to Coupon.controller.create', function() {
      routerStub.post
        .withArgs('/', 'CouponCtrl.create')
        .should.have.been.calledOnce;
    });
  });

  describe('PUT /api/Coupons/:id', function() {
    it('should route to Coupon.controller.upsert', function() {
      routerStub.put
        .withArgs('/:id', 'CouponCtrl.upsert')
        .should.have.been.calledOnce;
    });
  });

  describe('PATCH /api/Coupons/:id', function() {
    it('should route to Coupon.controller.patch', function() {
      routerStub.patch
        .withArgs('/:id', 'CouponCtrl.patch')
        .should.have.been.calledOnce;
    });
  });

  describe('DELETE /api/Coupons/:id', function() {
    it('should route to Coupon.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'CouponCtrl.destroy')
        .should.have.been.calledOnce;
    });
  });
});
