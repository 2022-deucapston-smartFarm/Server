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
                    if(data == null || data.length === 0){//비어있는경우 기본값 저장
                        sf.sensorOption.name = "상추";
                        let newSensorOption = new schema.SensorOptionSchema(sf.sensorOption);
                        newSensorOption.save(function(error,data){//db저장
                            if(error){
                                console.log("db sensor new info save error");
                            }else{
                                console.log("db sensor new info save ok");
                            }
                        });
                    }else{
                        console.log("db sensor new info find ok");
                        data.forEach(element => {
                            sf.setSensorOption(element.name,element.temperature,element.co2,element.ph,element.illuminance);
                        });
                    }
                }
            });
        })
        .catch((err)=>{
            console.log('db connection error: ' + err);
        })
        
    }
}

module.exports = new Database();