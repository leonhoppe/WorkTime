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
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import {FormsModule} from "@angular/forms";
import {TimeEntry} from "../../models/timeEntry";
import {TimeService} from "../../services/time.service";
import {Chart} from "chart.js/auto";
import {addIcons} from "ionicons";
import {briefcase, card, pizza} from "ionicons/icons";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-tab2',
  templateUrl: 'analysis.page.html',
  styleUrls: ['analysis.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent, IonItem, IonLabel, IonDatetimeButton, IonModal, IonDatetime, FormsModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle, IonList, IonIcon, IonProgressBar, NgIf]
})
export class AnalysisPage {
  public currentDate: any;
  public timeData: TimeEntry[] = [];

  public workTime: number = 0;
  public pauseTime: number = 0;
  public driveTime: number = 0;
  public combinedWorkTime: number = 0;

  public maxWorkTime: number = 420;
  public maxPauseTime: number = 30;
  public maxOverTime: number = 60;
  public desOverTime: number = 30;

  // @ts-ignore
  @ViewChild('chart') chartRef: ElementRef;
  private chart: any;

  private changeListener: any;

  constructor(private time: TimeService) {
    addIcons({briefcase, pizza, card})
  }

  ionViewDidEnter() {
    this.updateCurrentData();

    let lastDate: any = undefined;
    this.changeListener = setInterval(() => {
      if (this.currentDate != lastDate) {
        lastDate = this.currentDate;
        this.updateCurrentData();
      }
    }, 200)
  }

  ionViewDidLeave() {
    clearInterval(this.changeListener);
  }

  public updateCurrentData() {
    this.timeData = this.time.getEntries(this.currentDate);
    this.workTime = 0;
    this.pauseTime = 0;
    this.driveTime = 0;
    this.combinedWorkTime = 0;

    if (this.timeData.length < 2) {
      this.showEmptyChart();
      return;
    }

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
    this.combinedWorkTime = this.workTime + this.driveTime;

    if (this.combinedWorkTime < 360) {
      this.maxPauseTime = 0;
    }
    if (this.combinedWorkTime >= 360) { // 6h
      this.maxPauseTime = 30;
    }
    if (this.combinedWorkTime >= 540) { // 9h
      this.maxPauseTime = 45;
    }

    this.updateChart();
  }

  public updateChart() {
    const style = getComputedStyle(document.body);
    const textColor = style.getPropertyValue('--ion-text-color');
    const workColor = style.getPropertyValue('--ion-color-primary');
    const driveColor = style.getPropertyValue('--ion-color-secondary');
    const remainColor = style.getPropertyValue('--ion-card-background');
    const overColor = style.getPropertyValue('--ion-color-tertiary');
    const overColorWarn = style.getPropertyValue('--ion-color-warning');

    let overData: number[] = [];
    let overLabels: string[] = [];
    let overColors: string[] = [];

    if (this.combinedWorkTime > this.maxWorkTime) {
      const overTime = this.combinedWorkTime - this.maxWorkTime;
      const overPercentage = overTime / this.desOverTime;

      overData.push(this.combinedWorkTime * overPercentage);
      overLabels.push('Überstunden');
      overColors.push(overPercentage > 1 ? overColorWarn : overColor);
    }

    this.chart?.destroy();
    Chart.defaults.color = textColor;
    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: [
          ...overLabels,
          'Arbeitszeit',
          'Dienstreise'
        ],
        datasets: [{
          label: 'Zeit',
          data: [...overData, this.workTime, this.driveTime, Math.max(this.maxWorkTime - this.combinedWorkTime, 0)],
          backgroundColor: [
            ...overColors,
            workColor,
            driveColor,
            remainColor
          ],
        }]
      },
      options: {
        events: [],
        plugins: {
          legend: {
            display: this.driveTime > 0 || this.combinedWorkTime > this.maxWorkTime
          }
        }
      }
    });
  }

  public showEmptyChart() {
    const style = getComputedStyle(document.body);
    const remainColor = style.getPropertyValue('--ion-card-background');

    this.chart?.destroy();
    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          label: 'Zeit',
          data: [100],
          backgroundColor: [
            remainColor
          ],
        }]
      },
      options: {
        events: [],
        plugins: {
          legend: {
            display: this.driveTime > 0 || this.combinedWorkTime > this.maxWorkTime
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
