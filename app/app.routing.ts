import { LoginComponent } from "./pages/login/login.component";
import { DayComponent } from "./pages/dayDisplay/day.component";
import { CalendarComponent } from "./pages/calendar/calendar.component";
import { SettingsComponent } from "./pages/settings/settings.component";
var applicationSettings = require("application-settings");

export const routes = [
  { path: "", component: applicationSettings.getBoolean("loginIsValid", false) ? DayComponent : LoginComponent },
  { path: "login", component: LoginComponent },
  { path: "day", component: DayComponent },
  { path: "datePicker", component: CalendarComponent },
  { path: "settings", component: SettingsComponent },
];

export const navigatableComponents = [
  LoginComponent,
  DayComponent,
  CalendarComponent,
  SettingsComponent
];
