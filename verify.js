var express = require('express');
var WXBizMsgCrypt = require('wechat-enterprise');

var config = {
    token:'JiCTLRjtUNh9PuPt1no1wCQML1rm',
    encodingAESKey:'ThTmIVioex7wf8m4BnrIMe3d1LfHczHMh53dV1WHlLq',
    corpId:'wx1d3765eb45497a18'
};
var app = express();

app.get('/wxservice',function(req,res){
console.log("hi");
    var msg_signature = req.query.msg_signature;
    var timestamp = req.query.timestamp;
    var nonce = req.query.nonce;
    var echostr = req.query.echostr;
    var cryptor = new WXBizMsgCrypt(config.token, config.encodingAESKey, config.corpId);
    var s = cryptor.decrypt(echostr);
    res.send(s.message);
});

app.listen(1337);
console.log('Server running at http://123.206.71.86:1337/');
//function verifyURL(){
//
//}
