import { Couchbase } from "nativescript-couchbase";
import * as moment from 'moment';
import { ScheduleDay } from "./schedule/scheduleDay";

export class ScheduleCache{
    private static database: Couchbase;

    static init(){
        ScheduleCache.database = new Couchbase("schedule.db");
        this.database.createView("all", "1", function(document, emitter) {
            emitter.emit(document._id, document);
        });
    }

    static getForDay(date: moment.Moment): ScheduleDay{
        let id = ScheduleDay.formatMoment(date);
        let rows = ScheduleCache.database.executeQuery("all")
            .filter(doc => doc._id == id);
        if(rows.length == 0)
            return null;
        return rows[0];
    }

    static store(day: ScheduleDay){
        day.updateCacheDate();        
        let id = day.id();
        let rows = ScheduleCache.database.executeQuery("all");

        rows = rows.filter(doc => doc._id == id);
        
        if(rows.length == 0){
            ScheduleCache.database.createDocument(day, id);
        }else{
            ScheduleCache.database.updateDocument(id, day);
        }  
    }


}   