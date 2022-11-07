const schema = require('../schema/schema');
const sf = require('../schema/data');

function StringToDate(date){
	let temp = date.toISOString();
	return temp.substring(0,10);
}

module.exports.hourSensor = function(){//스케줄 작업,10분마다 db처리
	let date = new Date();
	//sensor.date = date.toFormat('YYYY-MM-DD HH24:MI:SS');
	date.setHours(date.getHours()+9)
	sf.sensor.date = date;
	let newSensor = new schema.SensorSchema(sf.sensor);
	newSensor.save(function(error){
		if(error)
			console.log("db 센서 10분단위 저장 실패");
		else
			console.log("db 센서 10분단위 저장 성공");
	});
}

module.exports.dailySensor = async function(){//스케줄 작업,일간 db처리
	let endTime = new Date();
	let startTime = new Date();
	endTime.setHours(endTime.getHours()+9);
	startTime.setHours(endTime.getHours()-1);
	let temperature =0;
	let humidity =0;
	let co2 =0;
	let ph =0;
	let illuminance =0;
	let count =0;
	let name ="";
    sf.cleanDailyStats;
	await schema.SensorSchema.find({'date' : {'$gte' : startTime , '$lt' : endTime}},function(error,data){
		if(error){
			console.log("db 일간 처리 실패");
		}else{
			if(data == null){
				console.log("empty");
				return;
			}
			data.forEach(element => {
				count++;
				name = element.name;
				temperature += element.temperature;
				humidity += element.humidity;
				co2 += element.co2;
				ph += element.ph;
				illuminance += element.illuminance;
			});
            sf.setDailyStats(name,StringToDate(startTime),[(temperature / count).toFixed(2)],[(humidity / count).toFixed(2)],[(co2 / count).toFixed(2)],[(ph / count).toFixed(2)],[(illuminance / count).toFixed(2)]);
			//console.log(dailyStats);
		}
	}).clone();
	await schema.DailySchema.findOne({'date' : StringToDate(startTime)},function(error,data){
		if(error){
			console.log("db 일간 불러오기 실패");
		}else{
			if(data == null){
				//startTime.setHours(startTime.getHours()-9);
				let time = startTime.getHours();
				if(time != 0){//일간데이터에 기존값이 없으면 더미데이터 채워주기
					for (let i=0;i<time;i++){
						sf.dailyStats.temperature.unshift(26);
						sf.dailyStats.humidity.unshift(68);
						sf.dailyStats.co2.unshift(2600);
						sf.dailyStats.ph.unshift(6.0);
						sf.dailyStats.illuminance.unshift(40000);
					}
				}
				let newDaily = new schema.DailySchema(sf.dailyStats);
				newDaily.save();
				console.log("db daily 1시간 처리 생성");
			}else{
				schema.DailySchema.updateOne({'date' : StringToDate(startTime)},{
					$push : { 'temperature' : sf.dailyStats.temperature,
					'humidity' : sf.dailyStats.humidity,
					'co2' : sf.dailyStats.co2,
					'ph' : sf.dailyStats.ph,
					'illuminance' : sf.dailyStats.illuminance
				}},function(error){
					if(error){
						console.log("db daily 처리 오류");
					}else{
						console.log("db daily 처리 성공");
					}
				});
			}
		}
	}).clone();
}

module.exports.weekSensor = async function(){//스케줄 작업,주간 db처리(매주 월요일 처리), test해보기
	let endTime = new Date();
	let startTime = new Date();
	endTime.setDate(endTime.getDate()-1);
	endTime.setHours(endTime.getHours()+9);
	startTime.setDate(endTime.getDate()-6);
	startTime.setHours(endTime.getHours());
	let temperature =[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	let humidity =[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	let co2 =[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	let ph =[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	let illuminance =[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	let count =0;
    sf.cleanWeekStats;
	await schema.DailySchema.find({'date' : {'$gte' : StringToDate(startTime) , '$lte' : StringToDate(endTime)},function(error,data) {
		if(error){
			console.log("db daily 조회 오류");
		}else{
			if(data == null){
				console.log("db week데이터 생성내역 없음");
			}else{
				data.forEach(element => {
					count++;
					sf.weekStats.name = element.name;
					for(let i=0;i<24;i++){
						temperature[i] += element.temperature[i];
						humidity[i] += element.humidity[i];
						co2[i] += element.co2[i];
						ph[i] += element.ph[i];
						illuminance[i] += element.illuminance[i];
					}
				});
				for(let i=0;i<24;i++){
					temperature[i] /= count;
					humidity[i] /= count;
					co2[i] /= count;
					ph[i] /= count;
					illuminance[i] /= count;
				}
                sf.setWeekStats(StringToDate(startTime),StringToDate(endTime),temperature,humidity,co2,ph,illuminance);
				let newWeek = new schema.WeekSchema(sf.weekStats);
				newWeek.save();
			}
		}
	}}).clone();
}

