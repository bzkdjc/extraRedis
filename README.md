# extraRedis

This is "extra-redis", my fork of [extraRedis](https://maty21.github.io/extraRedis/ "ExtraRedis Homepage")

Install:
```bash
npm i -S bzkdjc/extraRedis
```

Uninstall:
```bash
npm un -S extra-redis
```

<!-- [![NPM](https://nodei.co/npm/extraRedis.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/extraRedis/) -->

### ioredis compatible API that provides these features :
- [x] **pub/sub -**  a simple api for publishing and subscribing messages without the needing to listen 'message' and to if your topic on it
- [x] **request/reply -** the abiliy to publish message that the response will return directly to you with simple api based on promises .
- [x] **producer/consumer -** now you can create simple job that will be sent to only one consumer at a time
- [x] **queryable -** the ability to query your returned via verity of criteria based on rx observable
More details below under the user instructions section

### Usage instructions:

#### creating new object

```javascript

var ERedis = new extraRedis({
  port    : 6379,
  host    : "127.0.0.1",
  password: "-someRedisPwd-"
});
// connects to db 0 by default
```

#### creating simple pub sub with multiple subscribers

```javascript

ERedis.on('foo',(message)=>{
  console.log('foo -> '+message);
},guid=>{console.log('guidfoo-> '+guid)})

ERedis.on('foo',(message)=>{
  console.log('foo2 -> '+message);
},guid=>{console.log('guidfoo2-> '+guid)})

ERedis.emit('foo','bar');

// foo -> bar
// foo2 -> bar

```


####  creating request reply so only the sending emtier will get directly the  message for his answer

```javascript
ERedis.requestReply.on('reqReplyFoo',(message,func)=>{
  console.log('reqReplyFoo-> '+message);
  func('reqReplyOnBar');
})

ERedis.requestReply.emit('reqReplyFoo','reqReplyBar').then((message)=>{
  console.log('reqReplyOnFoo-> '+message);

}).catch((e)=>{ console.log('ERROR!!!! '+e)});

// reqReplyFoo-> reqReplyBar
// reqReplyOnFoo-> reqReplyOnBar

```

#### creating producer consumers so only one consumer get a job at a time

- job queue: if there is more jobs than ready for work consumers than job added to queue
             and waiting for available consumers
- keepAliveConsumerState: clear not available consumers in order to ignore unconsumed jobs

```javascript

ERedis.producerConsumer.createJob('prodConsTest');

ERedis.producerConsumer.consume('prodConsTest', (message, finishFunction)=> {
  setTimeout(()=> {
    console.log(`message consumed -> ${message}`);
    finishFunction();
  }, 5000)

});
ERedis.producerConsumer.consume('prodConsTest', (message, finishFunction)=> {
  setTimeout(()=> {
    console.log(`message consumed -> ${message}`);
    finishFunction();
  }, 5000)
});


setTimeout(()=> {
  ERedis.producerConsumer.produce('produce job 1');
  ERedis.producerConsumer.produce('produce job 2');
  ERedis.producerConsumer.produce('produce job 3');
  console.log("sending job for producing")
}, 5000)

// message consumed -> produce job 1
// message consumed -> produce job 2

```

#### creating queryable instance based rx

```javascript

ERedis.queryable.createQueryableInstance('foo')
                .subscribe(message =>{
                  console.log(`queryable Instance -> ${message}`)
                })

// queryable Instance -> bar

```


#### creating queryable instance with filter

```javascript

ERedis.queryable.createQueryableInstance('foo')
  .filter((message)=>{
    return message.valueOf() =='bar'
  })
  .subscribe(message =>{
    console.log(`queryable Instance with filter -> ${message}`)
  })
// queryable Instance with filter -> bar

```

