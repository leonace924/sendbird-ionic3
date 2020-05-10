import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SendBirdService } from "../../services/send-bird.service"
import { Content } from 'ionic-angular';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';

@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html'
})
export class ChatPage {
  public chat;
  public chatBox: string = "";
  public messages: Array<{ message: string, createdAt: Date }>;
  private loading;
  public user;
  @ViewChild(Content) content: Content;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private sendBird: SendBirdService,
    private loadingCtrl: LoadingController,
  ) {
    this.loading = this.loadingCtrl.create({
      content: "Please wait...",
      duration: 5000
    });
    this.loading.present();
    this.chat = this.navParams.get('chat');
    console.log('this.chat: ', this.chat);
    this.user = this.navParams.get('user');
    console.log('this.user: ', this.user);
    this.sendBird.enterOnChat(this.chat.url).then((channel) => this.chat = channel);
    this.subscribeOnReciveMessages();
    var messageListQuery = this.chat.createPreviousMessageListQuery();
    messageListQuery.load(30, true, (messageList: Array<{ message: string, createdAt: Date }>, error) => {
      if (error) return console.error(error);
      this.messages = messageList.reverse();
      this.loading && this.loading.dismiss();
      this.scrollBottom();
    });
  }

  public ionViewWillLeave(): void {
    this.sendBird.removeChannelHandler(this.chat.url);
  }

  public sendMessage(message: string = null): void {
    this.scrollBottom();
    if (!message || message === "") return;
    this.chat.sendUserMessage(message, (message, error) => {
      if (error) return console.error(error);
      this.messages.push(message);
      this.chatBox = "";
      this.scrollBottom();
    });
  }

  private subscribeOnReciveMessages(): any {
    this.sendBird.addChannelHandler(this.chat.url);
    this.sendBird.channelHandler.onMessageReceived = (channel, message) => {
      this.messages.push(message);
      this.scrollBottom();
    };
  }

  private scrollBottom(): void {
    setTimeout(() => {
      this.content.scrollToBottom();
    }, 200);
  }
}
