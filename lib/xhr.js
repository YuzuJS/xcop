"use strict";

var Q = require("q");
var jSessionId=null;

function xhr(request) {
    var deferred = Q.defer();
    var xhr = new XMLHttpRequest();

    if (typeof request === "string") {
        request = { url: request };
    }

    var isAsync = !request.synchronousCall;
    if(jSessionId != null && jSessionId != '' && request.url.indexOf(';jsessionid='+jSessionId) == -1){
        if(request.url.indexOf('?') != -1){
            request.url=request.url.replace('?',';jsessionid='+jSessionId+'?');
        }else{
            request.url=request.url+';jsessionid='+jSessionId;
        }
    }

    xhr.open(request.method || 'GET', request.url, isAsync);
    Object.keys(request.headers || {}).forEach(function (key) {
        xhr.setRequestHeader(key, request.headers[key]);
    });

    xhr.onload = function () {
        var headers = {};
        var htext = xhr.getAllResponseHeaders();
        htext.split(/\r?\n/).forEach(function (line) { // Some servers use "\n" and some use "\r\n".
            var m = /^([^\s]*)\s*:\s*(.*)/.exec(line);
            if (m) {
                headers[m[1].toLowerCase()] = m[2];
            }
        });
        var response = { status: xhr.status, body: xhr.responseText, headers: headers };
        try{
            var pBody=JSON.parse(response.body);
            if(typeof pBody === 'object' && pBody != null && pBody.sessionId != null){
                jSessionId=pBody.sessionId;
            }
            console.log(JSON.parse(response.body).sessionId);
        }catch(error){
            console.log('error while sending xhr request',error);
        }
        deferred.resolve(response);
    };

    xhr.onerror = function (err) {
        deferred.reject(new Error("XCOP XMLHttpRequest Error"));
    };

    xhr.send(request.body);
    return deferred.promise;
}
xhr.destroy = function () { };

module.exports = xhr;
