module.exports.sensorWork = {
    heat : false,
    fan : false,
    led : false,
    waterpump : false
};
module.exports.sensorOption ={
    name : "",
    temperature : 21,
    co2 : 2600,
    ph : 6.0,
    illuminance : 40000
};
module.exports.sensor = {//sensor 값 온도,습도,co2,ph,조도
    name : "",
    date : "",
    temperature : 21,
    humidity : 68,
    co2 : 2600,
    ph : 6.0,
    illuminance : 40000
};
module.exports.dailyStats = {//chart 값 온도,습도,co2,ph
    name : "",
    date : "",
    temperature : [21],
    humidity : [68],
    co2 : [2600],
    ph : [6.0],
    illuminance : [40000]
};
module.exports.weekStats = {//chart 값 온도,습도,co2,ph
    name : "",
    startDate : "",
    endDate : "",
    temperature : [21],
    humidity : [68],
    co2 : [2600],
    ph : [6.0],
    illuminance : [40000]
};
    

module.exports.setSensorWork = function(heat,fan,led,waterpump){
    this.sensorWork.heat = heat;
    this.sensorWork.fan = fan;
    this.sensorWork.led = led;
    this.sensorWork.waterpump = waterpump;
}
module.exports.setSensorOption = function(name,temperature,co2,ph,illuminance){
    this.sensorOption.name = name;
    this.sensorOption.temperature = temperature;
    this.sensorOption.co2 = co2;
    this.sensorOption.ph = ph;
    this.sensorOption.illuminance = illuminance;
}
module.exports.setSensor = function(name,date,temperature,humidity,co2,ph,illuminance){
    this.sensor.name = name;
    this.sensor.date = date;
    this.sensor.temperature = temperature;
    this.sensor.humidity = humidity;
    this.sensor.co2 = co2;
    this.sensor.ph = ph;
    this.sensor.illuminance = illuminance;
}
module.exports.setDailyStats = function(name,date,temperature,humidity,co2,ph,illuminance){
    this.dailyStats.name = name;
    this.dailyStats.date = date;
    this.dailyStats.temperature = temperature;
    this.dailyStats.humidity = humidity;
    this.dailyStats.co2 = co2;
    this.dailyStats.ph = ph;
    this.dailyStats.illuminance = illuminance;
}
module.exports.setWeekStats = function(startDate,endDate,temperature,humidity,co2,ph,illuminance){
    this.weekStats.startDate = startDate;
    this.weekStats.endDate = endDate;
    this.weekStats.temperature = temperature;
    this.weekStats.humidity = humidity;
    this.weekStats.co2 = co2;
    this.weekStats.ph = ph;
    this.weekStats.illuminance = illuminance;
}

module.exports.cleanSensorWork = function(){
    this.sensorWork.heat = false;
    this.sensorWork.fan = false;
    this.sensorWork.led = false;
    this.sensorWork.waterpump = false;
}
module.exports.cleanSensorOption = function(){
    this.sensorOption.name = "";
    this.sensorOption.temperature = 0;
    this.sensorOption.co2 = 0;
    this.sensorOption.ph = 0;
    this.sensorOption.illuminance = 0;
}
module.exports.cleanSensor = function(){
    this.sensor.name = "";
    this.sensor.date = "";
    this.sensor.temperature = 0;
    this.sensor.humidity = 0;
    this.sensor.co2 = 0;
    this.sensor.ph = 0;
    this.sensor.illuminance = 0;
}
module.exports.cleanDailyStats = function(){
    this.dailyStats.name = "";
    this.dailyStats.date = "";
    this.dailyStats.temperature = [0];
    this.dailyStats.humidity = [0];
    this.dailyStats.co2 = [0];
    this.dailyStats.ph = [0];
    this.dailyStats.illuminance = [0];
}
module.exports.cleanWeekStats = function(){
    this.weekStats.name = "";
    this.weekStats.startDate = "";
    this.weekStats.endDate = "";
    this.weekStats.temperature = [0];
    this.weekStats.humidity = [0];
    this.weekStats.co2 = [0];
    this.weekStats.ph = [0];
    this.weekStats.illuminance = [0];
}

module.exports.dumySensor = function(){
    this.sensor.name = "상추";
    this.sensor.date = "2022-11-01T21:20:00.017Z";
    this.sensor.temperature = 21;
    this.sensor.humidity = 62;
    this.sensor.co2 = 2600;
    this.sensor.ph = 6.0;
    this.sensor.illuminance = 2600;
    let temp = this.sensor;
    this.cleanSensor();
    return temp;
}
module.exports.dumyDailyStats = function(){
    this.dailyStats.name = "상추";
    this.dailyStats.date = "2022-11-01";
    this.dailyStats.temperature = [19,20,18,18,18,19,20,20,17,16,19,20,18,18,18,19,20,20,17,16,23,21,25,21];
    this.dailyStats.humidity = [62,64,67,64,67,59,58,57,57,53,62,64,67,64,67,59,58,57,57,53,58,56,63,61];
    this.dailyStats.co2 = [2600,2500,2400,2200,2500,2556,2900,2600,2500,2100,2600,2500,2400,2200,2500,2556,2900,2600,2500,2100,2300,2600,2660,2335];
    this.dailyStats.ph = [6.0,5.6,4.5,6.4,6.2,6.1,6.7,5.7,6.4,6.7,6.0,5.6,4.5,6.4,6.2,6.1,6.7,5.7,6.4,6.7,5.9,5.8,5.7,6.7];
    this.dailyStats.illuminance = [40000,43000,45000,44330,30000,23450,45630,35043,34906,45023,40000,43000,45000,44330,30000,23450,45630,35043,34906,45023,34563,42663,37342,49352];
    let temp = this.dailyStats;
    this.cleanDailyStats();
    return temp;
}
module.exports.dumyWeekStats = function(){
    this.weekStats.name = "상추";
    this.weekStats.startDate = "2022-10-31";
    this.weekStats.endDate = "2022-11-06";
    this.weekStats.temperature = [19,20,18,18,18,19,20,20,17,16,19,20,18,18,18,19,20,20,17,16,23,21,25,21];
    this.weekStats.humidity = [62,64,67,64,67,59,58,57,57,53,62,64,67,64,67,59,58,57,57,53,58,56,63,61];
    this.weekStats.co2 = [2600,2500,2400,2200,2500,2556,2900,2600,2500,2100,2600,2500,2400,2200,2500,2556,2900,2600,2500,2100,2300,2600,2660,2335];
    this.weekStats.ph = [6.0,5.6,4.5,6.4,6.2,6.1,6.7,5.7,6.4,6.7,6.0,5.6,4.5,6.4,6.2,6.1,6.7,5.7,6.4,6.7,5.9,5.8,5.7,6.7];
    this.weekStats.illuminance = [40000,43000,45000,44330,30000,23450,45630,35043,34906,45023,40000,43000,45000,44330,30000,23450,45630,35043,34906,45023,34563,42663,37342,49352];
    let temp = this.weekStats;
    this.cleanWeekStats();
    return temp;
}



