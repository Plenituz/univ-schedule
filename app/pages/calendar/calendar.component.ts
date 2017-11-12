import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { Router } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
import { UserService } from "../../shared/user/user.service";
import { Page } from "ui/page";
import { View } from "ui/core/view";
import { DatePicker } from "ui/date-picker";

@Component({
    selector: "calendar",
    providers: [UserService],
    templateUrl: "./pages/calendar/calendar.html",
    styleUrls: ["pages/calendar/calendar-common.css", "pages/calendar/calendar.css"]
})
export class CalendarComponent implements OnInit{
    @ViewChild("picker") picker: ElementRef;

    constructor(private userService: UserService,
         private router: Router, private page: Page, private routerExtensions: RouterExtensions){

    }

    submit(){
        let picker = <DatePicker>this.picker.nativeElement

        this.userService.prepareGoToDay()
        .then(response => {
            return this.userService.goToDay(picker.day, picker.month, picker.year);
        })
        .then(response => {
            this.routerExtensions.backToPreviousPage();
        })
        .catch(err => {
            alert("error changing day:" + err);
        })
    }
 
    ngOnInit(): void {  
        this.page.actionBarHidden = true;    
    }
}
    