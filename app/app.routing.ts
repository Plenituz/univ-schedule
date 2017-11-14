import { LoginComponent } from "./pages/login/login.component";
import { DayComponent } from "./pages/dayDisplay/day.component";
import { CalendarComponent } from "./pages/calendar/calendar.component";
import { Config } from "./shared/config";
import { SettingsComponent } from "./pages/settings/settings.component";

export const routes = [
  { path: "", component: Config.loginIsValid ? DayComponent : LoginComponent },
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
