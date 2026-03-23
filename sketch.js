//n年前の今日生まれたボカロ曲(30万回再生以上)を自動で表示

let table;
let table2;
let a,b,c,dd,e;
let mon,da;

function preload() {
    table = loadTable('vocaloid_data.csv', 'csv', 'header');
}


function setup() {
  //今日が誕生日の曲を表示する
  mon=month();
  da=day();
  vocaloidbirthday(mon,da);
  noStroke();
  
  var selectm = document.getElementById("selectMonth");
  selectm.options[mon].selected = true;
  var selectd = document.getElementById("selectDay");
  selectd.options[da].selected = true;
}


//ハンバーガーメニュー
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
hamburger.addEventListener('click', () => {
  nav.classList.toggle('active');
});


//セレクトボックスを変更したときの処理
var select = document.getElementById('selectMonth');
select.onchange = function(){
  mon=this.value;
  clear();
  vocaloidbirthday(mon,da);
}

var select = document.getElementById('selectDay');
select.onchange = function(){
  da=this.value;
  clear();
  vocaloidbirthday(mon,da);
}



//m月d日が誕生日の曲を表示
function vocaloidbirthday(m,d){
  
  
  //m月d日の曲を抽出
  let song = [];
  for(let i=0;i<3585;i++){
    let ja=true;
    let jadge = table.getString(i, 3);
    if(10*int(jadge[5])+int(jadge[6])==m && 10*int(jadge[8])+int(jadge[9])==d){
      
      //ニコカラを除外
      let jad2 = table.getString(i, 0);
      for(let j=0;j<jad2.length-3;j++){
        if(jad2[j]=='ニ'&&jad2[j+1]=='コ'&&jad2[j+2]=='カ'&&jad2[j+3]=='ラ'){
          ja=false;
        }
      }
      
      if(ja)song.push(i);
    }
  }
  
  createCanvas(windowWidth, 70+20*song.length);
  
  
  //抽出した曲のsm番号とタイトルを取得
  var sm = [];
  console.log(song.length);
  for(let i=0;i<20;i++){ 
    if(song.length==0) text("serching...",20,67);
    if(i<song.length){
      text(table.getString(song[i], 0),20,70+20*i);
      sm[i] = table.getString(song[i], 1);
      console.log(sm[i]);
    }
      
    
    //htmlに渡すニコ動のリンクボックスを作成
    var mov = [];
      if(i==0){
        mov[i] = document.getElementById("id1");
      }else if(i==1){
        mov[i] = document.getElementById("id2");
      }else if(i==2){
        mov[i] = document.getElementById("id3");
      }else if(i==3){
        mov[i] = document.getElementById("id4");
      }else if(i==4){
        mov[i] = document.getElementById("id5");
      }else if(i==5){
        mov[i] = document.getElementById("id6");
      }else if(i==6){
        mov[i] = document.getElementById("id7");
      }else if(i==7){
        mov[i] = document.getElementById("id8");
      }else if(i==8){
        mov[i] = document.getElementById("id9");
      }else if(i==9){
        mov[i] = document.getElementById("id10");
      }else if(i==10){
        mov[i] = document.getElementById("id11");
      }else if(i==11){
        mov[i] = document.getElementById("id12");
      }else if(i==12){
        mov[i] = document.getElementById("id13");
      }else if(i==13){
        mov[i] = document.getElementById("id14");
      }else if(i==14){
        mov[i] = document.getElementById("id15");
      }else if(i==15){
        mov[i] = document.getElementById("id16");
      }else if(i==16){
        mov[i] = document.getElementById("id17");
      }else if(i==17){
        mov[i] = document.getElementById("id18");
      }else if(i==18){
        mov[i] = document.getElementById("id19");
      }else if(i==19){
        mov[i] = document.getElementById("id20");
      }
    
    
      
    if(i<song.length){
      mov[i].innerHTML = `<iframe width="371" height="220" src="https://ext.nicovideo.jp/thumb/${sm[i]}" scrolling="no" ></iframe>`;
    }else{
      mov[i].innerHTML=" ";
    }
  }
}
