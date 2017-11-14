import { Component, OnInit, NgZone } from "@angular/core";
import { Config } from "../../shared/config";
import { UserService } from "../../shared/user/user.service";
import { Page } from "ui/page";
import { RouterExtensions } from "nativescript-angular/router";
import { ScheduleDay } from "../../shared/schedule/scheduleDay";
import { ScheduleCache } from "../../shared/scheduleCache";
import { Router, ActivatedRoute } from "@angular/router";
import * as moment from 'moment';

@Component({
    selector: "day",
    providers: [UserService],
    templateUrl: "./pages/dayDisplay/day.html",
    styleUrls: ["pages/dayDisplay/day-common.css", "pages/dayDisplay/day.css"]
})
export class DayComponent implements OnInit{
    day: ScheduleDay = new ScheduleDay();
    status: string = "";

    constructor(private userService: UserService, private page: Page, 
        private router: Router, private ngZone: NgZone, 
        private routerExtensions: RouterExtensions, private activatedRoute: ActivatedRoute)
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

    clickNext(){
        
        //this.userService.goToNextDay()
        //.then(() => this.updateSchedule());
    }

    clickPrev(){
        this.userService.goToPrevDay()
        .then(() => this.updateSchedule());
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

    displayDay(day: moment.Moment){
        //check if the wanted day is the next/previous day for shortcuts
        let cached = ScheduleCache.getForDay(day);
        if(cached != null){
            this.display(cached);
            this.updateCacheForDay(day)
            .then(scheduleDay => {
                this.display(scheduleDay);
            })
            .catch(err => {
                alert("error updating cache:" + err);
            })
        }else{
            this.updateCacheForDay(day)
            .then(scheduleDay => {
                this.display(scheduleDay);
            })
            .catch(err => {
                alert("error updating cache:" + err);
            })
        }
    }

    updateCacheForDay(day: moment.Moment): Promise<any>{
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
                                alert("Impossible de se connecter");
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
                        reject();
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
        if(event.isBackNavigation){
            //let navData = this.page.navigationContext;
            //this.displayCurrentDay();
        }
    }

    ngOnInit() {
        this.page.actionBarHidden = true;
        this.page.on("navigatedTo", ev => this.onNavigatedTo(ev));
    }
}