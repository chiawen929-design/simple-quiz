// 工具：隨機洗牌
function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

// 依模式產生試題
function buildQuiz(bank, count, mode){
  const simple = bank.filter(q=>q.isSimple);
  const notSimple = bank.filter(q=>!q.isSimple);

  if(mode==='half'){
    const half = Math.floor(count/2);
    const extra = count - half;
    const pickA = shuffle(simple).slice(0, half);
    const pickB = shuffle(notSimple).slice(0, extra);
    return shuffle([...pickA, ...pickB]);
  }
  return shuffle(bank).slice(0, count);
}

// confetti（簡易表情版）
function boomConfetti(){
  const root = document.querySelector('.confetti');
  if(!root) return;
  const colors = ['🎀','💖','✨','🌸','💕','💗'];
  for(let i=0;i<40;i++){
    const p = document.createElement('div');
    p.className = 'p';
    p.style.left = Math.random()*100 + 'vw';
    p.style.top = '-5vh';
    p.style.fontSize = (14 + Math.random()*18) + 'px';
    p.style.animationDuration = (1.8 + Math.random()*1.2) + 's';
    p.textContent = colors[Math.floor(Math.random()*colors.length)];
    root.appendChild(p);
    setTimeout(()=>p.remove(), 2200);
  }
}

// 元件狀態
const $ = (sel) => document.querySelector(sel);
let quiz = [];
let idx = 0;
let score = 0;

function updateHUD(){
  const total = quiz.length;
  $('#counter').textContent = `第 ${idx+1}/${total} 題`;
  $('#scorePill').textContent = `得分 ${score}`;
  const percent = Math.round((idx)/total*100);
  $('#bar').style.width = percent + '%';
}

function renderQuestion(){
  const q = quiz[idx];
  $('#question').textContent = q.text;
  $('#feedback').textContent = '';
  $('#feedback').className = 'feedback';
  document.querySelectorAll('.choice').forEach(btn=>{
    btn.classList.remove('correct','wrong');
    btn.disabled = false;
  });
  updateHUD();
}

function finish(){
  $('#quiz').classList.add('hidden');
  $('#result').classList.remove('hidden');
  const total = quiz.length;
  const pct = Math.round(score/total*100);
  const title = pct===100 ? '🎉 全對！太厲害啦！' : (pct>=80 ? '🌟 很棒，繼續保持！' : '加油！再練習一下就更穩了！');
  $('#resultTitle').textContent = title;
  $('#resultMsg').textContent = `本次得分：${score}/${total}（${pct}%）`;

  // 儲存最佳成績
  const best = JSON.parse(localStorage.getItem('simpleQuizBest')||'null');
  const record = { score, total, pct, ts: Date.now() };
  if(!best || pct>best.pct){
    localStorage.setItem('simpleQuizBest', JSON.stringify(record));
  }
  updateBest();

  if(pct===100) boomConfetti();
}

function updateBest(){
  const best = JSON.parse(localStorage.getItem('simpleQuizBest')||'null');
  if(!best){
    $('#bestScore').textContent = '最佳成績：—';
    return;
  }
  $('#bestScore').textContent = `最佳成績：${best.score}/${best.total}（${best.pct}%）`;
}

function start(){
  $('#settings').classList.add('hidden');
  $('#result').classList.add('hidden');
  $('#quiz').classList.remove('hidden');
  idx = 0; score = 0;
  renderQuestion();
}

// 初始化
window.addEventListener('DOMContentLoaded', ()=>{
  // 題庫大小顯示
  $('#bankSize').textContent = `題庫：${QUESTION_BANK.length} 題`;
  updateBest();

  // 監聽開始
  $('#startBtn').addEventListener('click', ()=>{
    const count = parseInt($('#qCount').value,10);
    const mode = $('#shuffleMode').value;
    quiz = buildQuiz(QUESTION_BANK, count, mode);
    start();
  });

  // 選項按鈕
  document.querySelectorAll('.choice').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const choice = e.currentTarget.getAttribute('data-choice') === 'true';
      const correct = quiz[idx].isSimple === choice;
      const fb = $('#feedback');
      if(correct){
        e.currentTarget.classList.add('correct');
        fb.textContent = '✅ 答對了！';
        fb.className = 'feedback ok';
        score++;
      }else{
        e.currentTarget.classList.add('wrong');
        fb.textContent = '❌ 這題不是喔。';
        fb.className = 'feedback ng';
      }
      document.querySelectorAll('.choice').forEach(b=>b.disabled=true);
    });
  });

  // 下一題
  $('#nextBtn').addEventListener('click', ()=>{
    if(idx < quiz.length-1){
      idx++;
      renderQuestion();
    }else{
      // 結束
      $('#bar').style.width = '100%';
      finish();
    }
  });

  // 再考一次、返回設定
  $('#retryBtn').addEventListener('click', ()=>{
    start();
  });
  $('#backBtn').addEventListener('click', ()=>{
    $('#quiz').classList.add('hidden');
    $('#result').classList.add('hidden');
    $('#settings').classList.remove('hidden');
  });
});
