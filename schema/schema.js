const mongoose = require('mongoose');

const sensorOptionSchema = mongoose.Schema({
	name : String,
	temperature : Number,
	co2 : Number,
	ph : Number,
	illuminance : Number
});
const SensorOptionSchema = mongoose.model('sensorOption',sensorOptionSchema);

const sensorSchema = mongoose.Schema({
	name : String,
	date : Date,
	temperature : Number,
	humidity : Number,
	co2 : Number,
	ph : Number,
	illuminance : Number
});
const SensorSchema = mongoose.model('sensor',sensorSchema);

const dailySchema = mongoose.Schema({
	name : String,
	date : String,
	temperature : [Number],
	humidity : [Number],
	co2 : [Number],
	ph : [Number],
	illuminance : [Number]
});
const DailySchema = mongoose.model('daily',dailySchema);

const weekSchema = mongoose.Schema({
	name : String,
	startDate : String,
	endDate : String,
	temperature : [Number],
	humidity : [Number],
	co2 : [Number],
	ph : [Number],
	illuminance :[Number]
});
const WeekSchema = mongoose.model('week',weekSchema);


module.exports = {SensorOptionSchema,
    SensorSchema,
    DailySchema,
    WeekSchema}

