import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonToggle,
  IonButton,
  IonLabel,
  IonItemDivider,
  IonCol,
  ToastController,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent
} from '@ionic/angular/standalone';
import {Settings} from "../../models/settings";
import {SettingsService} from "../../services/settings.service";
import {FormsModule} from "@angular/forms";
import {addIcons} from "ionicons";
import {briefcase, card, pizza, save} from 'ionicons/icons';

@Component({
  selector: 'app-tab3',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonInput, FormsModule, IonToggle, IonButton, IonLabel, IonItemDivider, IonCol, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent],
})
export class SettingsPage {
  public settings: Settings;
  public input: Settings = {};

  constructor(private settingsProvider: SettingsService, private toasts: ToastController) {
    this.settings = settingsProvider.loadSettings();
    this.input.notifications = this.settings.notifications;

    addIcons({save, briefcase, pizza, card});
  }

  public async save() {
    if (this.input.maxWorkTime != undefined)
      this.input.maxWorkTime = this.input.maxWorkTime * 60;

    this.input.maxWorkTime ??= this.settings.maxWorkTime;
    this.input.defaultPauseTime ??= this.settings.defaultPauseTime;
    this.input.pauseAfter6 ??= this.settings.pauseAfter6;
    this.input.pauseAfter9 ??= this.settings.pauseAfter9;
    this.input.maxOverTime ??= this.settings.maxOverTime;
    this.input.desiredOverTime ??= this.settings.desiredOverTime;
    this.input.dontTrackPauseAfter ??= this.settings.dontTrackPauseAfter;

    this.settingsProvider.saveSettings(this.input);

    this.settings = this.settingsProvider.loadSettings();
    this.input = {};
    this.input.notifications = this.settings.notifications;

    const toast = await this.toasts.create({
      message: "Einstellungen gespeichert!",
      icon: "save",
      duration: 2000,
      cssClass: 'toast'
    });
    await toast.present();
  }
}
