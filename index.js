var later = require('later');
var https = require('https');
var fs = require('fs');

var http = require('http');
var url = require('url');
var qs = require('qs');//url参数字符串和参数对象的转换

var db_url = require('./lib/config.js').database;
//连接数据库
var mongoose = require('mongoose');
var Food = require('./model/food_model.js').foodData;
mongoose.connect(db_url);
mongoose.connection.on('error',console.error.bind(console,'连接数据库失败'));

var replyTextToUSer_mw = require('./lib/reply.js').replyTextToUSer_mw;
var replyXMLToWechat = require('./lib/reply.js').replyXMLToWechat;
var replyArticlesToClick = require('./lib/reply.js').replyArticlesToClick;

var WXBizMsgCrypt = require('./lib/WXUtil.js');
var corpId = require('./lib/config').corpID;
var corpSecret = require('./lib/config').corpSecret;
var port = require('./lib/config').port;
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
            res.end('fail');
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
                    //console.log(dev_msg_signature);
                    //console.log(params.msg_signature);
                    if(dev_msg_signature == params.msg_signature){
                        //验证通过 解密msg_encrypt
                        var de_result = cryptor.decrypt(msg_encrypt);
//                        console.log(de_result);
                        var de_result_m = de_result.message;
                        parseString(de_result_m,function(err,de_result_xml){
//                            console.log(de_result_xml);
                            var toUserName = de_result_xml.xml.ToUserName[0];
                            var fromUserName =  de_result_xml.xml.FromUserName[0];
                            var agentId =  de_result_xml.xml.AgentID[0];
                            //event或者text/image/voice/video/shortvideo/location/link
                            var msgType = de_result_xml.xml.MsgType[0];
                            if(msgType === 'event'){
                                console.log("收到事件");
                                //事件类型
                                var eventType = de_result_xml.xml.Event[0];
                                if(eventType === 'click'){
                                    console.log("点击菜单拉取消息事件");
                                    //事件KEY值，与自定义菜单接口中KEY值对应
                                    var eventKey =  de_result_xml.xml.EventKey[0];
                                    //使用指南
                                    if(eventKey === 'V3'){
                                        var replyText= "欢迎关注哦O(∩_∩)O！您可以直接在输入框内，输入食物或者菜名，进行热量的查询，例如苹果、土豆等。\n除此之外，您还可以点击我们菜单栏的菜单，会有一些关于减肥养生的分享~~\nps：输入“番茄炒蛋”有惊喜哦~嘻嘻";
                                        var reply_xml_tmp = replyTextToUSer_mw(de_result_xml, replyText);
                                        console.log(reply_xml_tmp);
                                        //加密xml,生成签名，在生成一个xml,返回给微信
                                        var msg_encypt = cryptor.encrypt(reply_xml_tmp);
                                        var msg_signature = cryptor.getSignature(params.timestamp,params.nonce,msg_encypt);
                                        var result_replyToWechat = replyXMLToWechat(msg_encypt,msg_signature,params.timestamp,params.nonce);
                                        console.log("回复文本消息啦");
                                        console.log(result_replyToWechat);
                                        res.end(result_replyToWechat);
                                    }
                                    //四季食谱
                                    else{
                                        var reply_xml_tmp = replyArticlesToClick(1,de_result_xml,false);
                                        console.log(reply_xml_tmp);
                                        //加密xml,生成签名，在生成一个xml,返回给微信
                                        var msg_encypt = cryptor.encrypt(reply_xml_tmp);
                                        var msg_signature = cryptor.getSignature(params.timestamp,params.nonce,msg_encypt);
                                        var result_replyToWechat = replyXMLToWechat(msg_encypt,msg_signature,params.timestamp,params.nonce);
                                        res.end(result_replyToWechat);
                                    }

                                }else if(eventType === 'view'){
                                    console.log("点击菜单跳转链接事件");
                                    //事件KEY值，设置的跳转URL
                                    var eventKey_url =  de_result_xml.xml.EventKey[0];
                                    //TODO 还不知道要做什么~或许可以放一些相关网站？

                                }else if(eventType ==='subscribe'){
                                    console.log("成员关注事件");
                                    var replyText = "hi，欢迎关注哦O(∩_∩)O！您可以直接在输入框内，输入食物或者菜名，进行热量的查询，例如苹果、土豆等。\n除此之外，您还可以点击我们菜单栏的菜单，会有一些关于减肥养生的分享~~\nps：输入“番茄炒蛋”有惊喜哦~嘻嘻";
                                    var reply_xml_tmp = replyTextToUSer_mw(de_result_xml, replyText);
                                    console.log(reply_xml_tmp);
                                    //加密xml,生成签名，在生成一个xml,返回给微信
                                    var msg_encypt = cryptor.encrypt(reply_xml_tmp);
                                    var msg_signature = cryptor.getSignature(params.timestamp,params.nonce,msg_encypt);
                                    var result_replyToWechat = replyXMLToWechat(msg_encypt,msg_signature,params.timestamp,params.nonce);
                                    console.log("回复文本消息啦");
                                    console.log(result_replyToWechat);
                                    res.end(result_replyToWechat);
                                }else if(eventType ==='unsubscribe'){
                                    console.log("成员取消关注事件");
                                }else if(eventType === 'enter_agent'){
                                    var replyText = "hi~~您可以直接在输入框内，输入食物或者菜名，进行热量的查询，例如苹果、土豆等。\n除此之外，您还可以点击我们菜单栏的菜单，会有一些关于减肥养生的分享~~\nps：输入“番茄炒蛋”有惊喜哦~嘻嘻";
                                    var reply_xml_tmp = replyTextToUSer_mw(de_result_xml, replyText);
                                    console.log(reply_xml_tmp);
                                    //加密xml,生成签名，在生成一个xml,返回给微信
                                    var msg_encypt = cryptor.encrypt(reply_xml_tmp);
                                    var msg_signature = cryptor.getSignature(params.timestamp,params.nonce,msg_encypt);
                                    var result_replyToWechat = replyXMLToWechat(msg_encypt,msg_signature,params.timestamp,params.nonce);
                                    console.log("回复文本消息啦");
                                    console.log(result_replyToWechat);
                                    res.end(result_replyToWechat);
                                }else{
                                    console.log("其他事件");
                                }
                            }
                            else{
                                console.log("收到普通消息");//text/image/voice/video/shortvideo/locationlink
                                if(msgType === 'text'){
                                    console.log("收到文本消息啦");
                                    var content = de_result_xml.xml.Content[0];//食物名称
                                    if(content == '番茄炒蛋'){
                                        var reply_xml_tmp = replyArticlesToClick(1,de_result_xml,true);
                                        console.log(reply_xml_tmp);
                                        //加密xml,生成签名，在生成一个xml,返回给微信
                                        var msg_encypt = cryptor.encrypt(reply_xml_tmp);
                                        var msg_signature = cryptor.getSignature(params.timestamp,params.nonce,msg_encypt);
                                        var result_replyToWechat = replyXMLToWechat(msg_encypt,msg_signature,params.timestamp,params.nonce);
                                        console.log("回复文本消息啦");
                                        console.log(result_replyToWechat);
                                        res.end(result_replyToWechat);
                                    }

                                    // 判断QQ表情的正则表达式
                                    var qqfaceRegex = new RegExp("/::\\)|/::~|/::B|/::\\||/:8-\\)|/::<|/::$|/::X|/::Z|/::'\\(|/::-\\||/::@|/::P|/::D|/::O|/::\\(|/::\\+|/:--b|/::Q|/::T|/:,@P|/:,@-D|/::d|/:,@o|/::g|/:\\|-\\)|/::!|/::L|/::>|/::,@|/:,@f|/::-S|/:\\?|/:,@x|/:,@@|/::8|/:,@!|/:!!!|/:xx|/:bye|/:wipe|/:dig|/:handclap|/:&-\\(|/:B-\\)|/:<@|/:@>|/::-O|/:>-\\||/:P-\\(|/::'\\||/:X-\\)|/::\\*|/:@x|/:8\\*|/:pd|/:<W>|/:beer|/:basketb|/:oo|/:coffee|/:eat|/:pig|/:rose|/:fade|/:showlove|/:heart|/:break|/:cake|/:li|/:bome|/:kn|/:footb|/:ladybug|/:shit|/:moon|/:sun|/:gift|/:hug|/:strong|/:weak|/:share|/:v|/:@\\)|/:jj|/:@@|/:bad|/:lvu|/:no|/:ok|/:love|/:<L>|/:jump|/:shake|/:<O>|/:circle|/:kotow|/:turn|/:skip|/:oY|/:#-0|/:hiphot|/:kiss|/:<&|/:&>");
                                    if(qqfaceRegex.test(content)){
                                        var  replyText = "啊喂，发表情是什么意思！不许捣乱！";
                                        var reply_xml_tmp = replyTextToUSer_mw(de_result_xml, replyText);
                                        console.log(reply_xml_tmp);
                                        //加密xml,生成签名，在生成一个xml,返回给微信
                                        var msg_encypt = cryptor.encrypt(reply_xml_tmp);
                                        var msg_signature = cryptor.getSignature(params.timestamp,params.nonce,msg_encypt);
                                        var result_replyToWechat = replyXMLToWechat(msg_encypt,msg_signature,params.timestamp,params.nonce);
                                        console.log("回复文本消息啦");
                                        console.log(result_replyToWechat);
                                        res.end(result_replyToWechat);
                                    }else{
                                        //query['foodname'] = new RegExp(content);
                                        //根据content返回相应的热量, 查询数据库吧~~
                                        var query = {};
                                        //var pattern = new RegExp("^.*"+content+".*$");
                                        query.title = new RegExp("^.*"+content+".*$");
                                        Food.find(query,function(err,foods){
                                            if(err){
                                                console.log(err);
                                            }else{
                                                console.log(foods);
                                                var replyText="";
                                                if(foods.length>0){
                                                    var count = foods.length;
                                                    for(var i=0; i<count; i++){
                                                        replyText += foods[i].title+"\n"+foods[i].calory+"\n";
                                                        if(i==9){
                                                            break;
                                                        }
                                                    }
                                                    //replyText = food.title+"\n"+food.calory;
                                                }else{
                                                    replyText = "抱歉，食物库中还未收录此食物哦~"
                                                }
                                                var reply_xml_tmp = replyTextToUSer_mw(de_result_xml, replyText);
                                                console.log(reply_xml_tmp);
                                                //加密xml,生成签名，在生成一个xml,返回给微信
                                                var msg_encypt = cryptor.encrypt(reply_xml_tmp);
                                                var msg_signature = cryptor.getSignature(params.timestamp,params.nonce,msg_encypt);
                                                var result_replyToWechat = replyXMLToWechat(msg_encypt,msg_signature,params.timestamp,params.nonce);
                                                console.log("回复文本消息啦");
                                                console.log(result_replyToWechat);
                                                res.end(result_replyToWechat);
                                            }
                                        });
                                    }

                                    //var reply_xml_tmp = replyTextToUSer_mw(de_result_xml, content);
                                    //console.log(reply_xml_tmp);
                                    ////加密xml,生成签名，在生成一个xml,返回给微信
                                    //var msg_encypt = cryptor.encrypt(reply_xml_tmp);
                                    //var msg_signature = cryptor.getSignature(params.timestamp,params.nonce,msg_encypt);
                                    //var result_replyToWechat = replyXMLToWechat(msg_encypt,msg_signature,params.timestamp,params.nonce);
                                    //console.log("回复文本消息啦");
                                    //console.log(result_replyToWechat);
                                    //res.end(result_replyToWechat);
                                }else{
                                    console.log("收到不是文本的消息啦");
                                    var replyText = "咦，暂时只支持文字查询哦~~(*^__^*) ";
                                    var reply_xml_tmp = replyTextToUSer_mw(de_result_xml, replyText);
                                    console.log(reply_xml_tmp);
                                    //加密xml,生成签名，在生成一个xml,返回给微信
                                    var msg_encypt = cryptor.encrypt(reply_xml_tmp);
                                    var msg_signature = cryptor.getSignature(params.timestamp,params.nonce,msg_encypt);
                                    var result_replyToWechat = replyXMLToWechat(msg_encypt,msg_signature,params.timestamp,params.nonce);
                                    console.log("回复文本消息啦");
                                    console.log(result_replyToWechat);
                                    res.end(result_replyToWechat);
                                }
                            }
                        });
                        /**
                         * { message:
                         * '<xml>
                         *     <ToUserName><![CDATA[wx1d3765eb45497a18]]></ToUserName>\n
                         *     <FromUserName><![CDATA[1501210994]]></FromUserName>\n
                         *     <CreateTime>1465748152</CreateTime>\n
                         *     <MsgType><![CDATA[event]]></MsgType>\n
                         *     <AgentID>51</AgentID>\n
                         *     <Event><![CDATA[click]]></Event>\n
                         *     <EventKey><![CDATA[V1001_TODAY_MUSIC]]></EventKey>\n
                         * </xml>',
                         * id: 'wx1d3765eb45497a18' }
                         * xml2js之后：
                         * { xml:
                               { ToUserName: [ 'wx1d3765eb45497a18' ],
                                 FromUserName: [ '1501210994' ],
                                 CreateTime: [ '1465782122' ],
                                 MsgType: [ 'event' ],
                                 AgentID: [ '51' ],
                                 Event: [ 'view' ],
                                 EventKey: [ 'http://www.soso.com/' ] } }
                         */

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
server.listen(port);
console.log('server running at port'+port);




/*定时器
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
}*/

