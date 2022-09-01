const path = require("path");
const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const cors = require("cors");
app.set("port", process.env.PORT || 8099);
const PORT = app.get("port");
app.use(cors());
// mongodb관련 모듈
const MongoClient = require("mongodb").MongoClient;

let db = null;
MongoClient.connect(process.env.MONGO_URL, { useUnifiedTopology: true }, (err, client) => {
  console.log("db 연결");
  if (err) {
    console.log(err);
  } else {
    console.log("voca-app 연결");
  }
  db = client.db("voca-app");
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  res.send("hello voca-app");
});
app.post("/day/add", (req, res) => {
  db.collection("counter").findOne({ name: "count" }, (err, result) => {
    const insertData = {
      day: req.body.day,
      id: result.daysTotal,
    };
    db.collection("days").insertOne(insertData, (err, result) => {
      db.collection("counter").updateOne({ name: "count" }, { $inc: { daysTotal: 1 } }, (err, result) => {
        if (err) {
          console.log(err);
        }
        res.json({ insert: "ok" });
      });
    });
  });
});

app.post("/voca/add", (req, res) => {
  db.collection("counter").findOne({ name: "count" }, (err, result) => {
    const insertData = {
      day: parseInt(req.body.day),
      eng: req.body.eng,
      kor: req.body.kor,
      isDone: parseBoolean(req.body.isDone),
      id: result.vocasTotal,
    };
    db.collection("vocas").insertOne(insertData, (err, result) => {
      db.collection("counter").updateOne({ name: "count" }, { $inc: { vocasTotal: 1 } }, (err, result) => {
        if (err) {
          console.log(err);
        }
        res.json({ insert: "ok" });
      });
    });
  });
});
app.get("/days", (req, res) => {
  db.collection("days")
    .find()
    .toArray((err, result) => {
      res.json(result); //   페이지 내가 만들어서 보내주기
    });
});
app.get("/voca/:day", (req, res) => {
  console.log(req.params.day);
  const _day = parseInt(req.params.day);
  // db연결하고 해당되는것의 모든 데이터를 받아서 json으로 리턴하기...
  db.collection("vocas")
    .find({ day: _day })
    .toArray((err, result) => {
      console.log(result);
      res.json(result);
    });
});

app.delete("/voca/:id", (req, res) => {
  console.log("=====", req.params.id);
  //res.send("delete");
  //db연결해서 지우기.....
  const _id = parseInt(req.params.id);
  db.collection("vocas").deleteOne({ id: _id }, (err, result) => {
    //console.log("====  지워졌습니다.");
    if (err) {
      console.log(err);
    } else {
      res.json({ delete: "ok" });
    }
  });
});
app.put("/voca/:id", (req, res) => {
  console.log("=====", req.params.id);
  //res.send("delete");
  //db연결해서 지우기.....
  const _id = parseInt(req.params.id);
  const _isDone = Boolean(req.body.isDone);

  console.log(_isDone);
  db.collection("vocas").updateOne({ id: _id }, { $set: { isDone: _isDone } }, (err, result) => {
    res.json({ update: "ok" });
  });
});

app.listen(PORT, () => {
  console.log(`${PORT}에서 서버 대기중`);
});
