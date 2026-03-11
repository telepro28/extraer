const express = require("express")
const axios = require("axios")

const app = express()
const PORT = process.env.PORT || 3000

async function decodeEmbed(url){

    try{

        const res = await axios.get(url,{timeout:10000})

        const html = res.data

        const match = html.match(/atob\(atob\(atob\(atob\("([^"]+)/)

        if(!match) return null

        let stream = match[1]

        for(let i=0;i<4;i++){
            stream = Buffer.from(stream,'base64').toString('utf8')
        }

        return stream

    }catch(e){
        return null
    }

}

async function getStream(canal,target,regional,deportes){

    if(canal){

        const embed = `https://regionales.saohgdasregions.fun/stream.php?canal=${canal}&target=${target||3}`

        const res = await axios.get(embed)

        const match = res.data.match(/(https?:\/\/[^"' ]+\.m3u8[^"' ]*)/)

        if(match) return match[1]

    }

    if(regional){
        return await decodeEmbed(`https://regionales.saohgdasregions.fun/tvporinternet3.php?stream=${regional}_`)
    }

    if(deportes){
        return await decodeEmbed(`https://deportes.ksdjugfsddeports.com/tvporinternet3.php?stream=${deportes}_`)
    }

    return null
}

app.get("/",(req,res)=>{
res.send("Servidor IPTV híbrido funcionando")
})

app.get("/play", async (req,res)=>{

    const canal = req.query.canal
    const target = req.query.target
    const regional = req.query.regional
    const deportes = req.query.deportes

    const m3u8 = await getStream(canal,target,regional,deportes)

    if(!m3u8){
        res.send("stream no encontrado")
        return
    }

    try{

        const playlist = await axios.get(m3u8,{
            headers:{
                "User-Agent":"Mozilla/5.0"
            }
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
        res.send("error cargando playlist")
    }

})

app.listen(PORT,()=>{
console.log("server running on "+PORT)
})
