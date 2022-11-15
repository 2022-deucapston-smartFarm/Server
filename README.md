# Server
SmartFarm 센서와 어플간에 연결을 도와주는서버

## db 구조
```
var sensorOptionSchema = mongoose.Schema({
        name : String,
        temperature : Number,
        co2 : Number,
        ph : Number,
        illuminance : Number
});
```
기본 센서 옵션 저장 역할 부분으로 해당 값을 기준으로 센서를 자동제어
```
var sensorSchema = mongoose.Schema({
        name : String,
        date : Date,
        temperature : Number,
        humidity : Number,
        co2 : Number,
        ph : Number,
        illuminance : Number
});
```
10분마다 db에 센서값을 저장
```
var dailySchema = mongoose.Schema({
        name : String,
        date : String,
        temperature : [Number],
        humidity : [Number],
        co2 : [Number],
        ph : [Number],
        illuminance : [Number]
});
```
일일통계 저장역할로 1시간마다 실행되며 기존 센서스키마에서 한시간 분량을 가져와 평균값을 계산하여 배열로 저장
예를들면 일일통계 스키마에는 date로 '2022-10-19'일이 저장되면 5가지 센서값에는 24개의 크기를 배열이 저장되어 0~23시까지의 정보가 저장된다.
이를 어플에서 하루 통계치로 시간대별 평균값을 알수있다.
```
var weekSchema = mongoose.Schema({
        name : String,
        startDate : String,
        endDate : String,
        temperature : [Number],
        humidity : [Number],
        co2 : [Number],
        ph : [Number],
        illuminance :[Number]
});
```
주간통계 스키마로 매주 월요일 새벽1시에 저장작업에 들어가고 월요일부터 일요일까지의 일일통계값을 평균내어서 저장한다.
일일통계처럼 24개 크기의 배열로 저장되어 0~23시까지의 평균값이 저장되고 startDate,endDate는 '2022-10-19'의 형태로 저장된다.

---
## 센서 정보 호출 (어플에서 호출)
기본센서정보 저장
mSocket.emit("sensorNewInfo",data)
data는 json파일 형식으로 name,temperature,co2,ph,illuminance의 값을 보내주면된다.

---
센서 정보 받기
```
mSocket.emit("sensorInfo",true)//센서 시작 명령어
getSensorInfo = Emitter.Listener { args->
            Log.d("sensorInfo",args[0].toString())//해당 부분에 데이터 받아온 json파일 풀어서 저장하기
}
SocketIoInstance.mSocket.on("sensorInfo",getSensorInfo)//센서 정보 리스너 선언
```
해당 명령어가 실행되면 서버에서 기존에 저장된 센서정보를 한번 보내준후 해당 접속된 소켓을 sensor룸에다 join시켜준다
sensor룸은 아두이노에서 센서 정보를 받아오면 바로넘겨주는 방으로 접속되면 아두이노에서 보내는 센서정보를 바로 받을수있다.

---
제어 정보 받기
```
mSocket.emit("controlInfo",true)//센서 정보 한번받기
getControlInfo = Emitter.Listener { args->
            Log.d("ControlInfo",args[0].toString())//해당 부분에 데이터 받아온 json파일 풀어서 저장하기
}
SocketIoInstance.mSocket.on("controlInfo",getControlInfo)//센서 정보 리스너 선언
```
현제 아두이노에서 제어가능한 센서의 정보를 전달해준다.

---
제어 정보 전달
mSocket.emit("controlFan",true/false)//팬 입력값에 따라 동작
mSocket.emit("controlHeat",true/false)//히터 입력값에 따라 동작 -> 앱에서 팬이 켜졌을때만 제어가능하도록 해줘야할듯??
mSocket.emit("controlLED",true/false)//led 입력값에 따라 동작
mSocket.emit("controlWater",true/false)//워터펌프 입력값에 따라 동작
해당 명령어 실행시 동작처리후 제어센서 정보를 다시 보내준다.

---
**통계 정보 조회
mSocket.emit("chartInfo",data)
data는 json파일 형식으로 startDate , endDate를 보내주면 서버에서 해당 날짜의 통계를 보내준다
chartInfo로 계산된 데이터는 전송되어 더미데이터 weekstats와 같은 상태로 데이터를 받을수있다.
---
공지 부분 미정

---

##더미데이터 받아오기
```
socket.emit("dumySensor",true);
--->
sensor ={
    name = "상추";
    date = "2022-11-01 23:20:00";
    temperature = 21;
    humidity = 62;
    co2 = 2600;
    ph = 6.0;
    illuminance = 2600;
}
```
해당 더미센서 파일 받아온다.
---
```
socket.emit("dumyDaily",true);
--->
dailyStats ={
    name = "상추";
    date = "2022-11-01";
    temperature = [19,20,18,18,18,19,20,20,17,16,19,20,18,18,18,19,20,20,17,16,23,21,25,21];
    humidity = [62,64,67,64,67,59,58,57,57,53,62,64,67,64,67,59,58,57,57,53,58,56,63,61];
    co2 = [2600,2500,2400,2200,2500,2556,2900,2600,2500,2100,2600,2500,2400,2200,2500,2556,2900,2600,2500,2100,2300,2600,2660,2335];
    ph = [6.0,5.6,4.5,6.4,6.2,6.1,6.7,5.7,6.4,6.7,6.0,5.6,4.5,6.4,6.2,6.1,6.7,5.7,6.4,6.7,5.9,5.8,5.7,6.7];
    tilluminance = [40000,43000,45000,44330,30000,23450,45630,35043,34906,45023,40000,43000,45000,44330,30000,23450,45630,35043,34906,45023,34563,42663,37342,49352];
}
```
해당 더미 일일평균 파일을 받아온다.
---
```
socket.emit("dumyWeek",true);
--->
weekStats ={
    name = "상추";
    startDate = "2022-10-31";
    endDate = "2022-11-06";
    temperature = [19,20,18,18,18,19,20,20,17,16,19,20,18,18,18,19,20,20,17,16,23,21,25,21];
    humidity = [62,64,67,64,67,59,58,57,57,53,62,64,67,64,67,59,58,57,57,53,58,56,63,61];
    co2 = [2600,2500,2400,2200,2500,2556,2900,2600,2500,2100,2600,2500,2400,2200,2500,2556,2900,2600,2500,2100,2300,2600,2660,2335];
    ph = [6.0,5.6,4.5,6.4,6.2,6.1,6.7,5.7,6.4,6.7,6.0,5.6,4.5,6.4,6.2,6.1,6.7,5.7,6.4,6.7,5.9,5.8,5.7,6.7];
    tilluminance = [40000,43000,45000,44330,30000,23450,45630,35043,34906,45023,40000,43000,45000,44330,30000,23450,45630,35043,34906,45023,34563,42663,37342,49352];
}
```
해당 더미 주간평균 파일을 받아온다.

## 기준값 업데이트  
sensorNewInfo -> json파일로 이름,온도,co2,ph,조도 값을 보내면 한번에 등록가능  
standardName -> 이름값전송시 이름변경  
standardTemperature -> 온도값 전송시 온도값변경  
standardCo2 -> co2값 전송시 co2값 변경  
standardPh -> ph값 전송시 ph값 변경  
standardIlluminance -> 조도값 전송시 조도값 변경  

