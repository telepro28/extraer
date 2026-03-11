<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>IPTV Panel</title>

<style>

body{
margin:0;
background:#000;
font-family:Arial;
overflow:hidden;
}

/* reproductor */

#player{
position:absolute;
top:0;
left:0;
width:100%;
height:100%;
border:none;
}

/* botón menú */

#menuBtn{
position:fixed;
top:20px;
right:20px;
width:55px;
height:55px;
border-radius:50%;
background:#ff0033;
color:white;
display:flex;
align-items:center;
justify-content:center;
font-size:22px;
cursor:pointer;
z-index:999;
box-shadow:0 0 20px #ff0033;
}

/* menú */

#menu{
position:fixed;
right:-200px;
top:0;
width:200px;
height:100%;
background:rgba(0,0,0,0.9);
backdrop-filter:blur(10px);
transition:0.4s;
padding-top:80px;
display:flex;
flex-direction:column;
gap:12px;
z-index:998;
}

#menu.show{
right:0;
}

/* botones canal */

.channel{
margin:0 20px;
padding:12px;
border-radius:30px;
background:#111;
color:white;
text-align:center;
cursor:pointer;
transition:0.25s;
}

.channel:hover{
background:#ff0033;
transform:scale(1.05);
}

.active{
background:#ff0033;
box-shadow:0 0 10px #ff0033;
}

</style>
</head>

<body>

<iframe id="player"></iframe>

<div id="menuBtn">☰</div>

<div id="menu">

<div class="channel active" onclick="play(1)">Canal 1</div>
<div class="channel" onclick="play(2)">Canal 2</div>
<div class="channel" onclick="play(3)">Canal 3</div>
<div class="channel" onclick="play(4)">Canal 4</div>
<div class="channel" onclick="play(5)">Canal 5</div>
<div class="channel" onclick="play(6)">Canal 6</div>
<div class="channel" onclick="play(7)">Canal 7</div>
<div class="channel" onclick="play(8)">Canal 8</div>
<div class="channel" onclick="play(9)">Canal 9</div>

</div>

<script>

const base = "https://nada-pi2z.onrender.com/play"

const player = document.getElementById("player")

player.src = base + "?deportes=1"

/* cambiar canal */

function play(n){

document.querySelectorAll(".channel").forEach(el=>el.classList.remove("active"))

event.target.classList.add("active")

player.src = base + "?deportes=" + n

}

/* menú */

const menu = document.getElementById("menu")

document.getElementById("menuBtn").onclick = () =>{
menu.classList.toggle("show")
}

</script>

</body>
</html>
