~ function () {
    // 创建xhr对象兼容所有浏览器
    // 运用惰性思想
    function createXHR() {
        var xhr = null,
            flag = false,
            ary = [
                function () {
                    return new XMLHttpRequest
                },
                function () {
                    return new ActiveXObject("Microsoft.XMLHTTP")
                },
                function () {
                    return new ActiveXObject("Msxm12.XMLHTTP")
                },
                function () {
                    return new ActiveXObject("Msxm13.XMLHTTP")
                },
            ]

        for (var i = 0, len = ary.length; i < len; i++) {
            var curFn = ary[i]
            try {
                xhr = curFn()
                createXHR = curFn
                flag = true
                break
            } catch (e) {

            }

        }

        if (!flag) {
            throw new Error("your browser is not suport ajax ,please change your browser ,try again!")

        }

        return xhr
    }

    function ajax(options) {
        // 把需要 的参数值设定一个规则和初始值
        var _default = {
            url: "",
            type: "get",
            dataType: "json",
            async: true,
            data: null, // 放在请求主题中的内容（POST） 
            getHead: null, //当ready state === 2 的时候执行的回调方法
            success: null, //当ready state === 4 的时候执行的回调方法
        }
        // console.log("进入ajax");
        

        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                _default[key] = options[key]
            }
        }

        // 如果当前的请求方式是get 我们要在url 末尾加随机数来清楚缓存
        if (_default.type === "get") {
            _default.url.indexOf("?") >= 0 ? _default.url += "&" : _default.url += "?"
            _default.url += "_=" + Math.random();
        }
        // console.log(_default);

        var xhr = createXHR()

        xhr.open(_default.type, _default.url, _default.async)

        xhr.onreadystatechange = function () {

            if (/^2\d{2}$/.test(xhr.status)) {
                //要保证是异步请求
                if (xhr.readyState === 2) {
                    // 一般用这种格式            _default.success && _default.success.call(xhr,val)
                    if (typeof _default.getHead === "function") {
                        _default.getHead.call(xhr);
                    }
                }
                if (xhr.readyState === 4) {
                    var val = xhr.responseText
                    console.log(val);
                    
                    if (_default.dataType === "json") {
                        val = "JSON" in window ? JSON.parse(val) : eval("(" + val + ")")
                    }
                    console.log(val);

                    _default.success && _default.success.call(xhr, val)
                    // if (typeof _default.success === "function") {
                    //     _default.success.call(xhr);
                    // }
                }
            }
        }

        xhr.send(_default.data)
    }

    window.ajax = ajax
}()