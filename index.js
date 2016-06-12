var later = require('later');
var https = require('https');
var fs = require('fs');
var crypto = require('crypto');

var http = require('http');
var url = require('url');
var qs = require('qs');//url参数字符串和参数对象的转换

var WXBizMsgCrypt = require('./lib/WXUtil.js');
var corpId = require('./lib/config').corpID;
var corpSecret = require('./lib/config').corpSecret;
var config = {
    token:'JiCTLRjtUNh9PuPt1no1wCQML1rm',
    encodingAESKey:'ThTmIVioex7wf8m4BnrIMe3d1LfHczHMh53dV1WHlLq',
    corpId:'wx1d3765eb45497a18'
};
var access_token;

function checkSignature(params){
    var cryptor = new WXBizMsgCrypt(config.token, config.encodingAESKey, config.corpId);
    var errCode = cryptor.verifyURL(params.msg_signature,params.timeStamp,params.nonce,params.echoStr);
    if(errCode === 0){
        var s = cryptor.decrypt(params.echostr);//解析出明文
        res.send(s.message);
    }else{
        res.end('fail');
    }
}

//企业在接收消息，以及发送被动响应消息时，数据包以xml格式组成，以AES方式加密传输
//接收事件
var server = http.createServer(function(req,res){

    var query = url.parse(req.url).query;//?后面的内容
    var params = qs.parse(query);
    console.log(params);

    if(req.method == "GET"){//get请求，返回echostr用于通过服务器有效校验
        /**params内容：
         * { msg_signature: '7093f89c7814f06ebf29b5d38d598101341ceb0a',
        timestamp: '1465734386',
        nonce: '1055659467',
        echostr: 'AKIyN3y9rLyAilMhDVsJruPTAjMGH/SpG/zlUFd+lZmOotmPcvoZJ8Gu4WEo386X5/K94kCLLSUovSyllbGqbA==' }
         */
        var echostr = params.echostr;
        var cryptor = new WXBizMsgCrypt(config.token, config.encodingAESKey, config.corpId);
        var errCode = cryptor.verifyURL(params.msg_signature,params.timestamp,params.nonce,echostr);
        console.log(errCode);
        if(errCode != 0){
            res.end(fail);
        }
        /**
         * { message: '3617532078790236155', id: 'wx1d3765eb45497a18' }
         */
        else{
            var s = cryptor.decrypt(echostr);
            //解析出明文
            res.end(s.message);
        }
    }
    else{//post请求，微信发给开发者服务器
        var postdata = "";
        req.addListener("data",function(postchunk){
            postdata += postchunk;
        });
        req.addListener("end",function(){
            var parseString = require('xml2js').parseString;
            parseString(postdata, function(err,result){
                if(!err){
                    console.log(result);
                    var toUser = result.xml.ToUserName[0];
                    var msg_encrypt = result.xml.Encrypt[0];
                    var toAgentID = result.xml.AgentID[0];
                    //验证signature
                    var cryptor = new WXBizMsgCrypt(config.token, config.encodingAESKey, config.corpId);
                    var dev_msg_signature = cryptor.getSignature(params.timestamp,params.nonce,msg_encrypt);
                    console.log(dev_msg_signature);
                    console.log(params,msg_signature);
                    if(dev_msg_signature == params.msg_signature){
                        //验证通过 解密msg_encrypt
                        var de_result = cryptor.decrypt(msg_encrypt);
                        console.log(de_result);
                    }else{
                        res.end('signature fail');
                    }
                }
            });
        });
    }
    /*
     { msg_signature: 'd800f42142818c5c3a6ffcedb2d392406aa6a413',
     timestamp: '1465744965',
     nonce: '1766896560' }
     { xml:
     { ToUserName: [ 'wx1d3765eb45497a18' ],
     Encrypt: [ '3jHkncSdZE7W+HvGd9bXTF1SCyjVv+Y376W18/0/2TlnRhRw/JfF9WNkl2HPbmJkElYUGV+mBIzi3HJcLO5D81BmgzKeV53dnOR8pxvLM7P9is73S634pBrKMxcRyJOq2bkWKKou0Y3LNQS/tv9p6nRmLHODVbvW5+DODG3e9WORx+B9jdnJlLIl+1XBXf+gbIsP4YI45qUmYpiCV9vLmEwFo/N0oP8bvJv+SsEewIVdTgbppunSoI4UznSrTATcCBxlA+MW0lgqLZ3YjTcW18qWzDVzrVSXFkG6bU2LwU9U0cB0yi7dycAE1ctWGL7OYqojnMYWdzHfkWu+D4RddwFH2r484IGDtf/j6ZH9/Y5/2kjhs8mm/kdbqexj9KQ5BnAQyrdwJ1w+QnX3C4jrsG/MMKSdPh0RKeGXjE20aHZPO9E0TUkYSTznpLu+Y5AuFYfZHB5ElNul6VeNSti9TQ==' ],
     AgentID: [ '51' ] } }
     */

});
server.listen(1338);
console.log('server running at port 1338');




/*定时器*/
later.date.localTime();
console.log("Now_____"+ new Date());

var sched =  later.parse.recur().every(2).hour();//每隔两小时
next = later.schedule(sched).next(10);
console.log("next______");
console.log(next);

var timer = later.setInterval(test,sched);
setTimeout(test,2000);

function test(){
    console.log("test()______" + new Date());
    var url = "https://qyapi.weixin.qq.com/cgi-bin/gettoken?" +
        "corpid=" + corpId +
        "&corpsecret=" + corpSecret;
    var req = https.get(url,function(res){
        var bodyChunks = '';
        res.on('data',function(chunk){
            bodyChunks += chunk;
        });
        res.on('end', function () {
            console.log(bodyChunks);
            var body = JSON.parse(bodyChunks);
            if (body.access_token) {
                access_token = body.access_token;
                console.log(access_token);
                //缓存token
                fs.writeFileSync('token.dat',JSON.stringify(access_token));
            } else {
                console.dir(body);
            }
        });
    });
    req.on('error', function (e) {
        console.log('ERROR: ' + e.message);
    });
}

