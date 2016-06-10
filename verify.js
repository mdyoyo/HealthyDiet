var express = require('express');
//var WXBizMsgCrypt = require('./lib/WXUtils');
var crypto = require('crypto');
var config = {
    token:'JiCTLRjtUNh9PuPt1no1wCQML1rm',
    encodingAESKey:'ThTmIVioex7wf8m4BnrIMe3d1LfHczHMh53dV1WHlLq',
    corpId:'wx1d3765eb45497a18'
};

var AESKeyy;
var app = express();

app.get('/wxservice',function(req,res){
console.log("hi");
    var msg_signature = req.query.msg_signature;
    var timestamp = req.query.timestamp;
    var nonce = req.query.nonce;
    var echostr = req.query.echostr;
    console.log(msg_signature);
    console.log(timestamp);
    console.log(nonce);
    console.log(echostr);
//    var cryptor = new WXBizMsgCrypt(config.token, config.encodingAESKey, config.corpId);
    var errCode = verifyURL(msg_signature,timestamp,nonce,echostr);
    if(errCode === 0){
        var s = decrypt(echostr,AESKeyy);
        res.send(s.message);
    }else{
        res.end('fail');
    }


});

app.listen(1337);
console.log('Server running at http://123.206.71.86:1337/');
function verifyURL(msgSignature,timeStamp,nonce,echoStr){
    var errCode;
    if(config.encodingAESKey.length != 43){
        errCode = -40004;
    }
    var b = new Buffer(config.encodingAESKey+"=", 'base64');
    var aesKey = b.toString();
    AESKeyy = aesKey;
    console.log('aesKey:  '+aesKey);
    var key = [config.token,timeStamp,nonce,echoStr].sort().join('');
    var sha1 = crypto.createHash('sha1');
    sha1.update(key);

    if(sha1.digest('hex') == msgSignature){
        errCode = 0;
    }else{
        errCode = -40001;
    }
    return errCode;
}
function decrypt(text,AESKey) {
    // 创建解密对象，AES采用CBC模式，数据采用PKCS#7填充；IV初始向量大小为16字节，取AESKey前16字节
    var decipher = crypto.createDecipheriv('aes-256-cbc', AESKey, AESKey.slice(0, 16));
    decipher.setAutoPadding(false);
    var deciphered = Buffer.concat([decipher.update(text, 'base64'), decipher.final()]);

    deciphered = PKCS7Encoder.decode(deciphered);
    // 算法：AES_Encrypt[random(16B) + msg_len(4B) + msg + $CorpID]
    // 去除16位随机数
    var content = deciphered.slice(16);
    var length = content.slice(0, 4).readUInt32BE(0);

    return {
        message: content.slice(4, length + 4).toString(),
        id: content.slice(length + 4).toString()
    };
}
/**
 * 提供基于PKCS7算法的加解密接口
 */
var PKCS7Encoder = {};

/**
 * 删除解密后明文的补位字符
 text 解密后的明文
 */
PKCS7Encoder.decode = function (text) {
    var pad = text[text.length - 1];

    if (pad < 1 || pad > 32) {
        pad = 0;
    }

    return text.slice(0, text.length - pad);
};