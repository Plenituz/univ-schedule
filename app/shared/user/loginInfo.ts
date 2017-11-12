import { User } from "./user";

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
        this.lt = this.extractInputValue("lt", html);
        this.execution = this.extractInputValue("execution", html);
        this.ipAddress = this.extractInputValue("ipAddress", html);
    }

    private extractInputValue(name, html){
        let regex = new RegExp("name=\"" + name + "\" value=\"(.*)\"");
        let result = regex.exec(html);
        return result[1];
    }
}