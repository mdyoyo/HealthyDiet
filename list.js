
var request = require('request');
// 成员点击click类型按钮后，
// 微信服务器会通过消息接口推送消息类型为event的结构给开发者（参考消息接口指南），
// 并且带上按钮中开发者填写的key值，开发者可以通过自定义的key值与成员进行交互；

//function createList() {

    var options2 = {
        headers: {"Connection": "close"},
        url: 'https://qyapi.weixin.qq.com/cgi-bin/menu/create?' +
        'access_token=Jq8p-Cv1toqFuzep09a-xwhP3hApKL6HFzWLy5u4Z8m-ADB2g90gCqLrs9016Gz3' +
        '&agentid=51',
        method: 'POST',
        json: true,//请求和回发的数据自动转变成了 json 对象
        body: {
            "button": [
                {
                    "type": "click",
                    "name": "番茄炒蛋",
                    "key": "V1001_TODAY_MUSIC"
                },
                {
                    "name": "二",
                    "sub_button": [
                        {
                            "type": "view",
                            "name": "二级菜单",
                            "url": "http://www.soso.com/" //跳转链接
                        },
                        {
                            "type": "click",
                            "name": "22",
                            "key": "V12"
                        }
                    ]
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