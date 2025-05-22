/**
 * Created by bzkdjc on 2025-05-22.
 */

'use strict'
import Redis from 'ioredis';
import { v7 as uuid_v7 } from 'uuid';
import { RequestReply } from './requestReply.mjs';
import ProducerConsumer from './producerConsumer';
import Queryable from './queryable';

class redisStream {

  constructor(redisOptions) {
    this.sub = null;
    this.pub = null;
    this.init(redisOptions);
    this._subscriberMap = new Map();
    this.requestReply = new RequestReply(redisOptions, this);
    this.producerConsumer = new ProducerConsumer(redisOptions, this);
    this.queryable = new Queryable(redisOptions, this);
  }

  init(redisOptions) {
    this.pub = new Redis({ port: redisOptions.port, host: redisOptions.host, password: redisOptions.password, db: 0x0 });
    this.sub = new Redis({ port: redisOptions.port, host: redisOptions.host, password: redisOptions.password, db: 0x0 });
    this.sub.on('message', (topic, message) => {
      this._returnCallBacks(topic, message);
      //  console.log('Receive message %s from channel %s', message, topic);
    });


  }

  emit(topic, message) {
    this.pub.publish(topic, JSON.stringify(message));
  }

  on(topic, callbackFunction, registerCallBack) {
    if (this._subscriberMap.has(topic)) {
      const callbackMap = this._subscriberMap.get(topic);
      const guid = uuid_v7();
      callbackMap.set(guid, callbackFunction);
      if (registerCallBack) {
        registerCallBack(guid);
      }
    }
    else {
      const callbackMap = new Map();
      const guid = uuid_v7();
      callbackMap.set(guid, callbackFunction);
      this._subscriberMap.set(topic, callbackMap);
      this.sub.subscribe(topic, () => {
        if (registerCallBack) {
          registerCallBack(guid);
        }
      })
    }
  }

  _returnCallBacks(topic, message) {
    if (this._subscriberMap.has(topic)) {
      let callbackMap = this._subscriberMap.get(topic);
      callbackMap.forEach((callbackFunc, key, map) => {
        let msgParse = message;
        msgParse = JSON.parse(message);
        callbackFunc(msgParse);
      })
    }
  }

  _createMessage(message) {
    return {
      meta: {
        guid: null
      },
      message: JSON.stringify(message)
    }
  }
}


export default redisStream;