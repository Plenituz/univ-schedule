import { Injectable } from '@angular/core';
import{ User } from "./user/user";
var applicationSettings = require("application-settings");

/**
 * This service is used to access application settings in an easy way
 * 
 * Getting and setting values of this class will automatically sync the data
 * with the application settings
 */
@Injectable()
export class ConfigService {
    /** User object containing login and password that the user registered */
    private _user: User;
    /** latest JSESSIONID cookie the server provided, might be out of date, might not */
    private _jsessionid: string;
    /** 
     * if this is true the user logged in successfully at least once 
     * so we know his password/login is valid and not to show him the login screen 
     */
    private _loginIsValid: boolean;

    /** User object containing login and password that the user registered */    
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

    /** latest JSESSIONID cookie the server provided, might be out of date, might not */    
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

    /** 
     * if this is true the user logged in successfully at least once 
     * so we know his password/login is valid and not to show him the login screen 
     */
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