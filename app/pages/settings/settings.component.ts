import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
import { Page } from "ui/page";
import { ConfigService } from "../../shared/config.service";
import { ScheduleCache } from "../../shared/scheduleCache";
import { DataPasser } from "../../shared/dataPasser.service"; 
import * as moment from 'moment';

@Component({
    selector: "settings",
    providers: [],
    templateUrl: /*"./pages/settings/" +*/ "settings.html",
    styleUrls: [/*"./pages/settings/" +*/ "settings-common.css", /*"./pages/settings/" +*/ "settings.css"]
})
export class SettingsComponent implements OnInit{

    constructor(private router: Router, private page: Page, 
         private routerExtensions: RouterExtensions, 
         private dataPasser: DataPasser, 
         private config: ConfigService){

    }

    disconnect(){
        let user = this.config.user;
        user.login = "";
        user.password = "";
        this.config.user = user;
        this.config.jsessionid = "";
        this.config.loginIsValid = false;
        this.routerExtensions.navigate(["/login"], { clearHistory: true });
    }

    emptyCache(){
        ScheduleCache.clear();
        
        let now = moment();
        this.dataPasser.day = now.day();
        this.dataPasser.month = now.month();
        this.dataPasser.year = now.year();

        this.routerExtensions.backToPreviousPage();
    }
 
    ngOnInit(): void {  
        this.page.actionBarHidden = true;    
    }
}