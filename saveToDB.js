var fs = require('fs');

var db_url = require('./lib/config.js').database;
//连接数据库
var mongoose = require('mongoose');
var foodData = require('./model/food_model.js').foodData;
mongoose.connect(db_url);
mongoose.connection.on('error',console.error.bind(console,'连接数据库失败'));

readData('data_food/foods.json');
/**
 * 读取数据到本地
 */
function readData(path) {
    fs.readFile(path, {encoding: 'utf-8'}, function (err, bytesRead) {
        if (err)
            console.log(err);
        else {
            var data = JSON.parse(bytesRead);
            for(var i=0;i<1100;i++){
                var newFood = new foodData({
                    title: data[i].title,
                    calory: data[i].calory,
                    detail: "http://www.boohee.com"+data[i].detail,
                    img: data[i].img
                });
                newFood.save(function(err,doc){
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log('保存成功');
                    }
                });
            }

        }
    });
}

