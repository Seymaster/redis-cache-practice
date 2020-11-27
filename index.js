const express = require("express");
const redis = require("redis");
const fetch = require("node-fetch");

const PORT = process.env.PORT || 8080;
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const client = redis.createClient(REDIS_PORT);

const app = express();

// Fetch repo from github
async function getRepos(req,res,next){
    try {
        console.log("fetching data....")
        const { username } = req.params
        const response = await fetch(`https://api.github.com/users/${username}`)
        let data = await response.json()
        res.send(data)
    } catch (err) {
        console.error(err)
        res.status(500)
    }
}
app.get("/repos/:username", getRepos);

app.listen(PORT, ()=>{
    console.log(`app is listening on port ${PORT}`);
});
