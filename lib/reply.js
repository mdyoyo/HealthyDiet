
/**
 * 企业响应的消息同样应该经过加密，
 * 并带上msg_signature、timestamp、nonce及密文，
 * 其中timestamp、nonce由企业指定，
 * msg_signature、密文经特定算法生成
 * 标准的回包：
 *   <xml>
         <Encrypt><![CDATA[msg_encrypt]]></Encrypt>
         <MsgSignature><![CDATA[msg_signature]]></MsgSignature>
         <TimeStamp>timestamp</TimeStamp>
         <Nonce><![CDATA[nonce]]></Nonce>
     </xml>
 */
/**
 * 返回给微信的xml回包
 * @param msg_encrypt
 * @param msg_signature
 * @param timestamp
 * @param nonce
 * @returns {*}
 */
function replyXMLToWechat(msg_encrypt,msg_signature,timestamp,nonce){
    var tmpl = require("tmpl");
    var replyTmpl = "<xml>" +
        "<Encrypt><![CDATA[{msg_encrypt}]]></Encrypt> " +
        "<MsgSignature><![CDATA[{msg_signature}]]></MsgSignature> " +
        "<TimeStamp>timestamp</TimeStamp> " +
        "<Nonce><![CDATA[{nonce}]]></Nonce> " +
        "</xml>";
    return  tmpl(replyTmpl,{
        msg_encrypt : msg_encrypt,
        msg_signature : msg_signature,
        timestamp : timestamp,
        nonce : nonce
    });
}
/**
 * 回复文本消息给用户
 * @param msg 包括
 */
function replyTextToUSer_mw(msg,userInput){
    var replyText;
    //TODO 根据userInput查询数据库得到相关信息，这里先写死了
    if(userInput === '土豆'){
        replyText = "热量：76 大卡(每100克)"
    }else if(userInput === '苹果'){
        replyText = "热量：52 大卡(每100克)"
    }else{
        replyText = "热量爆表啦"
    }
    var tmpl = require("tmpl");
    var replyTmpl = "<xml>" +
        "<ToUserName><![CDATA[{toUser}]]></ToUserName> " +
        "<FromUserName><![CDATA[{fromUser}]]></FromUserName> " +
        "<CreateTime><![CDATA[{time}]]></CreateTime> " +
        "<MsgType><![CDATA[{type}]]></MsgType> " +
        "<Content><![CDATA[{content}]]></Content> " +
        "</xml>";
    return  tmpl(replyTmpl,{
        toUser : msg.xml.FromUserName[0],
        fromUser : msg.xml.ToUserName[0],
        type : "text",
        time : Date.now(),
        content : replyText
    });
}
/**
 * 响应用户点击菜单（非跳转）
 * @param clickEvent
 */
function replyClick(clickEvent){

}

module.exports = {
    replyTextToUSer_mw : replyTextToUSer_mw,
    replyXMLToWechat:replyXMLToWechat,
    replyClick : replyClick
};