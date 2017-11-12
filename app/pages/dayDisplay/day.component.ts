import { Component, OnInit, NgZone } from "@angular/core";
import { Config } from "../../shared/config";
import { UserService } from "../../shared/user/user.service";
import { Page } from "ui/page";
import { ScheduleDay } from "../../shared/schedule/scheduleDay";
import { ScheduleCache } from "../../shared/scheduleCache";
import { Router } from "@angular/router";

@Component({
    selector: "day",
    providers: [UserService],
    templateUrl: "./pages/dayDisplay/day.html",
    styleUrls: ["pages/dayDisplay/day-common.css", "pages/dayDisplay/day.css"]
})
export class DayComponent implements OnInit{
    day: ScheduleDay = new ScheduleDay();

    constructor(private userService: UserService, private page: Page, 
        private router: Router, private ngZone: NgZone){
        
        this.updateDay();  
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
        this.userService.goToNextDay()
        .then(() => this.updateSchedule());
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

    updateDay(){
        this.userService.isConnected()
        .then(connected => {
            if(connected){ 
                this.updateSchedule();
            }else{
                if(Config.loginIsValid)
                    return this.userService.connect()
                    .then(() => this.userService.isConnected())
                    .then(connected => {
                        if(!connected)
                            alert("impossible de se connecter");
                        else
                            this.updateSchedule();
                    })
                else
                    this.router.navigate(["/login"]);
            }
        })
        .catch(err => {
            alert("erreur" + err);
        });
    }

    onNavigatedTo(event){
        if(event.isBackNavigation)
            this.updateDay();
    }

    ngOnInit() {
        this.page.actionBarHidden = true;
        this.page.on("navigatedTo", ev => this.onNavigatedTo(ev));
    }
}