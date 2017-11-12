const couchbaseModule = require("nativescript-couchbase");
import * as moment from 'moment';
import { ScheduleDay } from "./schedule/scheduleDay";

export class ScheduleCache{
    //static database = new couchbaseModule.Couchbase("test-database");

    static store(day: ScheduleDay){
        //Cache.database.createDocument(day);
        
        let date = moment(day.date, "DD MMM", 'fr');
        let key = date.format("DD/MM");
    }
} 