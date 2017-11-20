# What is this ?

This is a Nativescript app that allow students of the University of Valenciennes to get their schedule in a super easy and fast way compared to the university's website.
This app is written in TypeScript with Angular and uses Couchbase for storing data. 
You can find the app on the Play Store here: https://play.google.com/store/apps/details?id=com.plenituz.UnivSchedule

For the iPhone version you will have to build it yourself, instruction will come soon

# How to build on Android

You need to have Node, Nativescript and some kind of emulator or device to run the app on.

If you want to build the app as an apk just to install it on your device simply run
```
npm run start-android-bundle --uglify --snapshot -- --release
```
This will generate an unsigned apk in platforms/android/build/outputs/apk/
If you want to sign the apk with your keystore use
```
npm run build-android-bundle --uglify --snapshot -- --release --key-store-path "/path/to/keystore" --key-store-password your-keystore-pass --key-store-alias your-alias --key-store-alias-password your-alias-pass
```

However if you want to contribute or fork the app you might be used to run `tns run android` but this won't work out of the box here.
Because of a bug in webpack the paths given in `styleUrls` and `templateUrl` of each component have to be changed before running `tns run android`

Webpack is expecting the path from the current folder of the file whereas tns run expect the path from the root the of project.
For example `templateUrl: "day.html"` is valid for webpack but `templateUrl: "./pages/dayDisplay/day.html"` is valid for tns run.

I somewhat prepared for that, in each component you just have to remove the comment so this:
```
templateUrl:/* "./pages/dayDisplay/" +*/ "day.html",
```
Becomes:
```
templateUrl: "./pages/dayDisplay/" + "day.html",
```
I also found that sometimes it won't compile until you remove the first dot, try it if you have runtime errors saying "/path/.../day.css is not found"

This is more of a workaround, if you find some kind of precompiler instruction detecting the release/debug mode feel free to implement it.
Don't forget to re-add the comments before submitting a pull request.

# The login process
This app is only possible because I figured out how the login protocol works on the university's website. In this section I will explain what I found. Note that some pieces of the puzzle are still missing, see the "Known bugs" section.

![login process](https://raw.githubusercontent.com/Plenituz/univ-schedule/master/other/schema_login.png)

Our goal here is to obtain a JSESSIONID cookie for the domain vtmob.univ-valenciennes.fr. It is important to note that the cookie you get from login into cas.univ-valenciennes.fr won't work on vtmob. Cas stands for "centralized authentication service", as the name implies it's this domains that distribute all the cookies, therefore the first step is to log into cas. 

To do so you have to provide very specific information, in addition to the login/password. When you send a GET request on the login page the page you receive in response contains a form with a few hidden inputs:

```html
<input name="lt" value="LT-16743-smqhGRFduAgkUE5JsNcEc0uR7bTbgY-cas.univ-valenciennes.fr" type="hidden">
<input name="execution" value="e1s1" type="hidden">
<input name="_eventId" value="submit" type="hidden">

<input name="ipAddress" value="31.87.156.115" type="hidden">
<input name="userAgent" value="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:57.0) Gecko/20100101 Firefox/57.0" type="hidden">

<input class="btn btn-submit" name="submit" accesskey="l" value="Connexion" tabindex="4" type="submit">
<input class="btn btn-reset" name="reset" accesskey="c" value="EFFACER" tabindex="5" type="reset">

<input name="ipAddress" value="31.87.156.115" type="hidden">
<input name="userAgent" value="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:57.0) Gecko/20100101 Firefox/57.0" type="hidden">
```

You need to parse the html and extract the values for the inputs `lt`, `execution` and `ipAddress`. Be careful when parsing: the inputs are not properly closed and the ipAddress and userAgent field are duplicated but can be included only once. 

You can then send a POST request to the same URL with form data containing the extracted form data but also username, password and the content of the fields `_eventId` and `userAgent` which you don't need to parse because they never change. Here is what the object to stringify could look like:

```javascript
{
    username: "username",
    password: "password",
    lt: "LT-16743-smqhGRFduAgkUE5JsNcEc0uR7bTbgY-cas.univ-valenciennes.fr",
    execution: "e1s1",
    _eventId: "submit",
    submit: "Connexion",
    ipAddress: "31.87.156.115",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:57.0) Gecko/20100101 Firefox/57.0"
}
```

If everything went well the server should answer with code 302 and a Location field in the headers containing an url for the domain vtmob with a ticket at the end, for example:

```url
https://vtmob.univ-valenciennes.fr/esup-vtclient-up4/stylesheets/mobile/welcome.xhtml?ticket=ST-40685-BQkGhRtf5OaQiIrlffgu-cas.univ-valenciennes.fr
```

The last step is to send a GET request to this URL and the vtmob server should give you a JSESSIONID cookie that you can store for later use.

All this logic can be found in app/shared/user/user.service.ts. 

# Getting the schedule

Once you're properly logged in you still need to know some details before you can get the schedule.

The main thing you need to know is that the state of the schedule is kept by the server, not the client. This means you don't send "give me x day" to the server but "give me the current day". You can then send some request to ask the server to go to the next/previous day. 

You can however still ask the server to go to a specific date by using the calendar. To do so you first need to ask the server to "open" the calendar view and then to go to the wanted date. If you directly ask the server to go to the date it will answer with a javafx exception saying that the calendar view has not been initialized. To get more details on that see the method `goToDay()` app/shared/user/user.service.ts.

# Known bugs

 - After disconnecting you have to restart the app or your login is always invalid. For some reason the server doesn't send the real login page with the full form after disconnecting. 
 - If you enter a wrong login/password, the next time you tap connect an error will pop up, even if the login/password is good.

 # Contributions

Contributions are of course welcome, each class should be documented but if you have questions shoot me an email.
