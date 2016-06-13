
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
    var replyText = userInput;
    if(replyText == ""){
        replyText = "抱歉，食物库中还没有此食物哦~"
    }
    //TODO 根据userInput查询数据库得到相关信息，这里先写死了
    //if(userInput === '土豆'){
    //    replyText = "热量：76 大卡(每100克)"
    //}else if(userInput === '苹果'){
    //    replyText = "热量：52 大卡(每100克)"
    //}else{
    //    replyText = "热量爆表啦"
    //}
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
function createItem(msg){
    var eventKey =  msg.xml.EventKey[0];
    if(eventKey === 'V1001'){
        return {
            title:"春·Spring",
            description:'鸡肉调节免疫，韭菜驱散寒冷，红薯促进消化，蜂蜜润肠通便。',
            picUrl:"http://images.meishij.net/p/20150420/8fc36f49a7d9c8830d467b66d9ad2220_150x150.jpg",
            url:"http://www.meishij.net/changshi/chunjiyangshengbibeidesidazhuangyuancai.html"
        };
    }
    if(eventKey === 'V1002'){
        return {
            title:"夏·Summer",
            description:"孟夏之日，天地始交，万物并秀。\n鸭蛋补夏，莲子养心，章鱼补血，草莓解毒，莴苣通气，草菇抗癌，豌豆清肠，茄子抗老。",
            picUrl:"http://images.meishij.net/p/20150609/e46b8f6e13299b567a62936945e9759c_150x150.jpg",
            url:"http://www.meishij.net/changshi/xiajiruhezhengqueshiliaoyangsheng.html"
        };
    }
    if(eventKey === 'V1003'){
        return {
            title:"秋·Autumn",
            description:"进入秋季，蔬果丰收，虾蟹肥美，加之素有秋季进补的习惯，不少人在各类美食面前都放松了警惕。但俗话说：病从口入，不正确的饮食习惯、饮食方式会让身体健康受损。秋季饮食调养应遵循“养阴防燥”的原则，饮食宜养阴，滋润多汁。",
            picUrl:"http://images.meishij.net/p/20141029/fa47e74af683cb07dd7e5659a9813db8_150x150.jpg",
            url:"http://www.meishij.net/changshi/qiuriyinshiyaoyangyinfangzao.html"
        };
    }
    if(eventKey === 'V1004'){
        return {
            title:"冬·Winter",
            description:"北豆腐吃不胖能抗寒，山药全面滋补身体，胡萝卜激活内脏和血液，羊肉温经驱寒。",
            picUrl:"http://images.meishij.net/p/20141107/63354058e6ff975a9a038d9c74956b92_150x150.jpg",
            url:"http://www.meishij.net/changshi/dongjibichisidaonuanshencai.html"
        };
    }
}
/**
 * 用图文消息，响应用户点击菜单的事件（非直接跳转）
 */
function replyArticlesToClick(articleCount,msg){
    var tmpl = require("tmpl");
    var article_item_tmpl = "<item>" +
        "<Title><![CDATA[{title}]]></Title>" +
        "<Description><![CDATA[{description}]]></Description>" +
        "<PicUrl><![CDATA[{picUrl}]]></PicUrl>" +//图片链接
        "<Url><![CDATA[{url}]]></Url>" +//点击图文跳转链接
        "</item>";
    var item;
    if(msg.xml.Content[0] === '番茄炒蛋'){
        var tomato_picUrl_big = "http://s2.boohee.cn/house/food_big/big_photo201526184456623.jpg";
        var tomato_url = "http://www.boohee.com/shiwu/fanqiechaojidan";
        item = {
            title:"番茄炒蛋",
            description:"炒：炒是使用最广泛的一种烹调方法，用油量的高低决定热量高低，从而影响其在减肥期间的适宜程度，减肥期间推荐清淡少油的清炒菜肴。",
            picUrl:tomato_picUrl_big,
            url:tomato_url
        };
    }
    else{
        item = createItem(msg);
    }
    var articles = tmpl(article_item_tmpl,{
        title:item.title,
        description:item.description,
        picUrl:item.picUrl,
        url:item.url
    });
    console.log(articles);
    var replyTmpl = "<xml>" +
        "<ToUserName><![CDATA[{toUser}]]></ToUserName> " +
        "<FromUserName><![CDATA[{fromUser}]]></FromUserName> " +
        "<CreateTime><![CDATA[{time}]]></CreateTime> " +
        "<MsgType><![CDATA[{type}]]></MsgType> " +
        "<ArticleCount><![CDATA[{articleCount}]]></ArticleCount> " +
        "<Articles>"+ articles +"</Articles>" +
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