const express = require("express")
const axios = require("axios")
const http = require("http")
const https = require("https")

const app = express()
const PORT = process.env.PORT || 3000

const headers = {
  "Referer":"https://deportes.ksdjugfsddeports.com/",
  "Origin":"https://deportes.ksdjugfsddeports.com",
  "User-Agent":"Mozilla/5.0"
}

let streamCache = {}
let playlistCache = {}

function decodeBase64(str){
  let result = str
  for(let i=0;i<4;i++){
    result = Buffer.from(result,"base64").toString("utf8")
  }
  return result
}

async function getStream(id,type){

  const key = type + "_" + id
  const now = Date.now()

  if(streamCache[key] && now - streamCache[key].time < 60000){
    return streamCache[key].url
  }

  try{

    let embed

    if(type === "regional"){
      embed =
      `https://regionales.saohgdasregions.fun/tvporinternet3.php?stream=${id}_`
    }else{
      embed =
      `https://deportes.ksdjugfsddeports.com/tvporinternet3.php?stream=${id}_`
    }

    const res = await axios.get(embed,{
      headers,
      timeout:10000
    })

    const match = res.data.match(/atob\(atob\(atob\(atob\("([^"]+)/)

    if(!match) return null

    const decoded = decodeBase64(match[1])

    streamCache[key] = {
      url: decoded,
      time: now
    }

    return decoded

  }catch(err){

    console.log("stream error:",err.message)
    return null

  }

}

async function getPlaylist(id,type){

  const key = type + "_" + id
  const now = Date.now()

  if(
    playlistCache[key] &&
    now - playlistCache[key].time < 5000
  ){
    return playlistCache[key].data
  }

  const stream = await getStream(id,type)

  if(!stream) return null

  try{

    const res = await axios.get(stream,{
      headers,
      timeout:10000
    })

    playlistCache[key] = {
      data: res.data,
      time: now
    }

    return res.data

  }catch(err){

    console.log("playlist error:",err.message)
    return null

  }

}

app.get("/",(req,res)=>{
res.send("IPTV proxy activo")
})

app.get("/play", async (req,res)=>{

  const deportes = req.query.deportes
  const regional = req.query.regional

  let id
  let type

  if(regional){
    id = regional
    type = "regional"
  }else{
    id = deportes || 5
    type = "deportes"
  }

  const m3u8 = await getStream(id,type)

  if(!m3u8){
    res.status(404).send("stream no encontrado")
    return
  }

  const playlist = await getPlaylist(id,type)

  if(!playlist){
    res.status(500).send("playlist error")
    return
  }

  const base = m3u8.split("/").slice(0,-1).join("/")

  res.setHeader("Content-Type","application/vnd.apple.mpegurl")

  playlist.split("\n").forEach(line=>{

    if(line.startsWith("#") || line.trim()==""){
      res.write(line+"\n")
      return
    }

    if(!line.startsWith("http")){
      line = base+"/"+line
    }

    const proxy = `/segment?url=${encodeURIComponent(line)}`

    res.write(proxy+"\n")

  })

  res.end()

})

app.get("/segment",(req,res)=>{

  const url = req.query.url

  if(!url){
    res.status(400).send("no url")
    return
  }

  const client = url.startsWith("https") ? https : http

  client.get(url,{headers},stream=>{

    res.setHeader("Content-Type","video/mp2t")

    stream.pipe(res)

  }).on("error",err=>{

    console.log("segment error:",err.message)
    res.end()

  })

})

app.listen(PORT,()=>{
console.log("proxy estable corriendo en fa"+PORT)
})
