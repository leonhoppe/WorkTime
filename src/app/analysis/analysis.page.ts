import {Component, ElementRef, ViewChild} from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonDatetimeButton,
  IonModal,
  IonDatetime,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonCardSubtitle, IonList, IonIcon, IonProgressBar
} from '@ionic/angular/standalone';
import {FormsModule} from "@angular/forms";
import {TimeEntry} from "../../models/timeEntry";
import {TimeService} from "../../services/time.service";
import {Chart} from "chart.js/auto";
import {addIcons} from "ionicons";
import {briefcase, card, pizza} from "ionicons/icons";
import {NgClass, NgIf} from "@angular/common";
import {SettingsService} from "../../services/settings.service";
import {Settings} from "../../models/settings";
import {AppComponent} from "../app.component";

@Component({
  selector: 'app-tab2',
  templateUrl: 'analysis.page.html',
  styleUrls: ['analysis.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonDatetimeButton, IonModal, IonDatetime, FormsModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle, IonList, IonIcon, IonProgressBar, NgIf, NgClass]
})
export class AnalysisPage {
  public currentDate: any;
  public timeData: TimeEntry[] = [];

  public workTime: number = 0;
  public pauseTime: number = 0;
  public driveTime: number = 0;
  public combinedWorkTime: number = 0;
  public maxPauseTime: number = 0;

  public settings: Settings;

  // @ts-ignore
  @ViewChild('chart') chartRef: ElementRef;
  private chart: any;

  constructor(private time: TimeService, private settingsProvider: SettingsService) {
    this.settings = this.settingsProvider.loadSettings();
    addIcons({briefcase, pizza, card});
  }

  ionViewDidEnter() {
    this.currentDate = AppComponent.currentDate;
    this.updateCurrentData();
  }

  public updateCurrentDate() {
    AppComponent.currentDate = this.currentDate;
    this.updateCurrentData();
  }

  public updateCurrentData() {
    this.settings = this.settingsProvider.loadSettings();
    this.timeData = this.time.getEntries(this.currentDate);
    this.workTime = 0;
    this.pauseTime = 0;
    this.driveTime = 0;
    this.combinedWorkTime = 0;

    if (this.timeData.length >= 1 && this.time.isToday(this.currentDate)) {
      const lastEntry = this.timeData[this.timeData.length - 1];
      const diff = this.time.calculateTimespanInMinutes(lastEntry, {
        type: undefined,
        registeredAt: new Date(Date.now())
      });

      if (lastEntry.type == "login") {
        this.workTime += diff;
      }
      else if (lastEntry.type == "start-drive") {
        this.driveTime += diff;
      }

      if (lastEntry.registeredAt.getHours() < this.settings.dontTrackPauseAfter) {
        if (lastEntry.type == "logout" || lastEntry.type == "end-drive") {
          this.pauseTime += diff;
        }
      }
    }

    if (this.timeData.length >= 2) {
      for (let i = 1; i < this.timeData.length; i++) {
        const start = this.timeData[i - 1];
        const end = this.timeData[i];
        const diff = this.time.calculateTimespanInMinutes(start, end);

        if (start.type == 'start-drive' && end.type == 'end-drive') {
          this.driveTime += diff;
        }
        else if (start.type === 'login') {
          this.workTime += diff;
        }
        else {
          this.pauseTime += diff;
        }
      }
    }

    this.combinedWorkTime = this.workTime + this.driveTime;

    if (this.combinedWorkTime < 360) {
      this.maxPauseTime = this.settings.defaultPauseTime;
    }
    if (this.combinedWorkTime >= 360) { // 6h
      this.maxPauseTime = this.settings.pauseAfter6;
    }
    if (this.combinedWorkTime >= 540) { // 9h
      this.maxPauseTime = this.settings.pauseAfter9;
    }

    this.updateChart();
  }

  public updateChart() {
    const style = getComputedStyle(document.body);
    const textColor = style.getPropertyValue('--ion-text-color');
    const workColor = style.getPropertyValue('--ion-color-primary');
    const remainColor = style.getPropertyValue('--ion-card-background');
    const overColor = style.getPropertyValue('--ion-color-tertiary');
    const overColorWarn = style.getPropertyValue('--ion-color-warning');
    const overColorDanger = style.getPropertyValue('--ion-color-danger');

    let chartData: number[] = [];
    let chartLabels: string[] = [];
    let chartColors: string[] = [];

    if (this.combinedWorkTime > (this.settings.maxWorkTime + this.settings.maxOverTime)) {
      chartData.push(1);
      chartColors.push(overColorDanger);
    }
    else if (this.combinedWorkTime > this.settings.maxWorkTime) {
      const overTime = this.combinedWorkTime - this.settings.maxWorkTime;
      const overPercentage = (overTime / this.settings.desiredOverTime) * 0.5;

      chartData.push(overPercentage, 1 - overPercentage);
      chartLabels.push('Überstunden', 'Arbeitszeit');
      chartColors.push(overPercentage > 0.5 ? overColorWarn : overColor, workColor);
    }
    else if (this.combinedWorkTime == 0) {
      chartData.push(1);
      chartColors.push(remainColor);
    }
    else {
      chartData.push(this.workTime, Math.max(this.settings.maxWorkTime - this.combinedWorkTime, 0));
      chartColors.push(workColor, remainColor);
    }

    this.chart?.destroy();
    Chart.defaults.color = textColor;
    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: chartLabels,
        datasets: [{
          data: chartData,
          backgroundColor: chartColors
        }]
      },
      options: {
        events: [],
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  public formatTime(time: number): string {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;

    let result = hours < 10 ? "0" + hours + ":" : hours.toString() + ":";
    result += minutes < 10 ? "0" + minutes : minutes.toString();
    return result;
  }

  protected readonly Math = Math;
}
