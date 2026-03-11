const express = require("express")
const axios = require("axios")

const app = express()
const PORT = process.env.PORT || 3000

const headers = {
  "User-Agent": "Mozilla/5.0",
  "Referer": "https://regionales.saohgdasregions.fun/",
  "Origin": "https://regionales.saohgdasregions.fun"
}

async function extractM3U8(url){

    try{

        const res = await axios.get(url,{
            timeout:10000,
            headers
        })

        const html = res.data

        const match = html.match(/https?:\/\/[^"' ]+\.m3u8[^"' ]*/)

        if(match){
            return match[0]
        }

        return null

    }catch(e){
        console.log("extract error:",e.message)
        return null
    }

}

async function getStream(canal,target,regional,deportes){

    if(canal){
        return await extractM3U8(
        `https://regionales.saohgdasregions.fun/stream.php?canal=${canal}&target=${target||3}`)
    }

    if(regional){
        return await extractM3U8(
        `https://regionales.saohgdasregions.fun/tvporinternet3.php?stream=${regional}_`)
    }

    if(deportes){
        return await extractM3U8(
        `https://deportes.ksdjugfsddeports.com/tvporinternet3.php?stream=${deportes}_`)
    }

    return null
}

app.get("/",(req,res)=>{
res.send("Servidor IPTV funcionando")
})

app.get("/play", async (req,res)=>{

    const {canal,target,regional,deportes} = req.query

    const m3u8 = await getStream(canal,target,regional,deportes)

    if(!m3u8){
        res.status(404).send("stream no encontrado")
        return
    }

    try{

        const playlist = await axios.get(m3u8,{
            headers
        })

        const base = m3u8.split("/").slice(0,-1).join("/")

        res.setHeader("Content-Type","application/vnd.apple.mpegurl")

        playlist.data.split("\n").forEach(line=>{

            if(line.startsWith("#") || line.trim()==""){
                res.write(line+"\n")
                return
            }

            if(!line.startsWith("http")){
                line = base+"/"+line
            }

            res.write(line+"\n")

        })

        res.end()

    }catch(e){

        console.log("playlist error:",e.message)
        res.send("error cargando playlist")

    }

})

app.listen(PORT,()=>{
console.log("server running on "+PORT)
})
app.listen(PORT,()=>{
console.log("server running on "+PORT)
})
