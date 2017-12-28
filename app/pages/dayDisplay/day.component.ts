import { Component, OnInit, NgZone } from "@angular/core";
import { ConfigService } from "../../shared/config.service";
import { UserService } from "../../shared/user/user.service";
import { Page } from "ui/page";
import { RouterExtensions } from "nativescript-angular/router";
import { ScheduleDay } from "../../shared/schedule/scheduleDay";
import { ScheduleClass } from "../../shared/schedule/scheduleClass";
import { ScheduleCache } from "../../shared/scheduleCache";
import { Router } from "@angular/router";
import * as moment from 'moment';
import { DataPasser } from "../../shared/dataPasser.service";

/**
 * main view, the schedule displaying component
 */
@Component({
    selector: "day", 
    providers: [UserService],
    templateUrl: /*"./pages/dayDisplay/" +*/ "day.html",
    styleUrls: [/*"./pages/dayDisplay/" +*/ "day-common.css", /*"/pages/dayDisplay/" +*/ "day.css"]
})
export class DayComponent implements OnInit{
    /** the currently displayed day */
    day: ScheduleDay = new ScheduleDay(this.config);
    displayedMoment: moment.Moment;
    /** indicates weither or not the page is currently loading */
    loading: boolean = false;
    /** status text displayed at the top of the screen */
    status: string = ""; 

    constructor(private userService: UserService, private page: Page, 
        private router: Router, private ngZone: NgZone, 
        private routerExtensions: RouterExtensions,
        private dataPasser: DataPasser, private config: ConfigService)
    {
        ScheduleCache.init();
        this.displayCurrentDay();
    }

    clickOptions(){
        this.router.navigate(["/settings"]);
    }

    clickNext(){
        if(!this.day.date)
            return;
        let nextDay;
        if(this.displayedMoment){
            let date = this.day.date + " " + this.displayedMoment.format("YYYY");
            nextDay = moment(date, "DD MMM YYYY", 'fr').add(1, 'days');
        }else{
            nextDay = moment(this.day.date, "DD MMM", 'fr').add(1, 'days');
        }
        
        this.displayDay(nextDay); 
    }

    clickPrev(){
        if(!this.day.date)
            return;
        let prevDay = moment(this.day.date, "DD MMM", 'fr').subtract(1, 'days');
        this.displayDay(prevDay); 
    }

    clickCalendar(){
        this.router.navigate(["/datePicker"]);
    }

    clickItem(index){
        let clicked = this.day.classes[index];
        alert({
            title: "Détails",
            message: ScheduleClass.toString(clicked),
            okButtonText: "OK"
        });
    }

    /**
     * display the given day
     * This just makes sure the assignement to day is done inside
     * a ngZone.run.
     * This shouldn't be necessary but on some events it is (onNavigatedFrom for example)
     * @param scheduleDay 
     */
    display(scheduleDay: ScheduleDay){
        this.ngZone.run(() => {
            this.day = scheduleDay;
        })
    }

    /**
     * work arround for the zone not working on some events
     * @param val 
     */
    setLoading(val: boolean){
        this.ngZone.run(() => {
            this.loading = val;
        })
    }

    /**
     * takes care of everything that goes into displaying the given day:
     * reading cache, setting loading status, updating status text, and updating the cache
     * @param day 
     */
    displayDay(day: moment.Moment){
        this.displayedMoment = day;
        //check if the wanted day is the next/previous day for shortcuts
        let cached = ScheduleCache.getForDay(day);
        if(cached != null){
            this.display(cached);
            this.setLoading(false);            
        }else{
            this.setLoading(true);
        }

        this.updateCacheForDay(day)
        .then(scheduleDay => {
            this.status = "";
            //make sure we are on the same day that we just loaded,
            //because if you spam the next/prev button the loading might be slower
            //than the click 
            if((cached && this.day.date == scheduleDay.date) || !cached)
                this.display(scheduleDay);
            //note: this is not perfect, if 2 days are loading with a slight delay one from another
            //once the first one finishes the Loading status is set to false even though the 
            //app is technically still loading stuff
            //that being said, it doesn't seem to be a huge problem for now
            this.setLoading(false);
        })  
        .catch(err => { 
            this.setLoading(false);
            if(!cached)
                this.status = "Connecte toi à internet et réessaie"
            else
                this.status = err;
        }) 
    }

    /**
     * update the cached value for the given day
     * and take care fo all the login stuff
     * @param day 
     */
    updateCacheForDay(day: moment.Moment): Promise<ScheduleDay>{
        this.status = "Mise a jour du cache...";
        return new Promise((resolve, reject) => { 
            if(!this.userService.hasConnectivity())
                return reject("Pas de connexion internet");

            this.userService.isConnected()
            .then(connected => {
                if(connected){ 
                    this.updateCacheForDayUnsafe(day)
                    .then((scheduleDay) => {
                        resolve(scheduleDay);
                    })
                    .catch(err => {
                        reject(err);
                    })
                }else{
                    if(this.config.loginIsValid){
                        this.userService.connect()
                        .then(() => this.userService.isConnected())
                        .then(connected => {
                            if(!connected){
                                reject("Impossible de se connecter");
                            }else{
                                this.updateCacheForDayUnsafe(day)
                                .then((scheduleDay) => {
                                    resolve(scheduleDay);
                                })
                                .catch(err => {
                                    reject(err);
                                })
                            }
                        })
                    }else{
                        reject("Redirection to login page");
                        this.routerExtensions.navigate(["/login"], { clearHistory: true })
                    }
                }
            })
        });
    }

    /**
     * update cache for the given day without taking care of the login stuff
     * @param day 
     */
    private updateCacheForDayUnsafe(day: moment.Moment): Promise<any>{
        //this assumes your are connected 
        return new Promise((resolve, reject) => {

            this.userService.goToDayMom(day)
            .then(() => {
                return this.userService.getDaySchedule();
            }) 
            .then(scheduleDay => {
                ScheduleCache.store(scheduleDay);
                resolve(scheduleDay);
            })
            .catch(err => {
                reject(err);
            })
        });
    }

    private displayCurrentDay(){
        let mom = moment();
        this.displayDay(mom);
    }

    /**
     * update the date when you come back from the datePicker view
     * @param event 
     */
    onNavigatedTo(event){
        if(event.isBackNavigation && this.dataPasser.day != -1){            
            let mom = moment(this.dataPasser.year + "-" + this.dataPasser.month + "-" + this.dataPasser.day);
            this.displayDay(mom);
            this.dataPasser.day = -1;
        }
    }

    ngOnInit() {
        this.page.actionBarHidden = true;
        this.page.on("navigatedTo", ev => this.onNavigatedTo(ev));
    }
}