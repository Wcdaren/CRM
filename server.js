var http = require('http'),
    fs = require("fs"),
    url = require("url");

//创建一个服务
var server = http.createServer(function (req, res) {
    var urlObj = url.parse(req.url, true),
        pathname = urlObj.pathname,
        query = urlObj.query;

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
    var con = null, result = null, customPath = "./json/custom.json";
    //->API数据接口的处理
    //1.获取所有的客户信息   
    if (pathname === "/getList") {
        con = fs.readFileSync(customPath, "utf-8")
        con.length === 0 ? con = '[]' : null //防止custom.json无数据
        con = JSON.parse(con)

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
        res.writeHead(200,{'content-type':'application/json;charset=utf-8;'})
        res.end(JSON.stringify(result))
        return 

    }
});

//为这个服务器监听一个端口
server.listen(8080, function () {
    //当服务创建成功，并且端口号也监听成功之后执行这个回调函数
    console.log("server is create success, listening on 8080 port!")
})
