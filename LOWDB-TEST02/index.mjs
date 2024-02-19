import express from "express";
import multer from "multer";
const upload = multer();
import moment from "moment";
import cors from "cors";
import jwt from "jsonwebtoken";
const secretKey = process.argv[2];
const blackListedToken = [];
import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";
import { v4 as uuidv4 } from 'uuid';
const defaultData = { products: [], user: [] };
const db = new LowSync(new JSONFileSync('db.json'),defaultData);
db.read();

let whitelist = ["http://localhost:5500", "http://localhost:3000", undefined];
let corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
const app = express();
app.use(cors(corsOptions));

app.get("/", (req, res)=>{
    res.send("首頁");
});

app.post("/api/users/login", upload.none() ,async (req, res) => {
    let user, error;
    await userLogin(req).then(result => {
        user = result;
    }).catch(err => {
        error = err;
    });
    if(error){
        res.status(400).json(error);
        return false;
    }
    if(user){
        const token = jwt.sign({
            account: user.account,
            username: user.username,
            head: user.head
        }, secretKey, {expiresIn: "30m"});
        res.status(200).json({
            message: "Login successful",
            token
        });
    }
    // res.send(`使用者登錄 ${account} ${password}`);
});

app.post("/api/users/logout", checkToken, (req, res) => {
    // res.send("使用者登出");
    let token = req.get("Authorization");
  
    if (token && token.indexOf("Bearer ") === 0) {
      token = token.slice(7);
    }
    blackListedToken.push(token);
    token = jwt.sign({
        account: "",
        username: "",
        head: ""
    }, secretKey, {expiresIn: "-10s"});
    res.status(200).json({
        message: "Logout successful",
        token
    });
});

app.get("/api/users/search", async (req, res) => {
    // res.send(`搜尋使用者 ${id}`);
    let user, error;
    await userSearch(req).then(result => {
        user = result;
    }).catch(err => {
        error = err;
    });
    if(error){
        res.status(400).json(error);
        return false;
    }
    if(user){
        res.status(200).json(user);
    }
});

app.get("/api/users/:id", async(req, res) => {
    // res.send("讀取單一使用者");
    let user, error;
    await userSingle(req).then(result => {
        user = result;
    }).catch(err => {
        error = err;
    });
    if(error){
        res.status(404).json(error);
        return false;
    }
    if(user){
        res.status(200).json(user);
    }
});

app.get("/api/users/", checkToken, async(req, res) => {
    let user, error;
    await userAll(req).then(result => {
        user = result;
    }).catch(err => {
        error = err;
    });
    if(error){
        res.status(400).json(error);
        return false;
    }
    if(user){
        res.status(200).json(user);
    }
    // res.send("讀取所有使用者");
});

app.post("/api/users/", upload.none() ,async(req, res) => {
    // res.send(`新增單一使用者 ${account} ${mail}`);
    let user, error;
    await userSignUp(req).then(result => {
        user = result;
    }).catch(err => {
        error = err;
    });
    if(error){
        res.status(409).json(error);
        return false;
    }
    if(user){
        res.status(200).json({user, msg: "註冊成功"});
    }
});

app.put("/api/users/:id", checkToken, upload.none(), async(req, res) => {
    // res.send(`修改單一使用者 ${account} ${mail}`);
    let user, error;
    await userUpdate(req).then(result => {
        user = result;
    }).catch(err => {
        error = err;
    });
    if(error){
        res.status(400).json(error);
        return false;
    }
    if(user){
        let token = req.get("Authorization");
  
        if (token && token.indexOf("Bearer ") === 0) {
          token = token.slice(7);
        }
        blackListedToken.push(token);
        token = jwt.sign({
            account: "",
            username: "",
            head: ""
        }, secretKey, {expiresIn: "-10s"});
        res.status(200).json({
            message: "修改成功 請重新登入",
            token
        });
    }
});

app.delete("/api/users/:id", async(req, res) => {
    // res.send(`刪除單一使用者 ${id}`);
    let user, error;
    await userDel(req).then(result => {
        user = result;
    }).catch(err => {
        error = err;
    });
    if(error){
        res.status(404).json(error);
        return false;
    }
    if(user){
        let token = req.get("Authorization");
  
        if (token && token.indexOf("Bearer ") === 0) {
          token = token.slice(7);
        }
        blackListedToken.push(token);
        token = jwt.sign({
            account: "",
            username: "",
            head: ""
        }, secretKey, {expiresIn: "-10s"});
        res.status(200).json({
            message: "刪除成功~ 再!見！！！",
            token
        });
    }
});


app.listen(3000, ()=>{
    console.log("server is running");
});

function userDel(req){
    return new Promise((resolve, reject) => {
        const {account} = req.decoded;
        let user = db.data.user.find(u => u.account === account);
        if(user){
            db.data.user = db.data.user.filter(u => u.account !== account);
            db.write();
            resolve(user)
        }else{
            reject({error: "找不到使用者"})
        }
    });
}

function userUpdate(req){
    return new Promise((resolve, reject) => {
        const {account: tokenAccount} = req.decoded;
        const {account, password, name, head} = req.body;
        if(tokenAccount !== account){
            reject({error: "沒有修改權限"});
            return false;
        }
        let user = db.data.user.find(u => u.account === account);
        Object.assign(user, {password, name, head});
        db.write();
        resolve(user);
    });
}

function userSignUp(req){
    return new Promise((resolve, reject) => {
        const {account, password, name, mail, head} = req.body;
        // 檢查account 有無被使用過
        let result = db.data.user.find(u => u.account === account);
        if(result){
            reject({error: "帳號已被使用"});
            return false;
        }
        // 檢查mail 有無被使用過
        result = db.data.user.find(u => u.mail === mail);
        if(result){
            reject({error: "信箱已被使用"});
            return false;
        }
        let id = uuidv4();
        db.data.user.push({id, account, password, name, mail, head});
        db.write();
        resolve(user);
    });
}

function userAll(req){
    return new Promise((resolve, reject) => {
        resolve(db.data.user);
    });
};

function userSingle(req){
    return new Promise((resolve, reject) => {
        const id = req.params.id;
        let result = db.data.user.find(u => u.id === id);
        if(result){
            resolve(result);
        }else{
            reject({status: "error", msg: "找不到符合的使用者"})
        }
    });
}

function userSearch(req){
    return new Promise((resolve, reject) => {
        const key = req.query.key;
        let result = db.data.user.find(u => u.account === key);
        if(result){
            resolve(result);
        }else{
            reject({status: "error", msg: "找不到符合的內容"})
        }
    });
}

function userLogin(req){
    return new Promise((resolve, reject) => {
        const {account, password} = req.body;
        let result = db.data.user.find(u => u.account === account && u.password === password);
        if(result){
            resolve(result);
        }else{
            reject({status: "error", msg: "Invalid username or password"})
        }
    });
}

function checkToken(req, res, next) {
    let token = req.get("Authorization");
  
    if (token && token.indexOf("Bearer ") === 0) {
      token = token.slice(7);
      if(blackListedToken.includes(token)){
        res.status(401).json({error: "token過期"});
        return false;
      }
      jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
          return res
            .status(401)
            .json({ status: "error", message: "登入驗證失效，請重新登入。" });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      return res
        .status(401)
        .json({ status: "error", message: "無登入驗證資料，請重新登入。" });
    }
  }