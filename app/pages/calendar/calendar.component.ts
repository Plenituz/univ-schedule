import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { Router } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
import { UserService } from "../../shared/user/user.service";
import { Page } from "ui/page";
import { View } from "ui/core/view";
import { DatePicker } from "ui/date-picker";
import { DataPasser } from "../../shared/dataPasser.service";

@Component({
    selector: "calendar",
    providers: [UserService],
    templateUrl: /*"./pages/calendar/" +*/ "calendar.html",
    styleUrls: [/*"./pages/calendar/" +*/ "calendar-common.css", /*"./pages/calendar/" +*/ "calendar.css"]
})
export class CalendarComponent implements OnInit{
    @ViewChild("picker") picker: ElementRef;

    constructor(private userService: UserService,
         private router: Router, private page: Page, 
         private routerExtensions: RouterExtensions, private dataPasser: DataPasser){

    }

    submit(){
        let picker = <DatePicker>this.picker.nativeElement

        this.dataPasser.day = picker.day;
        this.dataPasser.month = picker.month;
        this.dataPasser.year = picker.year;

        this.routerExtensions.backToPreviousPage();
    }
 
    ngOnInit(): void {  
        this.page.actionBarHidden = true;    
    }
}
    