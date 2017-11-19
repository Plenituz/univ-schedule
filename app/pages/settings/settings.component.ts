import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
import { Page } from "ui/page";
import { ConfigService } from "../../shared/config.service";
import { ScheduleCache } from "../../shared/scheduleCache";
import { DataPasser } from "../../shared/dataPasser.service"; 
import * as moment from 'moment';
import * as Toast from 'nativescript-toast';
import { UserService } from "../../shared/user/user.service";
import { loadAppCss } from "tns-core-modules/application/application";

/**
 * settings page 
 */ 
@Component({
    selector: "settings",
    providers: [UserService],
    templateUrl: /*"./pages/settings/" +*/ "settings.html",
    styleUrls: [/*"./pages/settings/" +*/ "settings-common.css", /*"/pages/settings/" +*/ "settings.css"]
})
export class SettingsComponent implements OnInit{
    loading: boolean = false;

    constructor(private router: Router, private page: Page, 
        private routerExtensions: RouterExtensions, 
        private dataPasser: DataPasser, 
        private config: ConfigService,
        private userService: UserService) {}

    disconnect(){
        this.loading = true;
        this.userService.disconnect()
        .then(response => {
            this.loading = false;
            Toast.makeText("Tu vas peut être devoir redemarrer l'appli pour te reconnecter", "long").show();
            let user = this.config.user;
            user.login = "";
            user.password = "";
            this.config.user = user;
            this.config.jsessionid = "";
            this.config.loginIsValid = false;
            this.routerExtensions.navigate(["/login"], { clearHistory: true });
        })
        .catch(err => {
            this.loading = false;
        })
    }

    emptyCache(){
        ScheduleCache.clear();
        
        let now = moment();
        
        this.dataPasser.day = now.date();
        this.dataPasser.month = now.month() + 1;
        this.dataPasser.year = now.year();

        this.routerExtensions.backToPreviousPage();
    }
 
    ngOnInit(): void {  
        this.page.actionBarHidden = true;    
    }
}