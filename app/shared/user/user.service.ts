import { Injectable } from "@angular/core";
//import { Http, Headers, Response } from "@angular/http";
const http = require("http");
const querystring = require('querystring');
import { Observable } from "rxjs/Rx";
import "rxjs/add/operator/do";
import "rxjs/add/operator/map";

import { User } from "./user";
import { Config } from "../config";
import { LoginInfo } from "./loginInfo";
import { ScheduleDay } from "../schedule/scheduleDay";

@Injectable()
export class UserService {
    private static urlLoginPage = "https://cas.univ-valenciennes.fr/cas/login?service=https://vtmob.univ-valenciennes.fr/esup-vtclient-up4/stylesheets/mobile/welcome.xhtml";
    /** the url to get the schedule but without the value of jsessionid at the end */
    private static incompleteUrlSchedule = "https://vtmob.univ-valenciennes.fr/esup-vtclient-up4/stylesheets/mobile/welcome.xhtml;jsessionid=";
    private static urlCalendar = "https://vtmob.univ-valenciennes.fr/esup-vtclient-up4/stylesheets/mobile/calendar.xhtml";
    private static urlScheduleNoJsessionid = "https://vtmob.univ-valenciennes.fr/esup-vtclient-up4/stylesheets/mobile/welcome.xhtml"
    constructor() {}

    getDaySchedule(): Promise<any>{
        return this.getScheduleHTML()
        .then(response => {
            let day = new ScheduleDay();
            let cleaned = this.cleanHTML(response.content.toString());

            return day.buildFromHTML(cleaned);
        });
    }

    isConnected(): Promise<any>{
        return this.getScheduleHTML()
        .then(response => {
            let title = new RegExp("<title>([^]*)</title>").exec(response.content.toString());
            return new Promise((resolve, reject) => {
                resolve(title && !title[1].includes("Service d'authentification"));
            })
        });
    }

    connect(){
        return this.getLoginPage()
        .then(response => {
            // console.log(response.content);
            let jsessionid = Config.jsessionid; //= this.extractCookieValue([response.headers["Set-Cookie"]], "JSESSIONID");
            let loginInfo = new LoginInfo(Config.user, response.content);
            //  console.log("got cookie", jsessionid, " and built info from page:");
            //  console.dir(loginInfo);
            return this.loginOnCas(jsessionid, loginInfo);
        })
        .then(response => {
            //  console.log("ticket should be here", response.headers.Location);
            return this.loginOnVtmob(response.headers.Location);
        })
        .then(response => {
            let vtmobJsessionid = this.extractCookieValue([response.headers["Set-Cookie"]], "JSESSIONID");
            //  console.log("cookie should be here:", vtmobJsessionid);
            Config.jsessionid = vtmobJsessionid;
        });
    }

    private getLoginPage(){
        let options = {
            url: UserService.urlLoginPage,
            method: "GET"
        };
        return http.request(options);
    }

    prepareGoToDay(){
        return this.getScheduleHTML()
        .then(response => {
            let cookie = "JSESSIONID=" + Config.jsessionid;
            let viewState = LoginInfo.extractInputValue("javax.faces.ViewState", response.content);
            viewState = viewState.substring(0, 2);
    
            let data = {
                'org.apache.myfaces.trinidad.faces.FORM': 'redirectForm',
                '_noJavaScript': false,
                'javax.faces.ViewState': viewState,
                'source': 'redirectForm:goCal'
            }
            data = querystring.stringify(data);
            let options = {
                url: UserService.urlScheduleNoJsessionid,
                method: "POST",
                dontFollowRedirects: true,
                headers: {
                    'Cookie': cookie,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                content: data
            }
            return http.request(options);
        });
    }

    getCalendar(): Promise<any>{
        let cookie = "JSESSIONID=" + Config.jsessionid;
        let options = {
            url: UserService.urlCalendar,
            method: "GET",
            headers:{
                'Cookie': cookie              
            }
        };
        return http.request(options);
    }

    goToDay(day: number, month: number, year: number): Promise<any>{
        //you need the get the calendar so you can get the viewState from it
        return this.getCalendar()
        .then(response => {
            let dayStr = day.toString().length == 1 ? "0" + day : day.toString();
            let monthStr = month.toString().length == 1 ? "0" + month : month.toString();
            let yearStr = year.toString();
            let viewState = LoginInfo.extractInputValue("javax.faces.ViewState", response.content);
            viewState = viewState.substring(0, 2);
    
            let data = {
                'formCal:date': dayStr + "/" + monthStr + "/" + yearStr,
                'org.apache.myfaces.trinidad.faces.FORM': 'formCal',
                '_noJavaScript': false,
                'javax.faces.ViewState': viewState,
                'source': 'formCal:hiddenLink'
            }
            data = querystring.stringify(data);
            let cookie = "JSESSIONID=" + Config.jsessionid;
            
            let options = {
                url: UserService.urlCalendar,
                method: "POST",
                dontFollowRedirects: true,
                headers: {
                    'Cookie': cookie,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                content: data
            }
            return http.request(options);
        });
    }

    goToNextDay(){
        let data = {
            'org.apache.myfaces.trinidad.faces.FORM': 'redirectForm',
            '_noJavaScript': false,
            'javax.faces.ViewState': '!1',
            'source': 'redirectForm:semSuiv'
        }
        data = querystring.stringify(data);
        let cookie = "JSESSIONID=" + Config.jsessionid;
        let options = {
            url: UserService.urlScheduleNoJsessionid,
            method: "POST",
            dontFollowRedirects: true,
            headers: {
                'Cookie': cookie,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            content: data
        }
        return http.request(options);
    }

    goToPrevDay(){
        let data = {
            'org.apache.myfaces.trinidad.faces.FORM': 'redirectForm',
            '_noJavaScript': false,
            'javax.faces.ViewState': '!1',
            'source': 'redirectForm:semPrec'
        }
        data = querystring.stringify(data);
        let cookie = "JSESSIONID=" + Config.jsessionid;
        let options = { 
            url: UserService.urlScheduleNoJsessionid,
            method: "POST",
            dontFollowRedirects: true,
            headers: {
                'Cookie': cookie,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            content: data
        }
        return http.request(options);
    }

    /**
     * 
     * @param jsessionid a dummy jsessionid got from a GET on the login page
     * @param loginInfo a 
     */
    private loginOnCas(jsessionid: string, loginInfo: LoginInfo): Promise<any>{
        let data = querystring.stringify(loginInfo);
        let cookie = "JSESSIONID=" + jsessionid;
        let options = {
            url: UserService.urlLoginPage,
            method: "POST",
            dontFollowRedirects: true,
            headers: {
                'Origin': "https://cas.univ-valenciennes.fr",
                'Content-Type': 'application/x-www-form-urlencoded',
                'Referer': "https://cas.univ-valenciennes.fr/cas/login;jsessionid=" + jsessionid + "?service=https://vtmob.univ-valenciennes.fr/esup-vtclient-up4/stylesheets/mobile/welcome.xhtml",
                'Cookie': cookie,
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': 1
            },
            content: data
        }
        return http.request(options);
    }

    /**
     * login on vtbmob, you need to provide and url with a ticket given 
     * by a login on cas
     * @param url url containing the ticket to get the cookie on vtmob
     */
    private loginOnVtmob(url: string): Promise<any>{
        let options = {
            url: url,
            method: "GET",
            dontFollowRedirects: true
        };
        return http.request(options);
    }

    private getScheduleHTML(){
        let cookie = "JSESSIONID=" + Config.jsessionid;
        let options = {
            url: UserService.incompleteUrlSchedule + Config.jsessionid,
            method: "GET",
            headers:{
                'Cookie': cookie              
            }
        };
        return http.request(options);
    }

    private extractCookie(cookies, name){
        for(let i = 0; i < cookies.length; i++){
            if(cookies[i].includes(name)){
                let split = cookies[i].split(";");
                for(let k = 0; k < split.length; k++){
                    if(split[i].includes(name))
                        return split[i];
                }
            }
        }
        return null;
    }
    
    private extractCookieValue(cookies, name){
        let c = this.extractCookie(cookies, name);
        return c.split('=')[1];
    }

    private cleanHTML(html){
        return html.replace(new RegExp(UserService.escapeRegExp("&#9;"), 'g'), "");
    }

    static escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
    }
}