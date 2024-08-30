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
  public modalMode: TimeType = 'login';
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
    const today = new Date(this.currentDate || Date.now()).getDay();
    return this.data.filter(entry => entry.registeredAt.getDay() === today);
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
    const difference = +entry2.registeredAt.getTime() - +entry1.registeredAt.getTime() - 3600000;
    const date = new Date(difference);

    let text = entry1.type === 'login' ? "Arbeit " : "Pause ";
    if (entry1.type === 'start-drive' && entry2.type === 'end-drive') {
      text = "Dienstreise";
    }

    return text + `(${date.toLocaleTimeString()})`;
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

  public removeEntry(index: number): void {
    this.shouldAnimate.splice(index, 1);
    this.data.splice(index, 1);
    this.saveData();
    this.updateCurrentAction();
  }

  private updateCurrentAction(): void {
    if (this.data.length == 0) {
      this.currentAction = 'login';
    }else {
      this.currentAction = this.data[this.data.length - 1].type === 'login' ? 'logout' : 'login';
    }
  }

  private saveData(): void {
    localStorage.setItem("time-data", JSON.stringify(this.data));
  }

  public addModalEntry(): void {
    const date = new Date(this.modalDate);
    date.setSeconds(0);

    this.data.push({
      registeredAt: date,
      type: this.modalMode
    });
    this.data.sort((a: TimeEntry, b: TimeEntry) => {
      return a.registeredAt.getTime() - b.registeredAt.getTime();
    });

    this.shouldAnimate = [];
    for (let i = 0; i < this.data.length; i++) {
      this.shouldAnimate.push(false);
    }

    this.saveData();
    this.modal?.dismiss(null, 'submit');
  }
}
