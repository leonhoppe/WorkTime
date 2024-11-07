import { Injectable } from '@angular/core';
import {TimeEntry} from "../models/timeEntry";

@Injectable({
  providedIn: 'root'
})
export class TimeService {

  constructor() { }

  public calculateTimespanInMinutes(start: TimeEntry, end: TimeEntry): number {
    const startSeconds: number = (start.registeredAt.getHours() * 3600) + (start.registeredAt.getMinutes() * 60) + start.registeredAt.getSeconds();
    const endSeconds: number = (end.registeredAt.getHours() * 3600) + (end.registeredAt.getMinutes() * 60) + end.registeredAt.getSeconds();

    const difference = endSeconds - startSeconds;
    const diffHours = Math.floor(difference / 3600.00);
    const diffMinutes = Math.floor((difference % 3600) / 60.00);

    return diffMinutes + (diffHours * 60);
  }

  public getEntries(day: any): TimeEntry[] {
    const today = new Date(day || Date.now()).toLocaleDateString();
    return this.loadEntries().filter(entry => entry.registeredAt.toLocaleDateString() === today);
  }

  public loadEntries(): TimeEntry[] {
    const savedData = localStorage.getItem("time-data");

    if (savedData != null) {
      const data = JSON.parse(savedData as string) as TimeEntry[];

      for (let entry of data) {
        entry.registeredAt = new Date(entry.registeredAt);
      }

      return data;
    }

    return [];
  }

  public saveEntries(entries: TimeEntry[]): void {
    localStorage.setItem("time-data", JSON.stringify(entries));
  }
}
