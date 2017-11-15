
export class ScheduleClass{
    name: string;
    room: string;
    timeStart: string;
    timeEnd: string;
    speaker: string;
    type: string;//"TP" "CM" etc
    extraInfo: string;//"+ ...."

    public toString(): string{
        return ScheduleClass.toString(this);
    }

    static toString(scheduleClass: ScheduleClass): string{
        let str = scheduleClass.type + " " + scheduleClass.name + "\n"
            + "en " + scheduleClass.room + "\n" 
            + "a " + scheduleClass.timeStart + "\n"
            + "jusqu'a " + scheduleClass.timeEnd
            + (scheduleClass.extraInfo ? "\n" + scheduleClass.extraInfo : "");
        return str;
    }
}