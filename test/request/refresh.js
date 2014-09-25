
var fs = require('fs'),
    path = require('path');
var should = require('should');
var purest = require('../../lib/provider'),
    providers = require('../../config/providers');


describe('refresh', function () {
    require('../utils/credentials');
    var cred = {
        app:require('../../config/app'),
        user:require('../../config/user')
    };
    var refresh = require('../utils/refresh');
    var p = {};
    before(function () {
        for (var name in providers) {
            var provider = providers[name];
            p[name] = new purest(provider.oauth
                ? {provider:name, key:cred.app[name].key, secret:cred.app[name].secret}
                : {provider:name});
        }
    });

    it('no refresh method', function () {
        try {
            p.twitter.refresh();
        } catch (err) {
            err.message.should.equal(
                "Property 'refresh' of object #<Provider> is not a function");
        }
    });
    // https://developer.yahoo.com/oauth/guide/oauth-refreshaccesstoken.html
    it('yahoo', function (done) {
        p.yahoo.refresh(
            cred.app.yahoo,
            cred.user.yahoo,
            {oauth_session_handle:cred.user.yahoo.session},
        function (err, res, body) {
            debugger;
            if (err) return error(err, done);
            should.deepEqual(Object.keys(body), [
                'oauth_token', 'oauth_token_secret', 'oauth_expires_in',
                'oauth_session_handle', 'oauth_authorization_expires_in',
                'xoauth_yahoo_guid'
            ]);
            body.oauth_token.should.be.type('string');
            body.oauth_token_secret.should.be.type('string');
            body.oauth_expires_in.should.equal('3600');
            body.oauth_session_handle.should.be.type('string');
            done();
        });
    });
    // https://github.com/Asana/oauth-examples#token-exchange-endpoint
    it('asana', function (done) {
        p.asana.refresh(
            cred.app.asana,
            cred.user.asana.refresh,
        function (err, res, body) {
            debugger;
            if (err) return error(err, done);
            should.deepEqual(Object.keys(body), [
                'access_token', 'token_type', 'expires_in', 'data'
            ]);
            body.access_token.should.be.type('string');
            body.token_type.should.equal('bearer');
            body.expires_in.should.equal(3600);
            done();
        });
    });
    // https://devcenter.heroku.com/articles/oauth#token-refresh
    it('heroku', function (done) {
        p.heroku.refresh(
            cred.app.heroku,
            cred.user.heroku.refresh,
        function (err, res, body) {
            debugger;
            if (err) return error(err, done);
            should.deepEqual(Object.keys(body), [
                'access_token', 'expires_in', 'refresh_token',
                'token_type', 'user_id', 'session_nonce'
            ]);
            body.access_token.should.be.type('string');
            body.refresh_token.should.be.type('string');
            body.token_type.should.equal('Bearer');
            body.expires_in.should.equal(7199);
            done();
        });
    });
    // https://developers.google.com/accounts/docs/OAuth2WebServer?hl=fr#refresh
    it('google', function (done) {
        p.google.refresh(
            cred.app.google,
            cred.user.google.refresh,
        function (err, res, body) {
            debugger;
            if (err) return error(err, done);
            should.deepEqual(Object.keys(body), [
                'access_token', 'token_type', 'expires_in', 'id_token'
            ]);
            body.access_token.should.be.type('string');
            body.token_type.should.equal('Bearer');
            body.expires_in.should.equal(3600);
            done();
        });
    });
    // https://developers.box.com/docs/#oauth-2-token
    describe('box', function () {
        var _body = null;
        it('refresh', function (done) {
            p.box.refresh(
                cred.app.box,
                cred.user.box.refresh,
            function (err, res, body) {
                debugger;
                if (err) return error(err, done);
                should.deepEqual(Object.keys(body), [
                    'access_token', 'expires_in', 'restricted_to',
                    'refresh_token', 'token_type'
                ]);
                body.access_token.should.be.type('string');
                body.refresh_token.should.be.type('string');
                body.token_type.should.equal('bearer');
                _body = body;
                done();
            });
        });
        after(function () {
            refresh.store('box', _body.refresh_token);
        });
    });
});

function error (err, done) {
    return (err instanceof Error)
        ? done(err)
        : (console.log(err) || done(new Error('Network error!')));
}