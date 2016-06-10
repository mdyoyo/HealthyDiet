var later = require('later');
var https = require('https');
var fs = require('fs');

var corpId = require('./lib/config').corpID;
var corpSecret = require('./lib/config').corpSecret;
var access_token;



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

