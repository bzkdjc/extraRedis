'use strict'
var Redis = require('ioredis');
var Guid = require('guid');
var RequestReply = require('./requestReply');
var ProducerConsumer = require('./producerConsumer');
var Queryable = require('./queryable');
class redisStream {

    constructor(redisOptions) {
        this.sub = null;
        this.pub = null;
       this.init(redisOptions);
        this._subscriberMap = new Map();
        this.requestReply = new RequestReply(redisOptions,this);
        this.producerConsumer = new ProducerConsumer(redisOptions,this);
        this.queryable= new Queryable(redisOptions,this);
    }

    init(redisOptions) {
        this.pub = new Redis({port:redisOptions.port, host:redisOptions.host, password:redisOptions.password, db:0x0});
        this.sub = new Redis({port:redisOptions.port, host:redisOptions.host, password:redisOptions.password, db:0x0});
        this.sub.on('message', (topic, message)=> {
            this._returnCallBacks(topic, message);
             //  console.log('Receive message %s from channel %s', message, topic);
        });


    }

    emit(topic, message) {
        this.pub.publish(topic, JSON.stringify(message));
    }

    on(topic, callbackFunction, registerCallBack) {
        if (this._subscriberMap.has(topic)) {
            let callbackMap = this._subscriberMap.get(topic);
            let guid = Guid.create();
            callbackMap.set(guid, callbackFunction);
            if (registerCallBack) {
                registerCallBack(guid);
            }
        }
        else {
            let callbackMap = new Map();
            let guid = Guid.create();
            callbackMap.set(guid, callbackFunction);
            this._subscriberMap.set(topic, callbackMap);
            this.sub.subscribe(topic, ()=> {
                if (registerCallBack) {
                    registerCallBack(guid);
                }
            })
        }
    }

    _returnCallBacks(topic, message) {
        if (this._subscriberMap.has(topic)) {
            let callbackMap = this._subscriberMap.get(topic);
            callbackMap.forEach((callbackFunc, key, map)=> {
                var msgParse = message;
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


module.exports = redisStream;