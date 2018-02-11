var http = require('http'),
    fs = require("fs"),
    url = require("url");

//创建一个服务
var server = http.createServer(function (req, res) {
    var urlObj = url.parse(req.url, true),
        pathname = urlObj.pathname,
        query = urlObj.query;//存储的是客户端请求的url地址中问号传参后面的信息

    var reg = /\.(HTML|JS|CSS|JSON|TXT|ICO)/i;

    if (reg.test(pathname)) {
        var suffix = reg.exec(pathname)[1].toUpperCase()

        var suffixMIME = "text/plain"

        switch (suffix) {
            case "HTML":
                suffixMIME = "text/html"
                break
            case "CSS":
                suffixMIME = "text/css"
                break
            case "JS":
                suffixMIME = "text/javascript"
                break
            case "JSON":
                suffixMIME = "application/json"
                break
        }

        try {
            var conFile = fs.readFileSync("." + pathname, "utf-8")

            res.writeHead(200, { 'content-type': suffixMIME + ';charset=utf-8;' })

            res.end(conFile)
        } catch (e) {
            res.writeHead(404, { 'content-type': 'text/plain;charset=utf-8;' })
            res.end("request file is not found")
        }
        return
    }
    //->api数据结构的处理
    var con = null,
        result = null,
        customId = null,
        customPath = "./json/custom.json";

    //->API数据接口的处理
    con = fs.readFileSync(customPath, "utf-8")
    con.length === 0 ? con = '[]' : null //防止custom.json无数据
    con = JSON.parse(con)

    //1.获取所有的客户信息   
    if (pathname === "/getList") {
        result = {
            code: 1,
            msg: "没有任何的客户信息",
            data: null,
        };
        if (con.length > 0) {
            result = {
                code: 0,
                msg: "成功",
                data: con,
            }
        }
        res.writeHead(200, { 'content-type': 'application/json;charset=utf-8;' })
        res.end(JSON.stringify(result))
        return

    }

    //2.获取具体的某一个客户的信息
    if (pathname === "/getInfo") {
        customId = query["id"]

        result = {
            code: 1,
            msg: "客户不存在",
            data: null,
        }
        for (var i = 0; i < con.length; i++) {
            if (con[i]['id'] === customId) {
                result = {
                    code: 0,
                    msg: "成功",
                    data: con[i],
                }
                break
            }
        }
        res.writeHead(200, { 'content-type': 'application/json;charset=utf-8;' })
        res.end(JSON.stringify(result))
        return

    }

    //3.删除客户信息
    if (pathname === "/removeInfo") {
        customId = query["id"]
        var flag = false

        for (var i = 0; i < con.length; i++) {
            if (con[i]["id"] === customId) {
                con.splice(i, 1)
                flag = true
                break
            }
        }
        result = {
            code: 1,
            msg: "删除失败",
        }

        if (flag) {
            fs.writeFileSync(customPath, JSON.stringify(con), "utf-8")
            result = {
                code: 0,
                msg: "删除成功",
            }

        }
        res.writeHead(200, { 'content-type': 'application/json;charset=utf-8;' })
        res.end(JSON.stringify(result))
        return
    }

    //4.增加客户信息
    if (pathname === "/getInfo") {
        var str = ''

        req.on("data", function (chunk) {
            str += chunk
        })
        req.on("end", function () {
            if (str.length === 0) {
                res.writeHead(200, { 'content-type': 'application/json;charset=utf-8;' })
                res.end(JSON.stringify({
                    code: 1,
                    msg: "增加失败,没有传递任何需要增加的信息",
                }))
                return
            }
            var data = JSON.parse(str)

            data["id"] = con.length === 0 ? 1 : parseFloat(con[con.length - 1]["id"]) + 1
            con.push(data)
            fs.writeFileSync(customPath, JSON.stringify(con), "utf-8")
            res.end(JSON.stringify({
                code: 0,
                msg: "增加成功",
            }))
        })
        return
    }

    //5.修改客户信息
    if (pathname === "/updateInfo") {
        var str = ''
        req.on("data", function (chunk) {
            str += chunk
        })
        req.on("end", function () {
            if (str.length === 0) {
                res.writeHead(200, { 'content-type': 'application/json;charset=utf-8;' })
                res.end(JSON.stringify({
                    code: 1,
                    msg: "修改失败,没有传递任何需要修改的信息",
                }))
                return
            }

            var flag = false,
                data = JSON.parse(str)
            for (var i = 0; i < con.length; i++) {
                if (con[i]["id"] === data["id"]) {
                    con[i] = data
                    flag = true
                    break
                }
            }
            result.msg = "修改失败，需要修改的客户不存在"
            if (flag) {
                fs.writeFileSync(customPath, JSON.stringify(con), "utf-8")
                result = {
                    code: 0,
                    msg: "修改成功"
                }
            }

            res.writeHead(200, { 'content-type': 'application/json;charset=utf-8;' })
            res.end(JSON.stringify(result))
        })

        return
    }

    res.writeHead(404, { 'content-type': 'text/plain;charset=utf-8;' })
    res.end("请求的数据接口不存在", )

})

//为这个服务器监听一个端口
server.listen(8080, function () {
    //当服务创建成功，并且端口号也监听成功之后执行这个回调函数
    console.log("server is create success, listening on 8080 port!")
})
