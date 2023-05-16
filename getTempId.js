const crypto = require('crypto');
var r = function () {
    var e = "undefined" != typeof crypto && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || "undefined" != typeof msCrypto && "function" == typeof window.msCrypto.getRandomValues && msCrypto.getRandomValues.bind(msCrypto);
    var n = new Uint8Array(16);
    return e(n),
        n
}

var getO = function(t) {
    for (var e = [], n = 0; n < 256; ++n)
        e[n] = (n + 256).toString(16).substr(1);
    return function(t, n) {
        var r = n || 0
          , o = e;
        return [o[t[r++]], o[t[r++]], o[t[r++]], o[t[r++]], "-", o[t[r++]], o[t[r++]], "-", o[t[r++]], o[t[r++]], "-", o[t[r++]], o[t[r++]], "-", o[t[r++]], o[t[r++]], o[t[r++]], o[t[r++]], o[t[r++]], o[t[r++]]].join("")
    }
}
var o = getO();
function get_temp_id(t, e, n) {
    var i = e && n || 0;
    "string" == typeof t && (e = "binary" === t ? new Array(16) : null,
        t = null);
    var a = (t = t || {}).random || (t.rng || r)();
    if (a[6] = 15 & a[6] | 64,
        a[8] = 63 & a[8] | 128,
        e)
        for (var u = 0; u < 16; ++u)
            e[i + u] = a[u];
    return e || o(a)
}
module.exports = {
    get_temp_id
}