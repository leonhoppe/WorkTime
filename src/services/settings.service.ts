import { Injectable } from '@angular/core';
import {Settings} from "../models/settings";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor() { }

  public loadSettings(): Settings {
    const raw = localStorage.getItem("settings");

    if (raw == undefined) return this.defaultSettings();

    return JSON.parse(raw) as Settings;
  }

  public saveSettings(settings: Settings): void {
    localStorage.setItem("settings", JSON.stringify(settings));
  }

  public defaultSettings(): Settings {
    return {
      notifications: false,
      maxWorkTime: 420, // 7h
      defaultPauseTime: 0,
      pauseAfter6: 30,
      pauseAfter9: 45,
      dontTrackPauseAfter: 14,
      maxOverTime: 60,
      desiredOverTime: 30
    };
  }
}
