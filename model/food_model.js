var mongoose=require('mongoose');
var Schema = mongoose.Schema;

var foodDataSchema=new Schema({
  title:String,
  calory:String,
  detail:String,
  img:String
});

exports.foodData = mongoose.model('foodData',foodDataSchema);
