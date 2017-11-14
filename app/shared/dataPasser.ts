import { Injectable } from '@angular/core';

@Injectable()
export class DataPasser {

    public day: number = -1;
    public month: number;
    public year: number;

    public constructor() { }
}