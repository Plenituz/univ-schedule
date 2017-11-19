
/**
 * class holding data of a lecture or class
 */
export class ScheduleClass{
    name: string;
    room: string;
    timeStart: string;
    timeEnd: string;
    speaker: string;
    /** "TP" "CM" etc */
    type: string;
    /** "+ ...." */
    extraInfo: string;

    /** extract the ScheduleClass object into a readable string */
    public toString(): string{
        return ScheduleClass.toString(this);
    }

    /**
     * extract the ScheduleClass object into a readable string.
     * This is static because the DB doesn't return an instance of ScheduleClass.
     * The data is their but the prototype not
     * @param scheduleClass 
     */
    static toString(scheduleClass: ScheduleClass): string{
        let str = scheduleClass.type + " " + scheduleClass.name + "\n"
            + "en " + scheduleClass.room + "\n" 
            + "a " + scheduleClass.timeStart + "\n"
            + "jusqu'a " + scheduleClass.timeEnd
            + (scheduleClass.extraInfo ? "\n" + scheduleClass.extraInfo : "");
        return str;
    }
}