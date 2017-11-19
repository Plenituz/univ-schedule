import { Couchbase } from "nativescript-couchbase";
import * as moment from 'moment';
import { ScheduleDay } from "./schedule/scheduleDay";

/**
 * this class is in charge of interfacing with the database
 * I use Couchbase as a database and the use is primary but 
 * for what is needed it's good enough. Although it might cause problems if the DB 
 * gets too big
 */
export class ScheduleCache{
    private static database: Couchbase;

    /**
     * this has to be called before using any other function of this class
     */
    static init(){
        ScheduleCache.database = new Couchbase("schedule.db");
        this.database.createView("all", "1", function(document, emitter) {
            emitter.emit(document._id, document);
        });
    }

    /**
     * clear the DB of all it's content
     */
    static clear(){
        let rows = ScheduleCache.database.executeQuery("all");
        for(let i = 0; i < rows.length; i++){
            ScheduleCache.database.deleteDocument(rows[i]._id);
        }
    }

    /**
     * get the cached day for the given Moment
     * @param date 
     */
    static getForDay(date: moment.Moment): ScheduleDay{
        let id = ScheduleDay.formatMoment(date);
        let rows = ScheduleCache.database.executeQuery("all")
            .filter(doc => doc._id == id);
        if(rows.length == 0)
            return null;
        return rows[0];
    }

    /**
     * store or update the day in the DB
     * this function makes sure the days you store always have an
     * _id equal to the day formatted as DD/MM, so no duplicate day in the DB
     * 
     * That's also why you shouldn't put day manually in the DB
     * @param day 
     */
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