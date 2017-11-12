import { Component } from "@angular/core";
import { User } from "../../shared/user/user";
import { UserService } from "../../shared/user/user.service";
import { Config } from "../../shared/config";
import { Router } from "@angular/router";

@Component({
    selector: "login",
    providers: [UserService],
    templateUrl: "./pages/login/login.html",
    styleUrls: ["pages/login/login-common.css", "pages/login/login.css"]
})
export class LoginComponent{
    user: User;

    constructor(private userService: UserService, private router: Router){
        this.user = Config.user;
    }

    submit(){
        Config.user = this.user;
        this.userService.connect()
        .then(() => {
            Config.loginIsValid = true;
            this.router.navigate(["/day"]);
        })
        .catch(err => {
            alert("Erreur lors de la connexion");
        });
    }
}