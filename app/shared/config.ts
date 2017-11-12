import{ User } from "./user/user";
var applicationSettings = require("application-settings");

export class Config {
    private static _user: User;
    private static _jsessionid: string;
    private static _loginIsValid: boolean;

    static get user(): User{
        if(!this._user){
            let login = applicationSettings.getString("login", "");
            let password = applicationSettings.getString("password", "");

            this._user = new User();
            this._user.login = login;
            this._user.password = password;
        }
        return this._user;
    }

    static set user(user: User){
        this._user = user;
        applicationSettings.setString("login", user.login);
        applicationSettings.setString("password", user.password);
    }

    static get jsessionid(): string{
        if(!this._jsessionid){
            this._jsessionid = applicationSettings.getString("jsessionid", "");
        }
        return this._jsessionid;
    }

    static set jsessionid(value: string){
        this._jsessionid = value;
        applicationSettings.setString("jsessionid", this._jsessionid);
    }

    static get loginIsValid(): boolean{
        if(!this._loginIsValid){
            this._loginIsValid = applicationSettings.getBoolean("loginIsValid", false);
        }
        return this._loginIsValid;
    }

    static set loginIsValid(value: boolean){
        this._loginIsValid = value;
        applicationSettings.setBoolean("loginIsValid", this._loginIsValid);
    }
  }