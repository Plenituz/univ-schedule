import { User } from "./user";
import { UserService } from "./user.service";

/**
 * this class can be stringified into a valid form data 
 * for logging into cas
 */
export class LoginInfo{
    username: string;
    password: string;
    /** on the login page there is a form with a lt name, we have to give it back to the server */
    lt: string;
    execution: string;
    _eventId: string = 'submit';
    submit: string = 'Connexion';
    ipAddress: string;
    //dummy user agent to satisfy the form, took mine
    userAgent: string = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:56.0) Gecko/20100101 Firefox/56.0';

    constructor (user: User, html: string){
        this.username = user.login;
        this.password = user.password;
        this.lt = LoginInfo.extractInputValue("lt", html);
        this.execution = LoginInfo.extractInputValue("execution", html);
        this.ipAddress = LoginInfo.extractInputValue("ipAddress", html);
    }

    /**
     * extract the input value with the given name of the html page
     * @param name 
     * @param html 
     */
    static extractInputValue(name: string, html: string): string{
        name = UserService.escapeRegExp(name);
        let regex = new RegExp("name=\"" + name + "\" value=\"(.*)\"");
        let result = regex.exec(html);
        if(result)
            return result[1];
        return "";
    }
}  