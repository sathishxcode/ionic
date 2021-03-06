describe('$ionicSideMenus controller', function() {
  var ctrl;

  var Controller = function(opts) {
    this.el = opts.el;
    this.animateClass = opts.animateClass;
  };
  Controller.prototype = {
    getTranslateX: function() {
      var r = /translate3d\((-?.+)px/;
      var d = r.exec(this.el.style.webkitTransform);

      if(d && d.length > 0) {
        return parseFloat(d[1]);
      }
      return 0;
    },
    setTranslateX: function(amount) {
      this.el.style.webkitTransform = 'translate3d(' + amount + 'px, 0, 0)';
    },
    enableAnimation: function() {
      this.el.classList.add(this.animateClass);
    },
    disableAnimation: function() {
      this.el.classList.remove(this.animateClass);
    }
  };

  beforeEach(module('ionic'));

  beforeEach(function(){

    inject(function($controller, $rootScope) {
      var scope = $rootScope.$new();
      ctrl = $controller('$ionicSideMenus', angular.extend({
        $scope: scope,
        $attrs: {}
      }, {}));
      angular.extend(ctrl, {});
      ctrl.left = new ionic.views.SideMenu({
        width: 270,
        el: document.createElement('div'),
        isEnabled: true
      });
      ctrl.right = new ionic.views.SideMenu({
        width: 270,
        el: document.createElement('div'),
        isEnabled: true
      });
      ctrl.setContent(new Controller({ el: document.createElement('div') }));
    });

  });

  // Menu enable/disable
  it('should set enabled/disabled', function() {
    ctrl.left.setIsEnabled(false);
    ctrl.right.setIsEnabled(false);
    expect(ctrl.left.isEnabled).toEqual(false);
    expect(ctrl.right.isEnabled).toEqual(false);
    ctrl.left.setIsEnabled(true);
    ctrl.right.setIsEnabled(true);
    expect(ctrl.left.isEnabled).toEqual(true);
    expect(ctrl.right.isEnabled).toEqual(true);
  });

  // Menu widths
  it('should init widths', function() {
    expect(ctrl.left.width).toEqual(270);
    expect(ctrl.right.width).toEqual(270);
  });

  it('should have amount and percentage correct', function() {
    ctrl.openAmount(ctrl.left.width/2);
    expect(ctrl.getOpenAmount()).toEqual(ctrl.left.width/2);
    expect(ctrl.getOpenPercentage()).toEqual(50);

    ctrl.openAmount(ctrl.left.width/4);
    expect(ctrl.getOpenAmount()).toEqual(ctrl.left.width/4);
    expect(ctrl.getOpenPercentage()).toEqual(25);

    ctrl.openAmount(-ctrl.right.width/2);
    expect(ctrl.getOpenAmount()).toEqual(-ctrl.right.width/2);
    expect(ctrl.getOpenPercentage()).toEqual(-50);
  });

  // Open
  it('should toggle left', function() {
    ctrl.toggleLeft();
    expect(ctrl.getOpenPercentage()).toEqual(100);
    ctrl.toggleLeft();
    expect(ctrl.getOpenPercentage()).toEqual(0);
    ctrl.toggleLeft();
    expect(ctrl.getOpenPercentage()).toEqual(100);
    ctrl.toggleLeft();
    expect(ctrl.getOpenPercentage()).toEqual(0);
  });

  it('should toggle right', function() {
    ctrl.toggleRight();
    expect(ctrl.getOpenPercentage()).toEqual(-100);
    ctrl.toggleRight();
    expect(ctrl.getOpenPercentage()).toEqual(0);
    ctrl.toggleRight();
    expect(ctrl.getOpenPercentage()).toEqual(-100);
    ctrl.toggleRight();
    expect(ctrl.getOpenPercentage()).toEqual(0);
  });

  it('should isOpen', function() {
    expect(ctrl.isOpen()).toEqual(false);
    ctrl.toggleLeft();
    expect(ctrl.isOpen()).toEqual(true);
    ctrl.toggleLeft();
    expect(ctrl.isOpen()).toEqual(false);
    ctrl.toggleLeft();
    expect(ctrl.isOpen()).toEqual(true);
    ctrl.toggleLeft();

    expect(ctrl.isOpen()).toEqual(false);
    ctrl.toggleRight();
    expect(ctrl.isOpen()).toEqual(true);
    ctrl.toggleRight();
    expect(ctrl.isOpen()).toEqual(false);
    ctrl.toggleRight();
    expect(ctrl.isOpen()).toEqual(true);
  });


  it('should isOpenLeft', function() {
    expect(ctrl.isOpenLeft()).toEqual(false);
    ctrl.toggleLeft();
    expect(ctrl.isOpenLeft()).toEqual(true);
    ctrl.toggleLeft();
    expect(ctrl.isOpenLeft()).toEqual(false);
    ctrl.toggleLeft();
    expect(ctrl.isOpenLeft()).toEqual(true);
  });

  it('should isOpenRight', function() {
    expect(ctrl.isOpenRight()).toEqual(false);
    ctrl.toggleRight();
    expect(ctrl.isOpenRight()).toEqual(true);
    ctrl.toggleRight();
    expect(ctrl.isOpenRight()).toEqual(false);
    ctrl.toggleRight();
    expect(ctrl.isOpenRight()).toEqual(true);
  });

  // Snap
  it('should snap', function() {

    // Center to right, Going right, less than half, too slow (snap back)
    ctrl.openAmount(10);
    ctrl.snapToRest({
      gesture: {
        velocityX: 0,
        direction: 'right'
      }
    });
    expect(ctrl.getOpenPercentage()).toEqual(0);

    // Right to left, Going left, more than half, too slow (snap back)
    ctrl.openPercentage(51);
    ctrl.snapToRest({
      gesture: {
        velocityX: 0,
        direction: 'left'
      }
    });
    expect(ctrl.getOpenPercentage()).toEqual(100);

    // Right to left, Going left, less than half, too slow (snap back)
    ctrl.openAmount(10);
    ctrl.snapToRest({
      gesture: {
        velocityX: 0,
        direction: 'left'
      }
    });
    expect(ctrl.getOpenPercentage()).toEqual(0);

    // Left to right, Going right, more than half, too slow (snap back)
    ctrl.openPercentage(-51);
    ctrl.snapToRest({
      gesture: {
        velocityX: 0,
        direction: 'right'
      }
    });
    expect(ctrl.getOpenPercentage()).toEqual(-100);

    // Going right, more than half, or quickly (snap open)
    ctrl.openPercentage(-51);
    ctrl.snapToRest({
      gesture: {
        velocityX: 1,
        direction: 'right'
      }
    });
    expect(ctrl.getOpenPercentage()).toEqual(0);

    // Going left, more than half, or quickly (snap open)
    ctrl.openPercentage(-51);
    ctrl.snapToRest({
      gesture: {
        velocityX: 1,
        direction: 'left'
      }
    });
    expect(ctrl.getOpenPercentage()).toEqual(-100);
  });

  it('Should test content drag events', function() {
  });

  it('should register with backButton on open and dereg on close', inject(function($ionicPlatform) {
    var openAmount = 0;
    var deregSpy = jasmine.createSpy('deregister');
    spyOn($ionicPlatform, 'registerBackButtonAction').andReturn(deregSpy);

    spyOn(ctrl, 'getOpenAmount').andCallFake(function() { return openAmount; });

    expect($ionicPlatform.registerBackButtonAction).not.toHaveBeenCalled();
    openAmount = 1;
    ctrl.$scope.$apply();
    expect($ionicPlatform.registerBackButtonAction).toHaveBeenCalledWith(
      jasmine.any(Function),
      PLATFORM_BACK_BUTTON_PRIORITY_SIDE_MENU
    );
    expect(deregSpy).not.toHaveBeenCalled();
    openAmount = 0;
    ctrl.$scope.$apply();
    expect(deregSpy).toHaveBeenCalled();
  }));

  it('should deregister back button action on $destroy', inject(function($ionicPlatform) {
    var openAmount = 0;
    var deregSpy = jasmine.createSpy('deregister');
    spyOn($ionicPlatform, 'registerBackButtonAction').andReturn(deregSpy);

    spyOn(ctrl, 'getOpenAmount').andCallFake(function() { return openAmount; });

    expect($ionicPlatform.registerBackButtonAction).not.toHaveBeenCalled();
    openAmount = 1;
    ctrl.$scope.$apply();
    expect(deregSpy).not.toHaveBeenCalled();
    ctrl.$scope.$destroy();
    expect(deregSpy).toHaveBeenCalled();
  }));
});
