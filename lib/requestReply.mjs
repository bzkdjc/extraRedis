/**
 * Created by maty2_000 on 6/25/2016.
 * Modifed by bzkdjc on 2025-05-21.
 */
export { RequestReply };

import Redis from 'ioredis';
import { v7 as uuid_v7 } from 'uuid';



const RequestReply = class RequestReply {

  constructor(redisOptions, father) {


    this.init(redisOptions);
    this._reqReplyMap = new Map();
    this._father = father;

  }


  init(redisOptions) {
    this.sub = new Redis({ port: redisOptions.port, host: redisOptions.host, password: redisOptions.password, db: 0x0 });
    this.reqReply = new Redis({ port: redisOptions.port, host: redisOptions.host, password: redisOptions.password, db: 0x0 });
    this.reqReply.on('message', (topic, message) => {
      this._returnCallBackReqReply(topic, message);
      //  console.log('Receive reqReply message %s from channel %s', message, topic);
    });
  }

  _returnCallBackReqReply(topic, message) {
    if (this._reqReplyMap.has(topic)) {
      const callbackMap = this._reqReplyMap.get(topic);
      callbackMap.resolve(JSON.parse(message));
    }

  }

  emit(topic, message) {
    return new Promise((resolve, reject) => {
      const guid = uuid_v7();
      this.reqReply.subscribe(topic + guid, () => {
        //             console.log("requestReply: "+topic+guid)
        this._reqReplyMap.set(topic + guid, { resolve: resolve, reject: reject });
        const msg = this._father._createMessage(message);
        msg.meta.guid = guid;
        this._father.emit(topic, msg);
      })
    })
  }

  on(topic, callbackFunc) {
    const self = this;
    this.reqReply.subscribe(topic, () => {
      this._father.on(topic, (message) => {
        callbackFunc(message.message, (msg) => {
          self._father.emit(topic + message.meta.guid, msg);
        })
      })
    })
  }


};
