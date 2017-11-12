import { Component, OnInit } from "@angular/core";
import { Config } from "../../shared/config";
import { UserService } from "../../shared/user/user.service";
import { Page } from "ui/page";
import { ScheduleDay } from "../../shared/schedule/scheduleDay";
import { Router } from "@angular/router";

@Component({
    selector: "day",
    providers: [UserService],
    templateUrl: "./pages/dayDisplay/day.html",
    styleUrls: ["pages/dayDisplay/day-common.css", "pages/dayDisplay/day.css"]
})
export class DayComponent implements OnInit{
    day: ScheduleDay = new ScheduleDay();

    constructor(private userService: UserService, private page: Page, private router: Router){
        Config.jsessionid = "8503FE6939B86668E801EC21B94D1334";
        this.userService.isConnected()
        .then(connected => {
            if(connected){ 
                this.updateSchedule();
            }else{
                if(Config.loginIsValid)
                    return userService.connect()
                    .then(() => userService.isConnected())
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

    private updateSchedule(){
        this.userService.getDaySchedule()
        .then(d => {
            this.day = d;
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
        console.log("click calendar"); 
    }

    clickItem(index){
        let clicked = this.day.classes[index];
        alert({
            title: "Détails",
            message: clicked.toString(),
            okButtonText: "OK"
        });
        
    }

    ngOnInit() {
        this.page.actionBarHidden = true;
        // this.userService.goToDay(14, 11, 2017)
        // .then(response => {
        //     console.log(response.content);
        // })
        // .catch(err => {
        //     console.log(err);
        // }) 
    }
}