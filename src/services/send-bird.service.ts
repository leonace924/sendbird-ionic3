import { Injectable } from "@angular/core";

import * as SendBird from 'SendBird';

@Injectable()
export class SendBirdService {
  public sendBird: any;
  public channelHandler: any;

  constructor() {
    this.sendBird = new SendBird({'appId': '526A32F1-AE7E-44C2-9313-E3C2C0030474'});
    this.channelHandler = new this.sendBird.ChannelHandler();
  }

  public connectUser(userEmail: string): Promise<object> {
    return new Promise((resolve, reject) => {
      this.sendBird.connect(userEmail, (user, error) => {
        if (error) return reject(error);
        return resolve(user);
      });
    });
  }

  public disconnect(): void {
    this.sendBird.disconnect(() => console.log("disconnected"));
  } 

  public getChannels(): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
      var channelListQuery = this.sendBird.GroupChannel.createMyGroupChannelListQuery();
      channelListQuery.includeEmpty = true;
      channelListQuery.limit = 20; // pagination limit could be set up to 100
      if (channelListQuery.hasNext) {
        channelListQuery.next(function(channelList, error){
          if (error) {
              console.error(error);
              return reject(error);
          }
          resolve(channelList);
        });
      }
    })
  }

  public createPublicChannel(name: string, coverUrl: string, data: object): Promise<object> {
    return new Promise((resolve, reject) => {
      this.sendBird.OpenChannel.createChannel(name, coverUrl, data, (createdChannel, error) => {
        if (error) {
          console.error(error);
          return reject(error);
        }
        return resolve(createdChannel);
    });
    })
  }

  /**
   * 
   * @param {any} userId 
   * @param {any} name the name of a channel, or the channel topic.
   * @param {any} coverFile the file or URL of the cover image, which you can fetch to render into the UI.
   * @param {any} data the String field to store structured information, such as a JSON String.
   * @param {any} customType the String field that allows you to subclassify your channel.
   * @returns {Promise<any>} 
   * @memberof SendBirdService
   */
  public createOneToOneChat(userId, name = userId, coverFile?, data?, customType?): Promise<any> {
    return new Promise((resolve, reject) => {
      this.sendBird.GroupChannel.createChannelWithUserIds([userId], true, name, coverFile, data, customType, function(createdChannel, error){
        if (error) {
          console.error(error);
          return reject(error);
        }
        return resolve(createdChannel);
    });
    })
  }


  public enterOnChat(channelUrl: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.sendBird.GroupChannel.getChannel(channelUrl, (channel, error) => {
        if (error) {
            console.error(error);
            return reject(error);
        }
        resolve(channel);
    });
  });
  }


  public addChannelHandler(uniqueID: string): any {
    this.sendBird.addChannelHandler(uniqueID, this.channelHandler);
  }

  public removeChannelHandler(uniqueID: string): void {
    this.sendBird.removeChannelHandler(uniqueID);
  }

  public sendChannelMessage(message: string = "", channel: any): Promise<string> {
    return new Promise((resolve, reject) => {
      channel.sendUserMessage(message, (message, error) => {
        if (error) {
          console.error(error);
          return reject(error);
        }
        return resolve(message);
      });
    })
  }

}
