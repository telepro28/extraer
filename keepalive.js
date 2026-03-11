const axios = require("axios")

const url = "https://nada-pi2z.onrender.com"

setInterval(async () => {

  try {

    const res = await axios.get(url)

    console.log("Ping OK:", res.status)

  } catch (err) {

    console.log("Ping error:", err.message)

  }

}, 2 * 60 * 1000) // cada 2 minutos
