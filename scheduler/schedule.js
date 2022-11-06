const schedule = require('node-schedule');
const sfc = require('./scheduleFunction');

class scheduler{
    constructor(){
        this.startJob();
    }
    startJob(){
        schedule.scheduleJob('*/10 * * * *',sfc.hourSensor);//10분마다 센서데이터 db에 저장
        schedule.scheduleJob('5 */1 * * *',sfc.dailySensor);//한시간 간격으로 해당시간에대한 평균값을 daily에 저장
        schedule.scheduleJob('15 1 * * 1',sfc.weekSensor);//월요일 새벽에 실행되어 해당주간에 시간평균값들을 계산해서 주간데이터로 저장
    }
}

module.exports = new scheduler();
