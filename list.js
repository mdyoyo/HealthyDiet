var https = require('https');
//
//function createList(){
    var body = {
        "button":[
            {
                "type":"click",
                "name":"一",
                "key":"V1001_TODAY_MUSIC"
            },
            {
                "name":"二",
                "sub_button":[
                    {
                        "type":"view",
                        "name":"21",
                        "url":"http://www.soso.com/"
                    },
                    {
                        "type":"click",
                        "name":"22",
                        "key":"V12"
                    }
                ]
            }
        ]
    };

    var bodyString = JSON.stringify(body);
    var headers = {
        'Content-Type': 'application/json',
        'Content-Length': bodyString.length
    };
    var options = {
        host: 'qyapi.weixin.qq.com',
        path: '/cgi-bin/menu/create?' +
        'access_token=MtTudgjH4qC_u1zSq5p0GF194WJiCSdxifsWDFeRXpB96R9XPuiQLdk6KvCoWE0P' +
        '&agentid=51',
        method: 'POST',
        headers: headers
    };

    var req=https.request(options,function(res){
        res.setEncoding('utf-8');
        var responseString = '';
        res.on('data', function(data) {
            responseString += data;
        });
        res.on('end', function() {
            //这里接收的参数是字符串形式,需要格式化成json格式使用
            var resultObject = JSON.parse(responseString);
            console.log('-----resBody-----',resultObject);
        });
        req.on('error', function(e) {
            // TODO: handle error.
            console.log('-----error-------',e);
        });
    });
    req.write(bodyString);
    req.end();
//}
//
//module.exports = {
//    createList : createList
//};

