var express = require('express');
var WXBizMsgCrypt = require('./lib/WXUtil.js');

var config = {
    token:'JiCTLRjtUNh9PuPt1no1wCQML1rm',
    encodingAESKey:'ThTmIVioex7wf8m4BnrIMe3d1LfHczHMh53dV1WHlLq',
    corpId:'wx1d3765eb45497a18'
};


var app = express();

app.get('/',function(req,res){
console.log("hi");
    var msg_signature = req.query.msg_signature;
    var timestamp = req.query.timestamp;
    var nonce = req.query.nonce;
    var echostr = req.query.echostr;
    console.log(msg_signature);
    console.log(timestamp);
    console.log(nonce);
    console.log(echostr);
    var cryptor = new WXBizMsgCrypt(config.token, config.encodingAESKey, config.corpId);
    var errCode = cryptor.verifyURL(msg_signature,timestamp,nonce,echostr);
    if(errCode === 0){
        var s = cryptor.decrypt(echostr);
        res.send(s.message);
    }else{
        res.end('fail');
    }


});

app.listen(1337);
console.log('Server running at http://123.206.71.86:1337/');
