import {Component, ViewChild} from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonModal,
  IonButtons,
  IonInput,
  IonDatetime,
  IonDatetimeButton,
  IonSelect,
  IonSelectOption,
  AlertController
} from '@ionic/angular/standalone';
import {TimeEntry, TimeType} from "../../models/timeEntry";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {addIcons} from "ionicons";
import {add, trash} from "ionicons/icons";
import {FormsModule} from "@angular/forms";
import {TimeService} from "../../services/time.service";
import {AppComponent} from "../app.component";

@Component({
  selector: 'app-tab1',
  templateUrl: 'time.page.html',
  styleUrls: ['time.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, NgForOf, IonButton, IonList, IonItem, IonLabel, NgIf, NgClass, IonIcon, IonModal, IonButtons, IonInput, IonDatetime, IonDatetimeButton, IonSelect, IonSelectOption, FormsModule],
})
export class TimePage {
  public data: TimeEntry[] = [];
  public today: TimeEntry[] = [];
  public shouldAnimate: boolean[] = [];
  public currentAction: TimeType = 'login';
  @ViewChild('createModal') modal: IonModal | undefined;

  public modalDate: any;
  public currentDate: any;

  constructor(private timeService: TimeService, private alerts: AlertController) {
    this.data = timeService.loadEntries();

    for (let i = 0; i < this.data.length; i++) {
      this.shouldAnimate.push(false);
    }

    this.updateCurrentAction();

    addIcons({add, trash});
  }

  ionViewDidEnter() {
    this.currentDate = AppComponent.currentDate;
  }

  public updateCurrentDate() {
    AppComponent.currentDate = this.currentDate;
  }

  public getEntriesOfToday(): TimeEntry[] {
    const today = new Date(this.currentDate || Date.now()).toLocaleDateString();
    this.today = this.data.filter(entry => entry.registeredAt.toLocaleDateString() === today);
    return this.today;
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
      text = "Dienstreise ";
    }

    return text + `(${this.calculateTimespan(entry1, entry2)})`;
  }

  private calculateTimespan(start: TimeEntry, end: TimeEntry): string {
    const time = this.timeService.calculateTimespanInMinutes(start, end);
    const hours = Math.floor(time / 60);
    const minutes = time % 60;

    return this.formatEntry(hours, minutes);
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

  public async removeEntry(entry: TimeEntry, index: number) {
    if (!this.isToday()) return;

    const alert = await this.alerts.create({
      header: "Achtung!",
      message: 'Möchtest du diesen Eintrag wirklich löschen?',
      buttons: [
        {
          text: "Abbrechen",
          role: "cancel"
        },
        {
          text: "Löschen",
          role: "destructive"
        }
      ]
    });
    await alert.present();
    const result = await alert.onDidDismiss();

    if (result.role == "destructive") {
      this.shouldAnimate.splice(index, 1);
      this.data.splice(this.data.indexOf(entry), 1);
      this.saveData();
      this.updateCurrentAction();
    }
  }

  private updateCurrentAction(): void {
    if (this.data.length == 0) {
      this.currentAction = 'login';
    }else {
      const lastAction = this.data[this.data.length - 1].type;

      switch (lastAction) {
        case "start-drive":
          this.currentAction = 'end-drive';
          break;

        case "end-drive":
          this.currentAction = 'login';
          break;

        case "login":
          this.currentAction = 'logout';
          break;

        case "logout":
        default:
          this.currentAction = 'login';
          break;
      }
    }
  }

  public translateCurrentAction(): string {
    switch (this.currentAction) {
      case "start-drive":
        return "Dienstreise starten";

      case "end-drive":
        return "Dienstreise beenden";

      case "login":
        return "Einstempeln";

      case "logout":
      default:
        return "Ausstempeln";
    }
  }

  private saveData(): void {
    this.timeService.saveEntries(this.data);
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

    this.saveData();
    this.updateCurrentAction();
    this.modal?.dismiss(null, 'submit');
    this.modalDate = undefined;
  }

  public isToday(): boolean {
    return this.timeService.isToday(this.currentDate);
  }

  protected readonly open = open;
}
