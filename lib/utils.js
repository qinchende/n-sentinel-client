module.exports = Gd.global('Utl', function() {
    var http = require('http'), https = require('https');
    var me = {};

    me.fn = function() {};

    // 适合 Asy使用的callback
    me.asyCb = function(cb) {
        return function(err, rows, fields) {
            cb && cb(err, rows);
        };
    };

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // each item [JSON Object Or Array]
    me.forEach = function(obj, cb) {
        var len = obj.length;
        if (len !== undefined) {
            for (var i = 0; i < len; i++) {
                if (cb.call(obj[i], i, obj[i]) === false) { break; }
            }
        } else if (obj.toString() === '[object Object]') {
            for (var k in obj) {
                if (obj.hasOwnProperty && !obj.hasOwnProperty(k)) { continue; }
                if (cb.call(obj[k], k, obj[k]) === false) { break; }
            }
        }
    };

    // 返回一个集合的所有 keys 数组。
    me.getKeys = function(obj) {
        var keys = [];
        for (var k in obj || {}) {
            if (obj.hasOwnProperty && !obj.hasOwnProperty(k)) { continue; }
            keys.push(k);
        }
        return keys;
    };

    me.apply = function(t, c, def) {
        if (def) { me.apply(t, def); }
        if (t && c && typeof c === 'object') {
            for (var i in c) {
                if (c.hasOwnProperty && !c.hasOwnProperty(i)) { continue; }
                t[i] = c[i];
            }
        }
        return t;
    };

    me.applyStrict = function(t, c) {
        t = t || {};
        if (t && c) {
            for (var p in c) {
                if (c.hasOwnProperty && !c.hasOwnProperty(p)) { continue; }
                if (c[p]) { t[p] = c[p]; }
            }
        }
        return t;
    };

    me.applyIf = function(t, c) {
        if (t && c) {
            for (var p in c) {
                if (c.hasOwnProperty && !c.hasOwnProperty(p)) { continue; }
                if (t[p] === undefined) { t[p] = c[p]; }
            }
        }
        return t;
    };

    // 目前支持 Function 和 object
    // 得到的都将是一个Object.
    me.applyClone = function(c) {
        var t = {};
        var keys = Object.getOwnPropertyNames(c);
        if (typeof c == 'object') { keys = keys.concat(Object.getOwnPropertyNames(Object.getPrototypeOf(c))); }
        for (var i = 0; i < keys.length; i++) { t[keys[i]] = c[keys[i]]; }
        return t;
    };

    me.urlValue = function(href, k) {
        var reg = new RegExp("(^|&)" + k + "=([^&]*)(&|$)");
        var r = href.substr(href.indexOf('?') + 1).match(reg);
        if (r != null) return decodeURIComponent(r[2]);
        return null;
    };
    // ------------------------------------------------------------------------
    // 模拟 jquery.param
    var r20 = /%20/g,
        rbracket = /\[\]$/;
    function buildParams(prefix, obj, traditional, add) {
        var name;
        if (me.isArr(obj)) {
            // Serialize array item.
            me.forEach(obj, function(i, v) {
                if (traditional || rbracket.test( prefix )) {
                    // Treat each array item as a scalar.
                    add(prefix, v);
                } else {
                    // Item is non-scalar (array or object), encode its numeric index.
                    buildParams(
                        prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
                        v,
                        traditional,
                        add
                    );
                }
            });
        } else if (!traditional && (typeof obj === "object")) {
            // Serialize object item.
            me.forEach(obj, function(k, v) {
                buildParams(prefix + "[" + k + "]", v, traditional, add);
            });
        } else {
            // Serialize scalar item.
            add(prefix, obj);
        }
    }
    // Serialize an array of form elements or a set of
    // key/values into a query string
    function jquery_param(a, traditional) {
        var prefix,
            s = [],
            add = function(key, value) {
                // If value is a function, invoke it and return its value
                value = me.isFun(value) ? value() : (value == null ? "" : value);
                s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
            };

        // If traditional, encode the "old" way (the way 1.3.2 or older
        // did it), otherwise encode params recursively.
        me.forEach(a, function(k, v) {
            buildParams(k, v, traditional, add);
        });

        // Return the resulting serialization
        return s.join( "&" ).replace( r20, "+" );
    }
    // ------------------------------------------------------------------------
    me.param = function(pms, url) {
        var rt = jquery_param(pms || {});
        if (url) {
            if (rt) { url += (url.indexOf('?') < 0 ? '?' : '&') + rt; }
            return url;
        }
        return rt;
    };

    me.isMobile = function(mobile) {
        return /^(1(([3578][0-9])|(47)))\d{8}$/.test(mobile);
    };

    me.isEmail = function(email) {
        return /^([a-zA-Z0-9_\.\-])+@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(email);
    };

    me.isNum = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };

    me.isArr = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };

    me.isFun = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Function]';
    };

    // 得到 客户端的真实 IP 地址
    me.realIP = function(req) {
        return req.headers['x-real-ip'] || req.connection.remoteAddress;
    };

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // 代理请求，目前仅支持 GET 请求
    me.webAgent = function(opt, debug) {
        opt = me.applyIf(opt || {}, {
            agent: '',
            url: '',
            pms: {}
        });

        var tg = opt.agent;
        tg = me.param(me.apply(opt.pms, {real_url: opt.url}), tg);

        web_exec(tg, opt.cb, debug);
    };

    // 采用代理请求，并以Json格式解析返回结果
    me.webAgentJson = function (opt, debug) {
        opt = web_json(opt);
        me.webAgent(opt, debug);
    };

    // http 或 https 请求
    me.webReq = function(opt, debug) {
        opt = me.applyIf(opt || {}, {
            url: '',
            pms: {}
        });

        var tg = opt.url;
        tg = me.param(me.apply(opt.pms, {__by: 'gd'}), tg);

        web_exec(tg, opt.cb, debug);
    };

    // 请求，以Json格式解析返回结果
    me.webReqJson = function (opt, debug) {
        opt = web_json(opt);
        me.webReq(opt, debug);
    };

    function web_exec(tg, cb, debug) {
        var inter = http;
        if (tg && tg.indexOf('https://') == 0) { inter = https; }

        if (debug === true) { console.log(tg); }
        var buf = [], buf_length = 0;
        inter.get(tg, function(r) {
            r.on('data', function(d) {
                buf.push(d);
                buf_length += d.length;
            });
            r.on('end', function() {
                var ret = Buffer.concat(buf, buf_length).toString();
                if (debug === true) { console.log(ret); }
                cb && cb(null, ret);
            });
        }).on('error', function(e) {
            cb && cb(e.message, null);
        });
    }

    function web_json(opt) {
        opt = opt || {};
        opt.__cb = opt.cb || function(err, ret) {};
        opt.cb = function(err, ret) {
            var parse = ret;
            try {
                parse = JSON.parse(ret || '{}')
            } catch (e) {
                err += e.toString()
            }
            opt.__cb(err, parse);
        };
        return opt;
    }
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    me.randomLetter = function(len) {
        return me.randomSeq(len, "ACDEFGHJKMNPQRSTUVWXYZ");
    };
    me.randomSeq = function(len, set) {
        set = set || "235679ACDEFGHJKMNPQRSTUVWXYZ";
        var code = '';
        for (var i = 0; i < len; i++) { code += set[parseInt(Math.random()*set.length)]; }
        return code;
    };
    // len 最好不要超过15
    me.randomNum = function(len) {
        return(Math.random().toString()).substring(2, 2 + len);
    };
    me.randomInt = function(min, max) {
        if (max === undefined) { max = min; min = 0; }
        return parseInt(Math.random()*(max - min) + min);
    };
    me.nextNum = function(cur, max, cb) {
        max = max || 100000000;
        cur = parseInt(cur);
        cur += 1;
        if (cur.toString().indexOf('4') >= 0) { me.get_next_num(cur, max, cb); }
        else { cb && cb(cur > max ? 0 : cur); }
    };
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // JSON common
    me.suc = function(res, obj) {
        me.renderResult(res, obj, 'suc');
    };

    me.fai = function(res, obj) {
        me.renderResult(res, obj, 'fai');
    };

    me.exc = function(res, e) {
        var desc = "";
        for (var keys in e) {
            if (!e.hasOwnProperty(keys)) { continue; }
            desc += "[" + keys + "]:[" + e[keys] + ']; ';
        }
        me.fai(res, {msg_code: -1, msg: 'Exception: ' + e.toString() + desc});
    };

    me.render = function(res, msg) {
        return function(err, ret) {
            if (err) { return me.fai(res, {msg: msg || err.message || err}); }
            me.suc(res, {record: ret});
        }
    };

    me.renderResult = function(res, obj, t) {
        obj = gen_render_val(res, obj, t);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end(JSON.stringify(obj));
    };

    me.renderRes = function(res, err_str, val_core, val_ext) {
        if (err_str) {
            return me.fai(res, {msg: err_str || ''});
        }
        if (val_core instanceof Array) {
            val_core = { records: val_core };
        }  else {
            val_core = { record: val_core };
        }
        me.suc(res, me.apply(val_core, val_ext));
    };

    function gen_render_val(res, obj, t) {
        obj = obj || {};
        if (typeof obj == 'string') { obj = {msg: obj}; }
        if (res.back_token) {obj.tok = res.back_token;}

        if (t == 'suc') {
            return me.applyIf(obj, {status: 'suc', msg_code: 1, msg: 'Suc!'});
        } else {
            return me.applyIf(obj, {status: 'fai', msg_code: 0, msg: 'Fai!'});
        }
    }
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // 安全，加密
    var crypto = require('crypto');
    me.apply(me, {
        sesParseKey: function(str, secret){
            return me.sesUnsign(str.slice(2), secret);
        },

        sesParseUid: function(str){
            return 0 == str.indexOf('t:') ? str.slice(2, str.lastIndexOf('.')) : str;
        },

        sesKey: function(secret){
            var uid = me.sesUid(24);
            return {id: uid, token: 't:' + me.sesSign(uid, secret)};
        },

        // 如果传入一个 无效的 uid，这里将自动给创建一个新的uid.
        sesCalcToken: function(uid, secret){
            return 't:' + me.sesSign(uid, secret);
        },

        sesUnsign: function(val, secret){
            var str = val.slice(0, val.lastIndexOf('.'));
            return me.sesSign(str, secret) == val
                ? str
                : false;
        },

        sesSign: function(val, secret){
            return val + '.' + crypto
                    .createHmac('sha256', secret)
                    .update(val)
                    .digest('base64')
                    .replace(/[+=]/g, '');
        },

        sesUid: function(len) {
            return crypto.randomBytes(Math.ceil(len * 3 / 4))
                .toString('base64')
                .replace(/[+=]/g, '')
                .slice(0, len);
        },

        md5: function(str, encoding) {
            return crypto.createHash('md5').update(str).digest(encoding || 'hex');
        },

        sha1: function(str, encoding) {
            return crypto.createHash('sha1').update(str).digest(encoding || 'hex');
        },

        checkMd5: function(src, md5, k) {
            return me.md5(src + (k || 'gd')) === md5.toLowerCase();
        },

        checkSha1: function(src, sha1, k) {
            return me.sha1(src + (k || 'gd')) === sha1.toLowerCase();
        },

        getMd5: function(source, key) {
            return me.sha1(source + (key || ''));
        },

        getSha1: function(source, key) {
            return me.sha1(source + (key || 'bmc'));
        }
    });

    return me;
});