import { ScheduleClass } from "./scheduleClass";
import { Injectable } from "@angular/core";
import * as moment from 'moment';
import { ConfigService } from "../config.service";
const parseHTML = require('nativescript-xml2js').parseString;
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

/** this regex is used to extract the data part of the html */
const extractScheduleRegex = new RegExp('<ul data-role="listview" data-theme="d" data-divider-theme="b">[^]*</ul>');
/** this regex is used to extract the date at the top of the page */
const extractDateRegex = new RegExp('<h1>([^]* \\d{1,2} [^]*)</h1>');

/**
 * this class stores the data for a day of the schedule
 */
@Injectable()
export class ScheduleDay{
    /** date at the format "Jeudi 13 Novembre" */
    date: string;
    /** date this object was created/updated from the website */
    cacheDate: string;
    /** this of classes */
    classes: Array<ScheduleClass> = [];

    constructor(private config: ConfigService){}

    /**
     * populate this instance by parsing the html
     * @param html 
     */
    buildFromHTML(html: string): Promise<ScheduleDay>{
        return new Promise((resolve, reject) => {

            let cleanHTML = extractScheduleRegex.exec(html);
            if(!cleanHTML){
                this.config.jsessionid = "";
                return reject("J'ai tout cassé! Rafraichit la page stp");
            }
            parseHTML(cleanHTML.toString(), (err, result) => {
                if(err)
                    return reject(err);
                try{
                    let day = extractDateRegex.exec(html);
                    this.date = entities.decode(day[1].toString());

                    this.populateClassesWithParsedHTML(result);
                    this.updateCacheDate();
                    resolve(this);            
                }catch(ex){
                    return reject(ex);
                }
            });
        });
    }

    /**
     * used parsed html to populate this instance
     * @param parsedHTML 
     */
    private populateClassesWithParsedHTML(parsedHTML){
        this.classes = [];
        //if the day is empty 
        if(!parsedHTML.ul.li) 
            return;

        let list = parsedHTML.ul.li;
        for(let i = 0; i < list.length; i += 2){
            let header = list[i];
            let content = list[i+1];

            let classe = new ScheduleClass();
            classe.name = header._;
            classe.type = header.span[0]._;
            classe.room = content.h3[0].trim();
            if(content.p[1]._)
                classe.extraInfo = content.p[1]._;
            classe.speaker = content.p[0].strong[0].trim();
            let time = content.p[2].strong[0].trim();
            time = time.split('-');
            classe.timeStart = time[0];
            classe.timeEnd = time[1];
            
            this.classes.push(classe);
        }
    }

    /**
     * set the date this instance has been updated to today
     */
    updateCacheDate(){
        this.cacheDate = moment().format("DD/MM/YYYY");
    }

    /**
     * get the DB id of this instance
     */
    id(): string{
        return ScheduleDay.formatDate(this.date);
    }

    /**
     * parse the date into a Moment object
     */
    dateMoment(): moment.Moment{
        return moment(this.date, "DD MMM", 'fr');
    }

    /**
     * format the date "Jeudi 12 Novembre" into "12/11" 
     * @param date 
     */
    static formatDate(date: string): string{
        let mom = moment(date, "DD MMM", 'fr');
        return ScheduleDay.formatMoment(mom);
    }

    /**
     * format the moment into valid DB id format
     * @param mom 
     */
    static formatMoment(mom: moment.Moment): string{
        return mom.format("DD/MM");
    }
}