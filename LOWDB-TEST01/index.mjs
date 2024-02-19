import {LowSync} from "lowdb";
import {JSONFileSync} from "lowdb/node";
import {v4 as uuidv4} from "uuid";
const defaultData = {user:{}, products: []};
const db = new LowSync(new JSONFileSync("db.json"), defaultData);
db.read();

// api/products/1da1199f-6882-491a-9070-605eee50d34a
// let data = db.data.products.find((p) => { return p.id === "1da1199f-6882-491a-9070-605eee50d34a"});

// api/products/search?key=瓜
//let data = db.data.products.find((p) => {return p.title.includes("瓜")});
// let data = db.data.products.filter((p) => {return p.title.includes("瓜")});

// api/products/?page=1
// let page = 2;
// let limit = 5;
// let start = (page - 1) * limit;
// let end = page * limit;
// let data = db.data.products.slice(start, end);

// api/products/?page=1&sort=desc
// let page = 1;
// let limit = 5;
// let start = (page - 1) * limit;
// let end = page * limit;
// let data = 
// db.data.products.sort((a,b) => b.price - a.price).slice(start, end);

// console.log(data);

//PUT api/products/92f2e384-c3f7-49ec-bec1-dac343a277ff
// db.data.products
//     .find(p => p.id === "92f2e384-c3f7-49ec-bec1-dac343a277ff")
//     .stock = 35;
// db.write();

//DELETE api/products/bf820195-e2b6-475e-abd1-027929bd30ed
// db.data.products =
//     db.data.products.filter(p => p.id !== "bf820195-e2b6-475e-abd1-027929bd30ed")
// db.write();

// api/products
// console.log(db.data.products);

//push, unshift
// db.data.products.push({
//     id: uuidv4(),
//     title: "小黃瓜",
//     price: 30,
//     stock: 100,
//     createDate: Date.now()
// });

// let id = uuidv4();
// db.data.user[id] = {
//     id: id,
//     account: "ben",
//     password: "a1234",
//     name: "Ben Chen"
// }

// db.write();