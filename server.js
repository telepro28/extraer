const express = require("express")
const axios = require("axios")

const app = express()
const PORT = process.env.PORT || 3000

const headersDeportes = {
  "Referer":"https://deportes.ksdjugfsddeports.com/",
  "Origin":"https://deportes.ksdjugfsddeports.com",
  "User-Agent":"Mozilla/5.0"
}

const headersRegional = {
  "Referer":"https://regionales.saohgdasregions.fun/",
  "Origin":"https://regionales.saohgdasregions.fun",
  "User-Agent":"Mozilla/5.0"
}

let streamCache = {}

function decodeBase64(str){
  let result = str
  for(let i=0;i<4;i++){
    result = Buffer.from(result,"base64").toString("utf8")
  }
  return result
}

async function getStream(id,type){

  const key = type+"_"+id

  if(streamCache[key]){
    return streamCache[key]
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

  const res = await axios.get(embed,{headers})

  const match=res.data.match(/atob\(atob\(atob\(atob\("([^"]+)/)

  if(!match) return null

  const decoded=decodeBase64(match[1])

  streamCache[key]=decoded

  return decoded
}

app.get("/",(req,res)=>{
res.send("proxy hibrido activo")
})

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

  const headers=type==="regional"?headersRegional:headersDeportes

  const playlist=await axios.get(m3u8,{headers})

  const base=m3u8.split("/").slice(0,-1).join("/")

  res.setHeader("Content-Type","application/vnd.apple.mpegurl")

  playlist.data.split("\n").forEach(line=>{

    if(line.startsWith("#") || line.trim()==""){
      res.write(line+"\n")
      return
    }

    if(!line.startsWith("http")){
      line=base+"/"+line
    }

    res.write(line+"\n")

  })

  res.end()

})

app.listen(PORT,()=>{
console.log("proxy hibrido corriendo en "+PORT)
})
