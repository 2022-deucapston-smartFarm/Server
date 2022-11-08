const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const rtsp = require('rtsp-ffmpeg');

const schema = require('./schema/schema');
const db = require('./database');
const schedule = require('./scheduler/schedule');
const sf = require('./schema/data');
const fcm = require('./schema/message');
const express_config= require('./express.js');
require('date-utils');

express_config.init(app);
var port = 3000;
http.listen(port, ()=>{
	console.log("listening on :" + port);
});

app.get('/',function(req,res){
	res.render('index',{});
});

io.on('connection' , function(socket) { 
	console.log(socket.id, 'Connected');

	socket.on("connection",()=>{
		console.log(`Socket connected : ${socket.id}`);
	});

	socket.on("sensorNewInfo",async function(d){//새로운 식물정보 등록,DB저장
		const data = JSON.parse(d);
		let name = sf.sensorOption.name;
		sf.setSensorOption(data.name,data.temperature,data.co2,data.ph,data.illuminance);
		await schema.SensorOptionSchema.updateOne({'name' : name},{
			'name' : sf.sensorOption.name,
			'temperature' : sf.sensorOption.temperature,
			'co2' : sf.sensorOption.co2,
			'ph' : sf.sensorOption.ph,
			'illuminance' : sf.sensorOption.illuminance
		});
		socket.emit('standardOption',JSON.stringify(sf.sensorOption));
	});
	//식물 기준값 개별 설정
	socket.on("standardName",async function(d){//이름 기준값 업데이트
		let name = sf.sensorOption.name;
		sf.sensorOption.name = d;
		schema.SensorOptionSchema.updateOne({'name' : name},{
			'name' : sf.sensorOption.name
		});
		socket.emit('standardOption',JSON.stringify(sf.sensorOption));
	});
	socket.on("standardTemperature",async function(d){//온도 기준값 업데이트
		sf.sensorOption.temperature = d;
		schema.SensorOptionSchema.updateOne({'name' : sf.sensorOption.name},{
			'temperature' : sf.sensorOption.temperature
		});
		socket.emit('standardOption',JSON.stringify(sf.sensorOption));
	});
	socket.on("standardCo2",async function(d){//co2 기준값 업데이트
		sf.sensorOption.co2 = d;
		await schema.SensorOptionSchema.updateOne({'name' : sf.sensorOption.name},{
			'co2' : sf.sensorOption.co2
		});
		socket.emit('standardOption',JSON.stringify(sf.sensorOption));
	});
	socket.on("standardPh",async function(d){//ph 기준값 업데이트
		sf.sensorOption.ph = d;
		schema.SensorOptionSchema.updateOne({'name' : sf.sensorOption.name},{
			'ph' : sf.sensorOption.ph
		});
		socket.emit('standardOption',JSON.stringify(sf.sensorOption));
	});
	socket.on("standardIlluminance",async function(d){//조도 기준값 업데이트
		sf.sensorOption.illuminance = d;
		schema.SensorOptionSchema.updateOne({'name' : sf.sensorOption.name},{
			'illuminance' : sf.sensorOption.illuminance
		});
		socket.emit('standardOption',JSON.stringify(sf.sensorOption));
	});
	socket.on("standardOption",function(d){//센서 기준값 전달
		socket.emit('standardOption',JSON.stringify(sf.sensorOption));//센서기준값 전송
	});
	


	socket.on("sensorInfo",function(d){//센서정보 전달을 위한 ROOM에 접속
		socket.emit('sensorInfo',JSON.stringify(sf.sensor));//센서정보 전송
		socket.join('sensor');//센서방 접속
	});

	//수동제어 모음
	socket.on("controlInfo",function(data){//센서제어정보 전달
		socket.emit('controlInfo',JSON.stringify(sf.sensorWork));//센서정보 전송
	});
	socket.on("controlFan",function(data){//팬제어
		io.to('control').emit('fan',data);
		sf.sensorWork.fan = data;
		socket.emit('controlInfo',JSON.stringify(sf.sensorWork));//센서정보 전송
	});
	socket.on("controlHeat",function(data){//히터제어
		io.to('control').emit('heat',data);
		sf.sensorWork.heat = data;
		socket.emit('controlInfo',JSON.stringify(sf.sensorWork));//센서정보 전송
	});
	socket.on("controlLed",function(data){//LED제어
		io.to('control').emit('led',data);
		sf.sensorWork.led = data;
		socket.emit('controlInfo',JSON.stringify(sf.sensorWork));//센서정보 전송
	});
	socket.on("controlWaterPump",function(data){//워터펌프제어
		io.to('control').emit('water',data);
		sf.sensorWork.waterpump = data;
		socket.emit('controlInfo',JSON.stringify(sf.sensorWork));//센서정보 전송
	});

	
	//통계
	socket.on("chartInfo",async function(d){//통계정보 전달,db에서 출력
		const data = JSON.parse(d); 
		if(data.mode == 1){//일일 통계 1
			await schema.DailySchema.findOne({'date' : d.date},function(error,data){//d.date = '2022-10-22'
				if(error){
					console.log("db daily 조회 오류");
				}else{
					if(data == null){
						socket.emit("DailyInfo",false);
					}else{
						sf.setDailyStats(data.name,data.date,data.temperature,data.humidity,data.co2,data.ph,data.illuminance);
						socket.emit("DailyInfo",JSON.stringify(sf.dailyStats));
					}
				}
			}).clone();
		}else{//주간 통계 2 
			await schema.WeekSchema.findOne({'startDate' : d.startDate},function(error,data){
				if(error){
					console.log("db week 조회 오류");
				}else{
					if(data == null){
						socket.emit("WeekInfo",false);
					}else{
						sf.setWeekStats(data.name,data.startDate,data.endDate,data.temperature,data.humidity,data.co2,data.ph,data.illuminance)
						socket.emit("WeekInfo",JSON.stringify(sf.weekStats));
					}
				}
			}).clone();
		}
	});

	//더미파일 받기
	socket.on("dumySensor",function(d){//센서 데이터
		socket.emit("dumySensor",JSON.stringify(sf.dumySensor()));
	});
	socket.on("dumyDaily",function(d){//센서 데이터
		socket.emit("dumyDaily",JSON.stringify(sf.dumyDailyStats()));
	});
	socket.on("dumyWeek",function(d){//센서 데이터
		socket.emit("dumyWeek",JSON.stringify(sf.dumyWeekStats()));
	});

	//공지 토큰 저장
	socket.on("fcm",async function(d){//fcm 토큰정보 저장
		await schema.FcmSchema.findOne({'token' : d},function(error,data){
			if(error){
				console.log("db token 조회 오류");
			}else{
				if(data == null){
					let newtoken = new schema.FcmSchema({'token' : d});
					newtoken.save(function(error){
						if(error)
							console.log("db token 저장 실패");
						else
							console.log("db token 저장 성공");
					});
				}else{
					console.log("db token 기존 데이터 존재");
				}
			}
		}).clone();
	});

	//아두이노 부분
	socket.on("arduinoConnect",function(d){//아두이노 연결확인
		socket.join('sensor');
		socket.join('control');
	});

	socket.on("arduinoSensorInfo",function(d){//센서정보를 받아와서 저장,ROOM에 접속된 클라있으면 정보 전달
		const data = JSON.parse(d);//센서 정보 업데이트
		let newDate = new Date();
		sf.setSensor(sf.sensorOption.name,newDate.toFormat('YYYY-MM-DD HH24:MI:SS'),data.temperature,data.humidity,data.co2,data.ph,data.illuminance)

		if(io.sockets.adapter.rooms.get('sensor')?.size >1){//어플로 데이터 전송
			io.to('sensor').emit('sensorInfo',JSON.stringify(sf.sensor));
		}

		//센서 정보 받아오면 식물정보 토대로 벗어날 경우 값조정,센서들 동작,메시지 전송
		if(data.waterlevel == false){//수위 경고 메시지(동작확인후 조건문 수정)
			fcm.message("수위 부족","물을 보충해주세요.");
		}

		if(sf.sensor.ph < sf.sensorOption.ph - 1.0){//ph 경고 메시지
			fcm.message("ph농도 부족", "배양액을 채워주세요.");
		}else if(sf.sensor.ph > sf.sensorOption.ph + 1.0){
			fcm.message("ph농도 과다", "배양액이 너무 많아요. 희석시켜주세요.");
		}

		if(sf.sensor.co2 >= sf.sensorOption.co2 + 500 || sf.sensor.temperature > sf.sensorOption.temperature + 4){//특정온도,co2 이상시 팬동작
			if(!sf.sensorWork.fan){
				socket.emit('fan',true);
			}
		}else if(sf.sensor.temperature <= sf.sensorOption.temperature - 4){//특정온도 이하시 히터팬 동작
			if(!sf.sensorWork.fan){
				socket.emit('fan',true);
			}
			socket.emit('heat',true);
		}else if(sf.sensor.temperature <= sf.sensorOption.temperature+3){
			if(sf.sensorWork.fan){
				socket.emit('fan',false);
			}
		}else if(sf.sensor.co2 < sf.sensorOption.co2){//co2가 정상값으로 돌아오면 팬종료,히터켜져있으면 동작무시
			if(sf.sensorWork.heat){
				socket.emit('fan',false);
			}
		}else if(sf.sensor.temperature <= sf.sensorOption.temperature+1){//정상온도로 돌아오면 종료
			socket.emit('fan',false);
			socket.emit('heat',false);
		}
	});
    
	//카메라
	socket.on('jpgstream_serverio', function(msg){
		io.emit('jpgstream_clientio',msg.pic)
	});


    socket.on("disconnect", () => {
        // 클라이언트의 연결이 끊어졌을 때 호출,방있으면 나가지도록 추가할것!!
        console.log(`Socket disconnected : ${socket.id}`);

    });

});
