!function (e) {
    var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
    function base64encode(str) {
        var out, i, len;
        var c1, c2, c3;
        len = str.length;
        i = 0;
        out = "";
        while (i < len) {
            c1 = str.charCodeAt(i++) & 0xff;
            if (i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt((c1 & 0x3) << 4);
                out += "==";
                break;
            }
            c2 = str.charCodeAt(i++);
            if (i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                out += base64EncodeChars.charAt((c2 & 0xF) << 2);
                out += "=";
                break;
            }
            c3 = str.charCodeAt(i++);
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
            out += base64EncodeChars.charAt(c3 & 0x3F);
        }
        return out;
    }
    function base64decode(str) {
        var c1, c2, c3, c4;
        var i, len, out;
        len = str.length;
        i = 0;
        out = "";
        while (i < len) {
            do {
                c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
            } while (i < len && c1 == -1);
            if (c1 == -1) break;
            do {
                c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
            } while (i < len && c2 == -1);
            if (c2 == -1) break;
            out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
            do {
                c3 = str.charCodeAt(i++) & 0xff;
                if (c3 == 61) return out;
                c3 = base64DecodeChars[c3];
            } while (i < len && c3 == -1);
            if (c3 == -1) break;
            out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
            do {
                c4 = str.charCodeAt(i++) & 0xff;
                if (c4 == 61) return out;
                c4 = base64DecodeChars[c4];
            } while (i < len && c4 == -1);
            if (c4 == -1) break;
            out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
        }
        return out;
    }
    function utf16to8(str) {
        var out, i, len, c;
        out = "";
        len = str.length;
        for (i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                out += str.charAt(i);
            } else if (c > 0x07FF) {
                out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            } else {
                out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            }
        }
        return out;
    }
    function utf8to16(str) {
        var out, i, len, c;
        var char2, char3;
        out = "";
        len = str.length;
        i = 0;
        while (i < len) {
            c = str.charCodeAt(i++);
            switch (c >> 4) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                out += str.charAt(i - 1);
                break;
            case 12:
            case 13:
                char2 = str.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                char2 = str.charCodeAt(i++);
                char3 = str.charCodeAt(i++);
                out += String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
                break;
            }
        }
        return out;
    }
    function CharToHex(str) {
        var out, i, len, c, h;
        out = "";
        len = str.length;
        i = 0;
        while (i < len) {
            c = str.charCodeAt(i++);
            h = c.toString(16);
            if (h.length < 2) h = "0" + h;
            out += "\\x" + h + " ";
            if (i > 0 && i % 8 == 0) out += "\r\n";
        }
        return out;
    }
    this.atob = base64decode, this.btoa = base64encode;
}(this);

function s(t) {
    var n, r = "";
    var e = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
    for (n = 0; n < 4; n += 1)
        r += e[t >> 8 * n + 4 & 15] + e[t >> 8 * n & 15];
    return r
}

function n(t, e) {
    var n = t[0],
        r = t[1],
        i = t[2],
        o = t[3];
    n += (r & i | ~r & o) + e[0] - 680876936 | 0,
        n = (n << 7 | n >>> 25) + r | 0,
        o += (n & r | ~n & i) + e[1] - 389564586 | 0,
        o = (o << 12 | o >>> 20) + n | 0,
        i += (o & n | ~o & r) + e[2] + 606105819 | 0,
        i = (i << 17 | i >>> 15) + o | 0,
        r += (i & o | ~i & n) + e[3] - 1044525330 | 0,
        r = (r << 22 | r >>> 10) + i | 0,
        n += (r & i | ~r & o) + e[4] - 176418897 | 0,
        n = (n << 7 | n >>> 25) + r | 0,
        o += (n & r | ~n & i) + e[5] + 1200080426 | 0,
        o = (o << 12 | o >>> 20) + n | 0,
        i += (o & n | ~o & r) + e[6] - 1473231341 | 0,
        i = (i << 17 | i >>> 15) + o | 0,
        r += (i & o | ~i & n) + e[7] - 45705983 | 0,
        r = (r << 22 | r >>> 10) + i | 0,
        n += (r & i | ~r & o) + e[8] + 1770035416 | 0,
        n = (n << 7 | n >>> 25) + r | 0,
        o += (n & r | ~n & i) + e[9] - 1958414417 | 0,
        o = (o << 12 | o >>> 20) + n | 0,
        i += (o & n | ~o & r) + e[10] - 42063 | 0,
        i = (i << 17 | i >>> 15) + o | 0,
        r += (i & o | ~i & n) + e[11] - 1990404162 | 0,
        r = (r << 22 | r >>> 10) + i | 0,
        n += (r & i | ~r & o) + e[12] + 1804603682 | 0,
        n = (n << 7 | n >>> 25) + r | 0,
        o += (n & r | ~n & i) + e[13] - 40341101 | 0,
        o = (o << 12 | o >>> 20) + n | 0,
        i += (o & n | ~o & r) + e[14] - 1502002290 | 0,
        i = (i << 17 | i >>> 15) + o | 0,
        r += (i & o | ~i & n) + e[15] + 1236535329 | 0,
        r = (r << 22 | r >>> 10) + i | 0,
        n += (r & o | i & ~o) + e[1] - 165796510 | 0,
        n = (n << 5 | n >>> 27) + r | 0,
        o += (n & i | r & ~i) + e[6] - 1069501632 | 0,
        o = (o << 9 | o >>> 23) + n | 0,
        i += (o & r | n & ~r) + e[11] + 643717713 | 0,
        i = (i << 14 | i >>> 18) + o | 0,
        r += (i & n | o & ~n) + e[0] - 373897302 | 0,
        r = (r << 20 | r >>> 12) + i | 0,
        n += (r & o | i & ~o) + e[5] - 701558691 | 0,
        n = (n << 5 | n >>> 27) + r | 0,
        o += (n & i | r & ~i) + e[10] + 38016083 | 0,
        o = (o << 9 | o >>> 23) + n | 0,
        i += (o & r | n & ~r) + e[15] - 660478335 | 0,
        i = (i << 14 | i >>> 18) + o | 0,
        r += (i & n | o & ~n) + e[4] - 405537848 | 0,
        r = (r << 20 | r >>> 12) + i | 0,
        n += (r & o | i & ~o) + e[9] + 568446438 | 0,
        n = (n << 5 | n >>> 27) + r | 0,
        o += (n & i | r & ~i) + e[14] - 1019803690 | 0,
        o = (o << 9 | o >>> 23) + n | 0,
        i += (o & r | n & ~r) + e[3] - 187363961 | 0,
        i = (i << 14 | i >>> 18) + o | 0,
        r += (i & n | o & ~n) + e[8] + 1163531501 | 0,
        r = (r << 20 | r >>> 12) + i | 0,
        n += (r & o | i & ~o) + e[13] - 1444681467 | 0,
        n = (n << 5 | n >>> 27) + r | 0,
        o += (n & i | r & ~i) + e[2] - 51403784 | 0,
        o = (o << 9 | o >>> 23) + n | 0,
        i += (o & r | n & ~r) + e[7] + 1735328473 | 0,
        i = (i << 14 | i >>> 18) + o | 0,
        r += (i & n | o & ~n) + e[12] - 1926607734 | 0,
        r = (r << 20 | r >>> 12) + i | 0,
        n += (r ^ i ^ o) + e[5] - 378558 | 0,
        n = (n << 4 | n >>> 28) + r | 0,
        o += (n ^ r ^ i) + e[8] - 2022574463 | 0,
        o = (o << 11 | o >>> 21) + n | 0,
        i += (o ^ n ^ r) + e[11] + 1839030562 | 0,
        i = (i << 16 | i >>> 16) + o | 0,
        r += (i ^ o ^ n) + e[14] - 35309556 | 0,
        r = (r << 23 | r >>> 9) + i | 0,
        n += (r ^ i ^ o) + e[1] - 1530992060 | 0,
        n = (n << 4 | n >>> 28) + r | 0,
        o += (n ^ r ^ i) + e[4] + 1272893353 | 0,
        o = (o << 11 | o >>> 21) + n | 0,
        i += (o ^ n ^ r) + e[7] - 155497632 | 0,
        i = (i << 16 | i >>> 16) + o | 0,
        r += (i ^ o ^ n) + e[10] - 1094730640 | 0,
        r = (r << 23 | r >>> 9) + i | 0,
        n += (r ^ i ^ o) + e[13] + 681279174 | 0,
        n = (n << 4 | n >>> 28) + r | 0,
        o += (n ^ r ^ i) + e[0] - 358537222 | 0,
        o = (o << 11 | o >>> 21) + n | 0,
        i += (o ^ n ^ r) + e[3] - 722521979 | 0,
        i = (i << 16 | i >>> 16) + o | 0,
        r += (i ^ o ^ n) + e[6] + 76029189 | 0,
        r = (r << 23 | r >>> 9) + i | 0,
        n += (r ^ i ^ o) + e[9] - 640364487 | 0,
        n = (n << 4 | n >>> 28) + r | 0,
        o += (n ^ r ^ i) + e[12] - 421815835 | 0,
        o = (o << 11 | o >>> 21) + n | 0,
        i += (o ^ n ^ r) + e[15] + 530742520 | 0,
        i = (i << 16 | i >>> 16) + o | 0,
        r += (i ^ o ^ n) + e[2] - 995338651 | 0,
        r = (r << 23 | r >>> 9) + i | 0,
        n += (i ^ (r | ~o)) + e[0] - 198630844 | 0,
        n = (n << 6 | n >>> 26) + r | 0,
        o += (r ^ (n | ~i)) + e[7] + 1126891415 | 0,
        o = (o << 10 | o >>> 22) + n | 0,
        i += (n ^ (o | ~r)) + e[14] - 1416354905 | 0,
        i = (i << 15 | i >>> 17) + o | 0,
        r += (o ^ (i | ~n)) + e[5] - 57434055 | 0,
        r = (r << 21 | r >>> 11) + i | 0,
        n += (i ^ (r | ~o)) + e[12] + 1700485571 | 0,
        n = (n << 6 | n >>> 26) + r | 0,
        o += (r ^ (n | ~i)) + e[3] - 1894986606 | 0,
        o = (o << 10 | o >>> 22) + n | 0,
        i += (n ^ (o | ~r)) + e[10] - 1051523 | 0,
        i = (i << 15 | i >>> 17) + o | 0,
        r += (o ^ (i | ~n)) + e[1] - 2054922799 | 0,
        r = (r << 21 | r >>> 11) + i | 0,
        n += (i ^ (r | ~o)) + e[8] + 1873313359 | 0,
        n = (n << 6 | n >>> 26) + r | 0,
        o += (r ^ (n | ~i)) + e[15] - 30611744 | 0,
        o = (o << 10 | o >>> 22) + n | 0,
        i += (n ^ (o | ~r)) + e[6] - 1560198380 | 0,
        i = (i << 15 | i >>> 17) + o | 0,
        r += (o ^ (i | ~n)) + e[13] + 1309151649 | 0,
        r = (r << 21 | r >>> 11) + i | 0,
        n += (i ^ (r | ~o)) + e[4] - 145523070 | 0,
        n = (n << 6 | n >>> 26) + r | 0,
        o += (r ^ (n | ~i)) + e[11] - 1120210379 | 0,
        o = (o << 10 | o >>> 22) + n | 0,
        i += (n ^ (o | ~r)) + e[2] + 718787259 | 0,
        i = (i << 15 | i >>> 17) + o | 0,
        r += (o ^ (i | ~n)) + e[9] - 343485551 | 0,
        r = (r << 21 | r >>> 11) + i | 0,
        t[0] = n + t[0] | 0,
        t[1] = r + t[1] | 0,
        t[2] = i + t[2] | 0,
        t[3] = o + t[3] | 0
}

function i(t) {
    var e, n = [];
    for (e = 0; e < 64; e += 4)
        n[e >> 2] = t[e] + (t[e + 1] << 8) + (t[e + 2] << 16) + (t[e + 3] << 24);
    return n
}
hash = [1732584193, -271733879, -1732584194, 271733878];
_buff = undefined;
_length = 0;

function append(t) {
    var e, r = t,
        o = r.length;
    for (this._length += o,
        e = 64; e <= o; e += 64)
        n(this.hash, i(r.subarray(e - 64, e)));
    this._buff = e - 64 < o ? new Uint8Array(r.buffer.slice(e - 64)) : new Uint8Array(0);
    return this.hash;
}

u = function (t) {
    for (var e = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D", i = e.split(" ").map((function (t) {
            return parseInt(t, 16)
        })), a = -1, o = 0, n = t.length; o < n; o++)
        a = a >>> 8 ^ i[255 & (a ^ t[o])];
    return (-1 ^ a) >>> 0
}

function getCS(t) {
    t= base64ToUint8Array(t)
    g = (0, u)(t);
    return g
}
end = function(t) {
    var e, n, r = this._buff, i = r.length, o = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (e = 0; e < i; e += 1)
        o[e >> 2] |= r[e] << (e % 4 << 3);
    return this._finish(o, i),
    n = u(this._hash),
    t && (n = f(n)),
    n
}
_finish = function(t, e) {
    var r, i, o, a = e;
    if (t[a >> 2] |= 128 << (a % 4 << 3),
    a > 55)
        for (n(this._hash, t),
        a = 0; a < 16; a += 1)
            t[a] = 0;
    r = 8 * this._length,
    r = r.toString(16).match(/(.*?)(.{0,8})$/),
    i = parseInt(r[2], 16),
    o = parseInt(r[1], 16) || 0,
    t[14] = i,
    t[15] = o,
    n(this._hash, t)
}
function getHash(t) {
    t= base64ToUint8Array(t)
    t = append(t);
    this._hash = t;
    this.end();
    for (e = 0; e < t.length; e += 1)
        t[e] = s(t[e]);
    return t.join("")
}

function base64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
module.exports = {
    getHash,
    getCS
}