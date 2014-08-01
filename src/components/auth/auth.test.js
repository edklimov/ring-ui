describe('auth', function () {
  var Auth = require('./auth');
  var $ = require('jquery');

  var callNew = function (constructor) {
    var args = Array.prototype.slice.call(arguments, 1);
    return function () {
      function F() {
        return constructor.apply(this, args);
      }

      F.prototype = constructor.prototype;
      return new F();
    };
  };


  beforeEach(function () {
  });

  describe('init', function () {
    it('should provide config', function () {
      expect(callNew(Auth)).toThrow(new Error('Config is required'));
      expect(callNew(Auth, {})).toThrow(new Error('Property serverUri is required'));
      expect(callNew(Auth, {serverUri: ''})).toThrow(new Error('Property serverUri is required'));
    });
    it('should fix serverUri', function () {
      expect(new Auth({serverUri: 'http://localhost'}).config.serverUri).toEqual('http://localhost/');
      expect(new Auth({serverUri: '.'}).config.serverUri).toEqual('./');
    });
    it('should add defaults', function () {
      var config = {
        serverUri: 'http://localhost/'
      };
      expect(new Auth(config).config).toEqual($.extend({}, Auth.DEFAULT_CONFIG, config));

      config.redirect_uri = 'http://redirect.to';
      config.client_id = '7-7-7-7-7';
      expect(new Auth(config).config).toEqual($.extend({}, Auth.DEFAULT_CONFIG, config));

      config.redirect_uri = 'http://redirect.to';
      config.client_id = '7-7-7-7-7';
      config.scope = ['test', 'test2'];
      expect(new Auth(config).config).toEqual($.extend({scope: ['test1', 'test2', '0-0-0-0-0']}, Auth.DEFAULT_CONFIG, config));
    });
  });

  describe('init should not redirect anywhere', function () {
    beforeEach(function () {
      spyOn(Auth.prototype, 'defaultRedirectHandler').and.callFake(function (url) {
        // do nothing
      });
    });

    it('redirect should not happen on object construction', function() {
      new Auth({'serverUri': 'http://localhost:1214'});
      expect(Auth.prototype.defaultRedirectHandler).not.toHaveBeenCalled();
    });

    it('redircet on init call', function() {
      new Auth({'serverUri': 'http://localhost:1214'}).init();
      var redirectSpy = Auth.prototype.defaultRedirectHandler;
      expect(redirectSpy).toHaveBeenCalled();
      expect(redirectSpy.calls.mostRecent().args[0]).toMatch('http://localhost:1214');
    });
  });

});