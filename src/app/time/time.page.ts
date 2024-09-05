import {Component, ViewChild} from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonList,
  IonItem,
  IonLabel, IonIcon, IonModal, IonButtons, IonInput, IonDatetime, IonDatetimeButton, IonSelect, IonSelectOption
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import {TimeEntry, TimeType} from "../../models/timeEntry";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {addIcons} from "ionicons";
import {add} from "ionicons/icons";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-tab1',
  templateUrl: 'time.page.html',
  styleUrls: ['time.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent, NgForOf, IonButton, IonList, IonItem, IonLabel, NgIf, NgClass, IonIcon, IonModal, IonButtons, IonInput, IonDatetime, IonDatetimeButton, IonSelect, IonSelectOption, FormsModule],
})
export class TimePage {
  public data: TimeEntry[] = [];
  public shouldAnimate: boolean[] = [];
  public currentAction: TimeType = 'login';
  @ViewChild('createModal') modal: IonModal | undefined;

  public modalDate: any;
  public currentDate: any;

  constructor() {
    const savedData = localStorage.getItem("time-data");

    if (savedData != null) {
      this.data = JSON.parse(savedData as string);

      for (let entry of this.data) {
        entry.registeredAt = new Date(entry.registeredAt);
        entry.registeredAt.toLocaleTimeString();

        this.shouldAnimate.push(false);
      }

      this.updateCurrentAction();
    }

    addIcons({add});
  }

  public getEntriesOfToday(): TimeEntry[] {
    const today = new Date(this.currentDate || Date.now()).toLocaleDateString();
    return this.data.filter(entry => entry.registeredAt.toLocaleDateString() === today);
  }

  public getTypeText(type: TimeType): string {
    switch (type) {
      case "login":
        return "Eingestempelt";

      case "logout":
        return "Ausgestempelt";

      case "start-drive":
        return "Dienstreise gestartet";

      case "end-drive":
        return "Dienstreise beendet";
    }
  }

  public generateSeparatorText(entry1: TimeEntry, entry2: TimeEntry): string {
    let text = entry1.type === 'login' ? "Arbeit " : "Pause ";
    if (entry1.type === 'start-drive' && entry2.type === 'end-drive') {
      text = "Dienstreise";
    }

    return text + `(${this.calculateTimespan(entry1.registeredAt, entry2.registeredAt)})`;
  }

  private calculateTimespan(start: Date, end: Date): string {
    const startSeconds: number = (start.getHours() * 3600) + (start.getMinutes() * 60) + start.getSeconds();
    const endSeconds: number = (end.getHours() * 3600) + (end.getMinutes() * 60) + end.getSeconds();

    const difference = endSeconds - startSeconds;
    const diffHours = Math.floor(difference / 3600.00);
    const diffMinutes = Math.floor((difference % 3600) / 60.00);

    return this.formatEntry(diffHours, diffMinutes);
  }

  public formatEntry(hours: number, minutes: number): string {
    let result = hours < 10 ? "0" + hours + ":" : hours.toString() + ":";
    result += minutes < 10 ? "0" + minutes : minutes.toString();
    return result;
  }

  public addEntry(): void {
    const animateIndex = this.shouldAnimate.length;
    this.shouldAnimate.push(true)
    setTimeout(() => this.shouldAnimate[animateIndex] = false, 2000);

    this.data.push({
      registeredAt: new Date(Date.now()),
      type: this.currentAction
    });
    this.saveData();
    this.updateCurrentAction();
  }

  public removeEntry(entry: TimeEntry, index: number): void {
    this.shouldAnimate.splice(index, 1);
    this.data.splice(this.data.indexOf(entry), 1);
    this.saveData();
    this.updateCurrentAction();
  }

  private updateCurrentAction(): void {
    const today = this.getEntriesOfToday();
    if (today.length == 0) {
      this.currentAction = 'login';
    }else {
      this.currentAction = today[today.length - 1].type === 'login' ? 'logout' : 'login';
    }
  }

  private saveData(): void {
    localStorage.setItem("time-data", JSON.stringify(this.data));
  }

  public openModal(): void {
    this.modal?.present();
  }

  public addModalEntry(): void {
    const date = new Date(this.modalDate || Date.now());
    date.setSeconds(0);

    this.data.push({
      registeredAt: date,
      type: this.currentAction
    });
    this.data.sort((a: TimeEntry, b: TimeEntry) => {
      return a.registeredAt.getTime() - b.registeredAt.getTime();
    });

    this.shouldAnimate = [];
    for (let i = 0; i < this.data.length; i++) {
      this.shouldAnimate.push(false);
    }

    this.updateCurrentAction();
    this.saveData();
    this.modal?.dismiss(null, 'submit');
    this.modalDate = undefined;
  }

  public isToday(): boolean {
    return new Date(this.currentDate || Date.now()).toLocaleDateString() === new Date(Date.now()).toLocaleDateString();
  }

  protected readonly open = open;
}
