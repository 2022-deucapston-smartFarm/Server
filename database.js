const mongoose = require('mongoose');
const sf = require('./schema/data');
const schema = require('./schema/schema');

class Database{
    constructor(){
        this.connect();
    }
    connect(){
        mongoose.connect('mongodb://localhost:27017/smartFarm')
        .then(()=>{
            console.log('db connection ok');
            //sensorOption db에서 있는지 확인후 불러오기
            schema.SensorOptionSchema.find(function(error,data){
                if(error){
                    console.log("db sensor new info find error");
                }else{
                    if(data == null){
                        console.log("db sensor new info empty");
                        return;
                    }
                    console.log("db sensor new info find ok");
                    sf.setSensorOption(data.name,data.temperature,data.co2,data.ph,data.illuminance);
                }
            });
        })
        .catch((err)=>{
            console.log('db connection error: ' + err);
        })
        
    }
}

module.exports = new Database();