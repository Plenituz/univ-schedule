import { User } from "./user";
import { UserService } from "./user.service";

export class LoginInfo{
    username: string;
    password: string;
    lt: string;
    execution: string;
    _eventId: string = 'submit';
    submit: string = 'Connexion';
    ipAddress: string;
    //dummy user agent to satisfy the form
    userAgent: string = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:56.0) Gecko/20100101 Firefox/56.0';

    constructor (user: User, html: string){
        this.username = user.login;
        this.password = user.password;
        this.lt = LoginInfo.extractInputValue("lt", html);
        this.execution = LoginInfo.extractInputValue("execution", html);
        this.ipAddress = LoginInfo.extractInputValue("ipAddress", html);
    }

    static extractInputValue(name, html){
        name = UserService.escapeRegExp(name);
        let regex = new RegExp("name=\"" + name + "\" value=\"(.*)\"");
        let result = regex.exec(html);
        if(result)
            return result[1];
        return "";
    }
}  