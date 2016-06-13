
var request = require('request');
// 成员点击click类型按钮后，
// 微信服务器会通过消息接口推送消息类型为event的结构给开发者（参考消息接口指南），
// 并且带上按钮中开发者填写的key值，开发者可以通过自定义的key值与成员进行交互；

//function createList() {

    var options2 = {
        headers: {"Connection": "close"},
        url: 'https://qyapi.weixin.qq.com/cgi-bin/menu/create?' +
        'access_token=cWQUFhDuLpcB-CP-fbgZvezcwfSTzqDxo5K_qCQKhZTFmrOQ02TSBClIGzqDFSx-' +
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
//}
//
//module.exports = {
//    createList : createList
//};