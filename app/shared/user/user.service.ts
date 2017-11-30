import { Injectable } from "@angular/core";
const http = require("http");
import { HttpResponse } from "http";
const querystring = require('querystring');
import * as connectivity from "tns-core-modules/connectivity";
import * as moment from 'moment';
import * as app from "tns-core-modules/application";

import { User } from "./user";
import { ConfigService } from "../config.service";
import { LoginInfo } from "./loginInfo";
import { ScheduleDay } from "../schedule/scheduleDay";

/**
 * This service is responsible for everything that has to do with the internet:
 * login, retreiving data
 * See the main README.md for an overview of the login process
 * 
 * Note: their is a bit of copy pasting in the different functions that do http requests
 * while I might refactor a bit in the futur, I find it clearer to have the full data 
 * for each request directly in each function
 */
@Injectable()
export class UserService {
    private static urlLoginPage = encodeURI("https://cas.univ-valenciennes.fr/cas/login?service=https://vtmob.univ-valenciennes.fr/esup-vtclient-up4/stylesheets/mobile/welcome.xhtml");
    /** 
     * the url to get the schedule but without the value of jsessionid at the end 
     * Note: this is not strictly necessary (adding ;jsessionid=... at the end that is)
     * but to be sure the server is happy we still use it
     * 
     * It's not necessary because we also send a cookie with the same value
     * 
     * we don't encoreURI this because we still need to add the JSSESSIONID so we will encode in the actual function sending the request
     */
    private static incompleteUrlSchedule = "https://vtmob.univ-valenciennes.fr/esup-vtclient-up4/stylesheets/mobile/welcome.xhtml;jsessionid=";
    /** url to get the calendat view */
    private static urlCalendar = encodeURI("https://vtmob.univ-valenciennes.fr/esup-vtclient-up4/stylesheets/mobile/calendar.xhtml");
    /** same as incompleteUrlSchedule but you don't need to add the jsessionid at the end */
    private static urlScheduleNoJsessionid = encodeURI("https://vtmob.univ-valenciennes.fr/esup-vtclient-up4/stylesheets/mobile/welcome.xhtml");
    private static urlLogout = encodeURI("https://cas.univ-valenciennes.fr/cas/logout?url=https://portail.univ-valenciennes.fr/Login");


    constructor(private config: ConfigService) {}

    /**
     * fetch the schedule from the server and parse it into a ScheduleDay object
     */
    getDaySchedule(): Promise<ScheduleDay>{
        return this.getScheduleHTML()
        .then(response => {
            let day = new ScheduleDay(this.config);
            let cleaned = this.cleanHTML(response.content.toString());

            return day.buildFromHTML(cleaned);
        });
    }

    /**
     * check if the jessionid is still valid by fetching a page
     */
    isConnected(): Promise<boolean>{
        return this.getScheduleHTML()
        .then(response => {
            let title = new RegExp("<title>([^]*)</title>").exec(response.content.toString());
            return new Promise<boolean>((resolve, reject) => {
                resolve(title && !title[1].includes("Service d'authentification"));
            })
        });
    }

    /**
     * go through the entire login process for cas and vtmob and store 
     * the vtmob jsessionid
     */
    connect(): Promise<void>{
        return this.getLoginPage() 
        .then(response => {  
            let jsessionid = this.config.jsessionid; 
            let loginInfo = new LoginInfo(this.config.user, response.content.toString());
            return this.loginOnCas(jsessionid, loginInfo);
        })
        .then(response => {
            return this.loginOnVtmob(response.headers.Location.toString());
        })
        .then(response => { 
            let vtmobJsessionid = this.extractCookieValue([response.headers["Set-Cookie"]], "JSESSIONID");
            this.config.jsessionid = vtmobJsessionid;
        });
    }

    disconnect(): Promise<HttpResponse>{
        let cookie = "JSESSIONID=" + this.config.jsessionid;
        let options = {
            url: UserService.urlLogout,
            method: "GET",
            dontFollowRedirects: true,
            headers: {
                'Cookie': cookie,
            }
        }
        return http.request(options);
    }

    /**
     * fetch the login page and return the http response
     */
    private getLoginPage(): Promise<HttpResponse>{
        let options = {
            url: UserService.urlLoginPage,
            method: "GET",
            dontFollowRedirects: true
        };
        return http.request(options);
    }

    /**
     * since the calendar is a view stored on the server we can't 
     * just send the http get for the day we want. 
     * We have to initialize the view so the server has it in memory
     * This method is in charge of that, initialize the view and return the
     * response of the server. 
     * The response doesn't have any interesting info 
     */
    private prepareGoToDay(): Promise<HttpResponse>{
        return this.getScheduleHTML()
        .then(response => {
            let cookie = "JSESSIONID=" + this.config.jsessionid;
            //the extractInputValue doesn't work well for the viewstate because of 
            //inconsistency in the html (input tags not closed and other)
            //so it returns the viewstate plus a bunch of html behind it
            //however we know the viewstate is 2 caracter long so we can still get it
            let viewState = LoginInfo.extractInputValue("javax.faces.ViewState", response.content.toString());
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

    /**
     * this get the calendar view so we can extract it's viewstate
     */
    getCalendar(): Promise<HttpResponse>{
        let cookie = "JSESSIONID=" + this.config.jsessionid;
        let options = {
            url: UserService.urlCalendar,
            method: "GET",
            headers:{
                'Cookie': cookie              
            }
        };
        return http.request(options);
    }

    /**
     * this does NOT go automatically to mother's day,
     * it goes to the date given as a Moment :)
     * @param mom your mom
     */
    goToDayMom(mom: moment.Moment): Promise<HttpResponse>{
        let str = mom.format("DD/MM/YYYY");
        return this.goToDay(str);
    }

    /**
     * go to the date given in numbers
     * @param day 
     * @param month 
     * @param year 
     */
    goToDayNum(day: number, month: number, year: number): Promise<HttpResponse>{
        let dayStr = day.toString().length == 1 ? "0" + day : day.toString();
        let monthStr = month.toString().length == 1 ? "0" + month : month.toString();
        let yearStr = year.toString();
        return this.goToDay(dayStr + "/" + monthStr + "/" + yearStr);
    }

    /**
     * go to the date provided in str, the dat emust be of format DD/MM/YYYY
     * Note: the HttpResponse object won't have useful information,
     * you have to refetch the schedule to get the actual schedula data
     * @param str 
     */
    goToDay(str: String): Promise<HttpResponse>{
        //you need the get the calendar so you can get the viewState from it
        return this.prepareGoToDay()
        .then(() => {
            return this.getCalendar();
        })
        .then(response => {
            let viewState = LoginInfo.extractInputValue("javax.faces.ViewState", response.content.toString());
            viewState = viewState.substring(0, 2);
    
            let data = {
                'formCal:date': str,
                'org.apache.myfaces.trinidad.faces.FORM': 'formCal',
                '_noJavaScript': false,
                'javax.faces.ViewState': viewState,
                'source': 'formCal:hiddenLink'
            }
            data = querystring.stringify(data);
            let cookie = "JSESSIONID=" + this.config.jsessionid;
            
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

    /**
     * go to the next day for the server.
     * This is not used anymore because it could cause sync problems between
     * the date the server think we are at and the date the app is displaying
     * 
     * Instead I use goToDay all the time. It's not the most optimized in term of 
     * number of http request.
     * 
     * However this could still be used for batch caching for example
     */
    goToNextDay(): Promise<HttpResponse>{
        let data = {
            'org.apache.myfaces.trinidad.faces.FORM': 'redirectForm',
            '_noJavaScript': false,
            'javax.faces.ViewState': '!1',
            'source': 'redirectForm:semSuiv'
        }
        data = querystring.stringify(data);
        let cookie = "JSESSIONID=" + this.config.jsessionid;
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
     * go to previous day for the server
     * This is not used anymore because it could cause sync problems between
     * the date the server think we are at and the date the app is displaying
     * 
     * Instead I use goToDay all the time. It's not the most optimized in term of 
     * number of http request.
     * 
     * However this could still be used for batch caching for example
     */
    goToPrevDay(): Promise<HttpResponse>{
        let data = {
            'org.apache.myfaces.trinidad.faces.FORM': 'redirectForm',
            '_noJavaScript': false,
            'javax.faces.ViewState': '!1',
            'source': 'redirectForm:semPrec'
        }
        data = querystring.stringify(data);
        let cookie = "JSESSIONID=" + this.config.jsessionid;
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
     * check if the phone has access to internet. 
     * This is better than calling isConnected and wait 6 hours for the 
     * phone to realise there is no connection
     */
    hasConnectivity(): boolean{
        let connectionType = connectivity.getConnectionType();
        return connectionType != connectivity.connectionType.none;
    }

    /**
     * login on cas with the given info
     * @param jsessionid a dummy jsessionid got from a GET on the login page
     * @param loginInfo loginInfo object filled
     */
    private loginOnCas(jsessionid: string, loginInfo: LoginInfo): Promise<HttpResponse>{
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
    private loginOnVtmob(url: string): Promise<HttpResponse>{
        url = encodeURI(url);
        let options = {
            url: url,
            method: "GET",
            dontFollowRedirects: true
        };
        return http.request(options);
    }

    /**
     * get the schedule page in HTML, you then have to parse it into a ScheduleDay object
     */
    private getScheduleHTML(): Promise<HttpResponse>{
        let cookie = "JSESSIONID=" + this.config.jsessionid;
        let options = {
            url: encodeURI(UserService.incompleteUrlSchedule + this.config.jsessionid),
            method: "GET",
            headers:{
                'Cookie': cookie              
            }
        };
        return http.request(options);
    }

    /**
     * extract a cookie with the given name from a list of raw cookie string
     * @param cookies list of string containing cookies
     * @param name name of the cookie to extract the cookie
     * @returns a string with looking like name=value
     */
    private extractCookie(cookies, name): string{
        for(let i = 0; i < cookies.length; i++){
            if(!cookies[i])
                continue;
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
    
    /**
     * extract a cookie's value from a list of cookie string
     * @param cookies list of string containing cookies
     * @param name name of the cookie to extract the cookie
     * @returns return the value of the cookie so if the cookie is "name=value", will return "value"
     */
    public extractCookieValue(cookies, name): string{
        let c = this.extractCookie(cookies, name);
        if(c)
            return c.split('=')[1];
        return "";
    }

    /**
     * thanks to the beautiful people working at the university the 
     * html page is full of "&#9;" that the parser can't deal with 
     * This function eliminates them
     * @param html 
     */
    private cleanHTML(html): string{
        return html.replace(new RegExp(UserService.escapeRegExp("&#9;"), 'g'), "");
    }

    /**
     * escape the given string to use it as a regex
     * found on stackoverflow somewhere
     * @param str 
     */
    static escapeRegExp(str): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
    }
}