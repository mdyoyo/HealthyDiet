var express = require('express');
var WXBizMsgCrypt = require('wechat-enterprise');

var config = {
    token:'HstHOMAgMci9qtBu2zirJ',
    encodingAESKey:'wnL0dwXTm8R9zT2GM8xUvPfohjWGHfVp3glagC9zwSB',
    corpId:'wx1d3765eb45497a18'
};
var app = express();

app.get('/wxservice',function(req,res){
    var msg_signature = req.query.msg_signature;
    var timestamp = req.query.timestamp;
    var nonce = req.query.nonce;
    var echostr = req.query.echostr;
    var cryptor = new WXBizMsgCrypt(config.token, config.encodingAESKey, config.corpId)
    var s = cryptor.decrypt(echostr);
    res.send(s.message);
});

app.listen(1337);
console.log('Server running at http://123.206.71.86:1337/');
//function verifyURL(){
//
//}
