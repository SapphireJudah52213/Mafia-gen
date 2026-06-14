
let roomCode='',playerId='';
async function createRoom(){let r=await fetch('/create-room',{method:'POST'});let d=await r.json();roomCode=d.roomCode;status.textContent='Room '+roomCode;}
async function joinRoom(){roomCode=document.getElementById('roomCode').value||roomCode;let r=await fetch('/join-room',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({roomCode,name:name.value})});let d=await r.json();playerId=d.id;}
async function startGame(){await fetch('/start-game',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({roomCode})});}
async function refresh(){if(!roomCode)return;let r=await fetch('/room/'+roomCode);if(!r.ok)return;let room=await r.json();game.innerHTML='<h3>Phase:'+room.phase+'</h3><h3>Turn:'+room.turn+'</h3>'+room.players.map((p,i)=>'<div>Player '+(i+1)+' - '+p.name+' '+(p.alive?'':'(Dead)')+'</div>').join('');}
setInterval(refresh,1000);
