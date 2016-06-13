
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
        "<TimeStamp>"+timestamp+"</TimeStamp> " +
        "<Nonce><![CDATA[{nonce}]]></Nonce> " +
        "</xml>";
    return  tmpl(replyTmpl,{
        msg_encrypt : msg_encrypt,
        msg_signature : msg_signature,
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
 * 用图文消息，响应用户点击菜单的事件（非直接跳转）
 */
function replyArticlesToClick(articleCount,msg){
    var tmpl = require("tmpl");
    var article_item_tmpl = "<item>" +
        "<Title><![CDATA[title]]></Title>" +
        "<Description><![CDATA[description]]></Description>" +
        "<PicUrl><![CDATA[picUrl]]></PicUrl>" +//图片链接
        "<Url><![CDATA[url]]></Url>" +//点击图文跳转链接
        "</item>";
    var tomato_picUrl_big = "http://s2.boohee.cn/house/food_big/big_photo201526184456623.jpg";
    var tomato_picUrl_mid = "http://s2.boohee.cn/house/food_mid/mid_photo_201526184456623.jpg";
    var tomato_url = "http://www.boohee.com/shiwu/fanqiechaojidan";
    var item = {
        title:"番茄炒蛋",
        description:"炒：炒是使用最广泛的一种烹调方法，用油量的高低决定热量高低，" +
        "从而影响其在减肥期间的适宜程度，减肥期间推荐清淡少油的清炒菜肴。",
        picUrl:tomato_picUrl_big,
        url:tomato_url
    };

    var articles = tmpl(article_item_tmpl,{
        title:item.title,
        description:item.description,
        picUrl:item.picUrl,
        url:item.url
    });
    var replyTmpl = "<xml>" +
        "<ToUserName><![CDATA[{toUser}]]></ToUserName> " +
        "<FromUserName><![CDATA[{fromUser}]]></FromUserName> " +
        "<CreateTime><![CDATA[{time}]]></CreateTime> " +
        "<MsgType><![CDATA[{type}]]></MsgType> " +
        "<ArticleCount><![CDATA[{articleCount}]]></ArticleCount> " +
        "<Articles>"+articles+"</Articles>" +
        "</xml>";

    return  tmpl(replyTmpl,{
        toUser : msg.xml.FromUserName[0],
        fromUser : msg.xml.ToUserName[0],
        time : Date.now(),
        type : "news",
        articleCount : articleCount
    });

}

module.exports = {
    replyTextToUSer_mw : replyTextToUSer_mw,
    replyXMLToWechat:replyXMLToWechat,
    replyArticlesToClick : replyArticlesToClick
};