import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ChatPage } from "../chat/chat"
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';

import { SendBirdService } from "../../services/send-bird.service"
import { AlertController } from 'ionic-angular/components/alert/alert-controller';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  public chats: Array<any> = [];
  private loading;
  private user;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private sendBird: SendBirdService,
    private alertCntrl: AlertController,
    private loadingCtrl: LoadingController,
  ) {
    this.loading = this.loadingCtrl.create({
      content: "Please wait...",
      duration: 10000
    });
    this.presentPrompt('Connect as...').then((email) => {
      this.loading.present();
      this.sendBird.connectUser(email)
        .then((user) => {
          this.user = user;
          this.getChannels();
        }).catch((e) => console.log("error", e)
      )
    })
  }

  public createPrivateChannel(): void {
    this.presentPrompt('create chat with...').then((user) => {
      this.sendBird.createOneToOneChat(user).then((channel) => {
        this.getChannels();
        console.log("channel", channel);
      });
    })
  }

  public chatTapped(event, chat): void {
    this.navCtrl.push(ChatPage, { chat, user: this.user });
  }

  private getChannels(): void {
    this.sendBird.getChannels().then((channels) => {
      this.chats = channels;
      console.log('channels: ', channels);
      this.loading.dismiss();
    });
  }


  private presentPrompt(title: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let alert = this.alertCntrl.create({
        title,
        inputs: [{
          name: 'email',
          placeholder: 'miquel@consentio.co'
        }],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: data => reject()
          },
          {
            text: 'Choose',
            handler: data => {
              if (data.email) resolve(data.email.toLowerCase());
              else resolve('miquel@consentio.co')
              return reject();
            }
          }
        ]
      });
      alert.present();
    });
  }
}

