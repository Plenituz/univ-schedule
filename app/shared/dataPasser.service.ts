import { Injectable } from '@angular/core';

/**
 * This service is used as a global singleton (put in the providers of app.module.ts)
 * It allows passing data from the datePicker component back to the day display component
 * 
 * Note: if day == -1 the data is invalid
 */
@Injectable()
export class DataPasser {

    /** if this is equal to -1 the data is invalid */
    public day: number = -1;
    public month: number;
    public year: number;

    public constructor() { }
}