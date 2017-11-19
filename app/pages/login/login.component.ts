import { Component } from "@angular/core";
import { User } from "../../shared/user/user";
import { UserService } from "../../shared/user/user.service";
import { ConfigService } from "../../shared/config.service";
import { Router } from "@angular/router";

/**
 * login page
 */
@Component({
    selector: "login",
    providers: [UserService],
    templateUrl: /*"./pages/login/" +*/ "login.html",
    styleUrls: [/*"./pages/login/" +*/ "login-common.css", /*"/pages/login/" +*/ "login.css"]
})
export class LoginComponent{
    user: User;
    loading: boolean = false;

    constructor(private userService: UserService,
        private router: Router, private config: ConfigService){
        this.user = config.user;
    }

    submit(){
        this.config.user = this.user;
        this.loading = true;
        this.userService.connect()
        .then(() => {
            this.loading = false;
            this.config.loginIsValid = true;
            this.router.navigate(["/day"]);
        })
        .catch(err => {
            this.loading = false; 
            alert("Erreur lors de la connexion");
        });
    }
}