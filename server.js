'use strict';

const http = require('http');
const today = new Date();
const date = today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate();
const url = 'http://api.jugemkey.jp/api/horoscope/free/' + date;
let ans;
const req = http.get(url, (res) => {
  let body = '';
  res.setEncoding('utf8');

  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', (res) => {
    ans = JSON.parse(body);
  });
}).on('error', (e) => {
  console.log(e.message);
});

const express = require('express');
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 3000;

const config = {
    channelAccessToken: '',
    channelSecret: ''
};

const app = express();

app.post('/webhook', line.middleware(config), (req, res) => {
  console.log(req.body.events);

    Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result));
});

const client = new line.Client(config);

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  let result = ans.horoscope[date].filter((i) => i.sign == event.message.text)[0];
  let line = '';

  if(event.message.text === 'おーい'){
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '今戻りました。\nお待たせしてすみません。'
    });
  }

  if(result === undefined){
    return Promise.resolve(null);
  }else{
    line = '今日の' + event.message.text + 'の運勢\n' + result.content
            + '\nラッキーカラー：' + result.color + '\nラッキーアイテム：' + result.item;
  }
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: line
  });
}

app.listen(PORT);

console.log(`Server running at ${PORT}`);
