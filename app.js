const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const rtsp = require('rtsp-ffmpeg');

const schema = require('./schema/schema');
const db = require('./database');
const schedule = require('./scheduler/schedule');
const sf = require('./schema/data');
require('date-utils');

var port = 3000;
http.listen(port, ()=>{
	console.log("listening on :" + port);
});
app.get('/',function(req,res){
	res.send("<h1>Express server Start</h1>");
});


io.on('connection' , function(socket) { 
	console.log(socket.id, 'Connected');

	socket.on("connection",()=>{
		console.log(`Socket connected : ${socket.id}`);
	});

	socket.on("sensorNewInfo",function(d){//새로운 식물정보 등록,DB저장
		const data = JSON.parse(d);
		sf.setSensorOption(data.name,data.temperature,data.co2,data.ph,data.illuminance);
		let newSensorOption = new schema.SensorOptionSchema(sf.sensorOption);
		newSensorOption.save(function(error,data){//db저장
			if(error){
				console.log("db sensor new info save error");
			}else{
				console.log("db sensor new info save ok");
			}
		});
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
	socket.on("controlLED",function(data){//LED제어
		io.to('control').emit('led',data);
		sf.sensorWork.led = data;
		socket.emit('controlInfo',JSON.stringify(sf.sensorWork));//센서정보 전송
	});
	socket.on("controlWater",function(data){//워터펌프제어
		io.to('control').emit('water',data);
		sf.sensorWork.waterpump = data;
		socket.emit('controlInfo',JSON.stringify(sf.sensorWork));//센서정보 전송
	});

	//카메라
	socket.on("cameraConnection",function(d){//카메라 접속요청
		//아두이노 카메라 정보 받아와서 출력 url전달??
		
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
						socket.emit("chartEmpty",false);
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
						socket.emit("chartEmpty",false);
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
		socket.emit("dumySensor",JSON.stringify(sf.dumySensor));
	});
	socket.on("dumyDaily",function(d){//센서 데이터
		socket.emit("dumyDaily",JSON.stringify(sf.dumyDailyStats));
	});
	socket.on("dumyWeek",function(d){//센서 데이터
		socket.emit("dumyWeek",JSON.stringify(sf.dumyWeekStats));
	});

	//공지
	socket.on("noticeList",function(d){//공지사항 전달??
		
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
		//센서 정보 받아오면 식물정보 토대로 벗어날 경우 값조정,센서들 동작
		if(!sf.sensorWork.fan){
			if(sf.sensor.co2 >= sf.sensorOption.co2 + 500 || sf.sensor.temperature >= sf.sensorOption.temperature + 4){
				socket.emit('fan',true);
			}else if(sf.sensor.temperature <= sf.sensorOption.temperature - 5){
				socket.emit('fan',true);
				socket.emit('heat',true);
			}
		}else{//수정 필요
			if(sf.sensor.co2 <= sf.sensorOption.co2 -100 && sf.sensor.temperature < sf.sensorOption.temperature + 4)
				socket.emit('fan',false);
		}



		if(sf.sensor.ph > sf.sensorOption.ph + 1.0){
			//어플에 경고 메시지 출력
		}
	});
    
	socket.on("arduinoCameraInfo",function(d){//카메라 정보 받아와서 url출력??
		const data = JSON.parse(d);
	});





    socket.on("disconnect", () => {
        // 클라이언트의 연결이 끊어졌을 때 호출,방있으면 나가지도록 추가할것!!
        console.log(`Socket disconnected : ${socket.id}`);

    });

});
