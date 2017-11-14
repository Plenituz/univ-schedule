import { Component, OnInit, NgZone } from "@angular/core";
import { Config } from "../../shared/config";
import { UserService } from "../../shared/user/user.service";
import { Page } from "ui/page";
import { RouterExtensions } from "nativescript-angular/router";
import { ScheduleDay } from "../../shared/schedule/scheduleDay";
import { ScheduleCache } from "../../shared/scheduleCache";
import { Router } from "@angular/router";
import * as moment from 'moment';
import { looseIdentical } from "@angular/core/src/util";
import { DataPasser } from "../../shared/dataPasser"; 

@Component({
    selector: "day",
    providers: [UserService],
    templateUrl: "./pages/dayDisplay/day.html",
    styleUrls: ["pages/dayDisplay/day-common.css", "pages/dayDisplay/day.css"]
})
export class DayComponent implements OnInit{
    day: ScheduleDay = new ScheduleDay();
    loading: boolean = false;
    status: string = ""; 

    constructor(private userService: UserService, private page: Page, 
        private router: Router, private ngZone: NgZone, 
        private routerExtensions: RouterExtensions,
        private dataPasser: DataPasser)
    {
        ScheduleCache.init();
        this.displayCurrentDay();
    }

    private updateSchedule(){  
        
        this.userService.getDaySchedule()
        .then(d => {
            //force the ui to refresh
            this.ngZone.run(() => {
                this.day = d;
                ScheduleCache.store(this.day);
            })
        })
    }

    clickOptions(){
        this.router.navigate(["/settings"]);
    }

    clickNext(){
        if(!this.day.date)
            return;
        let nextDay = moment(this.day.date, "DD MMM", 'fr').add(1, 'days');        
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
            message: clicked.toString(),
            okButtonText: "OK"
        });
    }

    display(scheduleDay: ScheduleDay){
        this.ngZone.run(() => {
            this.day = scheduleDay;
        })
    }

    setLoading(val: boolean){
        this.ngZone.run(() => {
            this.loading = val;
        })
    }

    displayDay(day: moment.Moment){
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
            if((cached && this.day.date == scheduleDay.date) || !cached)
                this.display(scheduleDay);
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

    updateCacheForDay(day: moment.Moment): Promise<any>{
        this.status = "Mise a jour du cache...";
        return new Promise((resolve, reject) => { 
            if(!this.userService.hasConnectivity())
                return reject("Pas de connection internet");

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
                    if(Config.loginIsValid){
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

    onNavigatedTo(event){
        if(event.isBackNavigation && this.dataPasser.day != -1){            
            let mom = moment(this.dataPasser.year +"-" + this.dataPasser.month + "-" + this.dataPasser.day);
            this.displayDay(mom);
            this.dataPasser.day = -1;
        }
    }

    ngOnInit() {
        this.page.actionBarHidden = true;
        this.page.on("navigatedTo", ev => this.onNavigatedTo(ev));
    }
}