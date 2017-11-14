import { NgModule } from "@angular/core";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { NativeScriptHttpModule } from "nativescript-angular/http";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { AppComponent } from "./app.component";
import { DataPasser } from "./shared/dataPasser";
import { routes, navigatableComponents } from "./app.routing";

@NgModule({
  imports: [
    NativeScriptModule,
    NativeScriptHttpModule,
    NativeScriptFormsModule,
    NativeScriptRouterModule,
    NativeScriptRouterModule.forRoot(routes),
  ],
  declarations: [
    AppComponent,
    ...navigatableComponents
  ],
  providers: [DataPasser],
  bootstrap: [AppComponent]  
})
export class AppModule {}
