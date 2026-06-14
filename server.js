
const express=require('express');
const cors=require('cors');
const path=require('path');
const app=express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));

const rooms={};
const code=()=>Math.random().toString(36).slice(2,7).toUpperCase();

app.post('/create-room',(req,res)=>{
 const c=code();
 rooms[c]={phase:'lobby',turn:1,players:[],votes:{},actions:{},results:''};
 res.json({roomCode:c});
});

app.post('/join-room',(req,res)=>{
 const room=rooms[req.body.roomCode];
 if(!room) return res.status(404).json({error:'Room not found'});
 const p={id:Date.now()+Math.random()+'',name:req.body.name,alive:true,role:null};
 room.players.push(p);
 res.json(p);
});

app.post('/start-game',(req,res)=>{
 const room=rooms[req.body.roomCode];
 if(!room) return res.sendStatus(404);
 let roles=['Mafia','Nurse','Butcher'];
 while(roles.length<room.players.length) roles.push('Innocent');
 roles.sort(()=>Math.random()-0.5);
 room.players.forEach((p,i)=>p.role=roles[i]);
 room.phase='night';
 res.json({ok:true});
});

app.post('/action',(req,res)=>{
 const room=rooms[req.body.roomCode];
 room.actions[req.body.playerId]=req.body;
 res.json({ok:true});
});

app.post('/vote',(req,res)=>{
 const room=rooms[req.body.roomCode];
 room.votes[req.body.playerId]=req.body.target;
 res.json({ok:true});
});

app.post('/resolve-night',(req,res)=>{
 const room=rooms[req.body.roomCode];
 let kill=null,protect=null;
 Object.values(room.actions).forEach(a=>{
  if(a.type==='kill') kill=a.target;
  if(a.type==='protect') protect=a.target;
 });
 if(kill && kill!==protect){
   const p=room.players.find(x=>x.id===kill);
   if(p) p.alive=false;
   room.results=p ? p.name+' died' : 'Nobody died';
 } else room.results='Nobody died';
 room.actions={};
 room.phase='voting';
 res.json({ok:true});
});

app.post('/resolve-vote',(req,res)=>{
 const room=rooms[req.body.roomCode];
 const counts={};
 Object.values(room.votes).forEach(v=>counts[v]=(counts[v]||0)+1);
 let winner=null,max=0;
 for(const k in counts){ if(counts[k]>max){max=counts[k];winner=k;} }
 if(winner){
   const p=room.players.find(x=>x.id===winner);
   if(p){
      p.alive=false;
      room.results='Voted out: '+p.name;
      if(p.role==='Butcher') room.phase='butcherWin';
      else room.phase='night';
   }
 }
 room.votes={};
 room.turn++;
 res.json({ok:true});
});

app.get('/room/:code',(req,res)=>{
 const room=rooms[req.params.code];
 if(!room) return res.sendStatus(404);
 res.json(room);
});

app.listen(process.env.PORT||3000);
