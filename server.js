async function getStream(id,type){

  const key = type + "_" + id
  const now = Date.now()

  if(streamCache[key] && now - streamCache[key].time < 60000){
    return streamCache[key].url
  }

  try{

    let embed
    let customHeaders

    if(type === "regional"){

      embed =
      `https://regionales.saohgdasregions.fun/tvporinternet3.php?stream=${id}_`

      customHeaders = {
        "Referer":"https://regionales.saohgdasregions.fun/",
        "Origin":"https://regionales.saohgdasregions.fun",
        "User-Agent":"Mozilla/5.0"
      }

    }else{

      embed =
      `https://deportes.ksdjugfsddeports.com/tvporinternet3.php?stream=${id}_`

      customHeaders = {
        "Referer":"https://deportes.ksdjugfsddeports.com/",
        "Origin":"https://deportes.ksdjugfsddeports.com",
        "User-Agent":"Mozilla/5.0"
      }

    }

    const res = await axios.get(embed,{
      headers:customHeaders,
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
