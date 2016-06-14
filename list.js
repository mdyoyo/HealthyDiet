var corpId = require('./lib/config').corpID;
var corpSecret = require('./lib/config').corpSecret;
var request = require('request');
//创建菜单
request("https://qyapi.weixin.qq.com/cgi-bin/gettoken?" +
    "corpid=" + corpId +
    "&corpsecret=" + corpSecret,function(error,response,data){
    var result = JSON.parse(data);
    var token = result.access_token;
    var options2 = {
        headers: {"Connection": "close"},
        url: 'https://qyapi.weixin.qq.com/cgi-bin/menu/create?' +
        'access_token='+token +
        '&agentid=51',
        method: 'POST',
        json: true,//请求和回发的数据自动转变成了 json 对象
        body: {
            "button": [
                {
                    "name": "四季食谱",
                    "sub_button":[
                        {
                            "type":"click",
                            "name":"春",
                            "key":"V1001"
                        },
                        {
                            "type":"click",
                            "name":"夏",
                            "key":"V1002"
                        },
                        {
                            "type":"click",
                            "name":"秋",
                            "key":"V1003"
                        },
                        {
                            "type":"click",
                            "name":"冬",
                            "key":"V1004"
                        }
                    ]
                },
                {
                    "name": "小贴士",
                    "sub_button": [
                        {
                            "type":"view",
                            "name":"15种果蔬汁",
                            "url":"http://www.meishij.net/meirong/15zhongmeiweiguozhiqingchanggengjianfei.html"
                        },
                        {
                            "type": "view",
                            "name": "11种减肥食物",
                            "url": "http://www.meishij.net/meirong/jianfeishipupandian11zhongchaozanguayoushiwu.html" //跳转链接
                        },
                        {
                            "type": "view",
                            "name": "6款减肥餐",
                            "url": "http://www.meishij.net/meirong/6kuanzuiremenkuaisujianfeishipu.html"
                        }
                    ]
                },
                {
                    "type": "click",
                    "name": "使用指南",
                    "key": "V3"
                }
            ]
        }
    };

    function callback(error, response, data) {
        if (!error && response.statusCode == 200) {
            console.log('----info------', data);
        }
    }
    request(options2, callback);

});
