import { Injectable } from '@angular/core';
import{ User } from "./user/user";
var applicationSettings = require("application-settings");

@Injectable()
export class ConfigService {
    private _user: User;
    private _jsessionid: string;
    private _loginIsValid: boolean;

    get user(): User{
        if(!this._user){
            let login = applicationSettings.getString("login", "");
            let password = applicationSettings.getString("password", "");

            this._user = new User();
            this._user.login = login;
            this._user.password = password;
        }
        return this._user;
    }

    set user(user: User){
        this._user = user;
        applicationSettings.setString("login", user.login);
        applicationSettings.setString("password", user.password);
    }

    get jsessionid(): string{
        if(!this._jsessionid){
            this._jsessionid = applicationSettings.getString("jsessionid", "");
        }
        return this._jsessionid;
    }

    set jsessionid(value: string){
        this._jsessionid = value;
        applicationSettings.setString("jsessionid", this._jsessionid);
    }

    get loginIsValid(): boolean{
        if(!this._loginIsValid){
            this._loginIsValid = applicationSettings.getBoolean("loginIsValid", false);
        }
        return this._loginIsValid;
    }

    set loginIsValid(value: boolean){
        this._loginIsValid = value;
        applicationSettings.setBoolean("loginIsValid", this._loginIsValid);
    }

    public constructor() { }
}