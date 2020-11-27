const express = require("express");
const redis = require("redis");
const fetch = require("node-fetch");

const PORT = process.env.PORT || 8080;
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const client = redis.createClient(REDIS_PORT);

const app = express();

function setResponse(username, repos){
    return `<h2>${username} has ${repos} public repositories</h2>`
}
// Fetch repo from github
async function getRepos(req,res,next){
    try {
        console.log("fetching data....")
        const { username } = req.params
        const response = await fetch(`https://api.github.com/users/${username}`)
        let data = await response.json()
        const repos = data.public_repos
// set data to Redis
        client.setex(username, 2400, repos)

        res.send(setResponse(username, repos))
    } catch (err) {
        console.error(err)
        res.status(500)
    }
}

function cache(req,res,next){
    const { username } = req.params;

    client.get(username, (err, data)=>{
        if (err) throw err;

        if (data !== null){
            res.send(setResponse(username, data))
        } else{
            next();
        }
    })
};

app.get("/repos/:username", cache ,getRepos);

app.listen(PORT, ()=>{
    console.log(`app is listening on port ${PORT}`);
});
