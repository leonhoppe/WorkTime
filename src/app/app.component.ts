import { Component } from '@angular/core';
import {AlertController, IonApp, IonRouterOutlet} from '@ionic/angular/standalone';
import {SwUpdate} from "@angular/service-worker";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  public static currentDate: any;
  constructor(private updates: SwUpdate, private alerts: AlertController) {
    if (updates.isEnabled) {
      updates.checkForUpdate().then(async available => {
        if (available) await this.showUpdateAlert();
      });
    }
  }

  private async showUpdateAlert() {
    const alert = await this.alerts.create({
      header: "Update verfügbar!",
      message: 'Möchtest du das Update herunterladen?',
      buttons: [
        {
          text: "Nein",
          role: "cancel"
        },
        {
          text: "Ja",
          role: "destructive"
        }
      ]
    });

    await alert.present();
    const result = await alert.onDidDismiss();

    if (result.role == "destructive") {
      await this.updates.activateUpdate();
      document.location.reload();
    }
  }
}
