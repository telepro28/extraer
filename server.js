const express = require("express")
const axios = require("axios")
const http = require("http")
const https = require("https")

const app = express()
const PORT = process.env.PORT || 3000

const headersDeportes = {
  Referer:"https://deportes.ksdjugfsddeports.com/",
  Origin:"https://deportes.ksdjugfsddeports.com",
  "User-Agent":"Mozilla/5.0"
}

const headersRegional = {
  Referer:"https://regionales.saohgdasregions.fun/",
  Origin:"https://regionales.saohgdasregions.fun",
  "User-Agent":"Mozilla/5.0"
}

let streamCache={}
let playlistCache={}

function decodeBase64(str){
 let r=str
 for(let i=0;i<4;i++){
  r=Buffer.from(r,"base64").toString("utf8")
 }
 return r
}

async function getStream(id,type){

 const key=type+"_"+id
 const now=Date.now()

 if(streamCache[key] && now-streamCache[key].time<60000){
  return streamCache[key].url
 }

 let embed
 let headers

 if(type==="regional"){
  embed=`https://regionales.saohgdasregions.fun/tvporinternet3.php?stream=${id}_`
  headers=headersRegional
 }else{
  embed=`https://deportes.ksdjugfsddeports.com/tvporinternet3.php?stream=${id}_`
  headers=headersDeportes
 }

 try{

  const res=await axios.get(embed,{headers})

  const match=res.data.match(/atob\(atob\(atob\(atob\("([^"]+)/)

  if(!match) return null

  const decoded=decodeBase64(match[1])

  streamCache[key]={url:decoded,time:now}

  return decoded

 }catch(e){
  console.log("stream error",e.message)
  return null
 }

}

async function getPlaylist(id,type){

 const key=type+"_"+id
 const now=Date.now()

 if(playlistCache[key] && now-playlistCache[key].time<5000){
  return playlistCache[key].data
 }

 const stream=await getStream(id,type)
 if(!stream) return null

 const headers=type==="regional"?headersRegional:headersDeportes

 try{

  const res=await axios.get(stream,{headers})

  playlistCache[key]={data:res.data,time:now}

  return res.data

 }catch(e){
  console.log("playlist error",e.message)
  return null
 }

}

app.get("/play",async(req,res)=>{

 const regional=req.query.regional
 const deportes=req.query.deportes

 let id
 let type

 if(regional){
  id=regional
  type="regional"
 }else{
  id=deportes||5
  type="deportes"
 }

 const m3u8=await getStream(id,type)
 if(!m3u8){
  res.send("stream no encontrado")
  return
 }

 const playlist=await getPlaylist(id,type)
 if(!playlist){
  res.send("playlist error")
  return
 }

 const base=m3u8.split("/").slice(0,-1).join("/")

 res.setHeader("Content-Type","application/vnd.apple.mpegurl")

 playlist.split("\n").forEach(line=>{

  if(line.startsWith("#")||line.trim()==""){
   res.write(line+"\n")
   return
  }

  if(!line.startsWith("http")){
   line=base+"/"+line
  }

  res.write(`/segment?url=${encodeURIComponent(line)}\n`)

 })

 res.end()

})

app.get("/segment",(req,res)=>{

 const url=req.query.url

 if(!url){
  res.send("no url")
  return
 }

 const client=url.startsWith("https")?https:http

 client.get(url,{
  headers:{
   "User-Agent":"Mozilla/5.0"
  }
 },stream=>{

  res.setHeader("Content-Type","video/mp2t")
  stream.pipe(res)

 }).on("error",()=>res.end())

})

app.listen(PORT,()=>{
 console.log("proxy funcionando en "+PORT)
})
