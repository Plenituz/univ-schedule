
export class ScheduleClass{
    name: string;
    room: string;
    timeStart: string;
    timeEnd: string;
    speaker: string;
    type: string;//"TP" "CM" etc
    extraInfo: string;//"+ ...."

    public toString(): string{
        let str = this.type + " " + this.name + "\n"
                + "en " + this.room + "\n" 
                + "a " + this.timeStart + "\n"
                + "jusqu'a " + this.timeEnd
                + (this.extraInfo ? "\n" + this.extraInfo : "");
        return str;
    }
}