/*global require:true, console:true, alert:true*/
require.config({
    useStrict: true,
    waitSeconds: 200,
    shim: {
        jquery: {
            exports: '$'
        }
    },
    paths: {
        json:         (typeof JSON === "undefined") ? "vendor/json2" : "empty:",
        jquery:       'vendor/jquery-2.0.3.min',
        text:         'vendor/text',
        dot:          'vendor/doT.min'
    }
});

// app view inits router and starts app
require(['app'], function () {});
