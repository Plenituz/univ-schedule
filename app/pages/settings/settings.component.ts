import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
import { Page } from "ui/page";
import { Config } from "../../shared/config";
import { ScheduleCache } from "../../shared/scheduleCache";
import { DataPasser } from "../../shared/dataPasser";
import * as moment from 'moment';

@Component({
    selector: "settings",
    providers: [],
    templateUrl: "./pages/settings/settings.html",
    styleUrls: ["pages/settings/settings-common.css", "pages/settings/settings.css"]
})
export class SettingsComponent implements OnInit{

    constructor(private router: Router, private page: Page, 
         private routerExtensions: RouterExtensions, private dataPasser: DataPasser){

    }

    disconnect(){
        let user = Config.user;
        user.login = "";
        user.password = "";
        Config.user = user;
        Config.jsessionid = "";
        Config.loginIsValid = false;
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