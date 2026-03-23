// ボカロ曲の誕生日 — n年前の今日生まれたボカロ曲（30万再生以上）を表示
// p5.js の loadTable を使いつつ、DOM描画はネイティブJSで行う

let table = null;
let currentMonth = null;
let currentDay = null;

// p5.js の preload でCSVを読み込む
function preload() {
  table = loadTable('vocaloid_data.csv', 'csv');
}

function setup() {
  noCanvas(); // p5.js の Canvas は不要

  // 今日の日付をセット
  const today = new Date();
  currentMonth = today.getMonth() + 1;
  currentDay = today.getDate();

  // セレクトボックスの初期値を今日にセット
  setSelectValue('selectMonth', currentMonth);
  setSelectValue('selectDay', currentDay);

  // 初回表示
  vocaloidbirthday(currentMonth, currentDay);

  // セレクトボックスのイベント
  document.getElementById('selectMonth').addEventListener('change', function () {
    currentMonth = parseInt(this.value) || null;
    vocaloidbirthday(currentMonth, currentDay);
  });
  document.getElementById('selectDay').addEventListener('change', function () {
    currentDay = parseInt(this.value) || null;
    vocaloidbirthday(currentMonth, currentDay);
  });

  // ハンバーガーメニュー
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  hamburger.addEventListener('click', () => nav.classList.toggle('active'));
  hamburger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') nav.classList.toggle('active');
  });
}

// セレクトボックスに値をセット
function setSelectValue(id, value) {
  const sel = document.getElementById(id);
  for (let i = 0; i < sel.options.length; i++) {
    if (parseInt(sel.options[i].value) === value) {
      sel.selectedIndex = i;
      break;
    }
  }
}

// m月d日が誕生日の曲を表示
function vocaloidbirthday(m, d) {
  if (!m || !d || !table) return;

  const songListEl = document.getElementById('song-list');
  const headingEl  = document.getElementById('date-heading');
  const noResults  = document.getElementById('no-results');
  const loading    = document.getElementById('loading');

  // 前の結果をクリア
  songListEl.innerHTML = '';
  noResults.style.display = 'none';
  loading.style.display = 'flex';

  // 非同期っぽく見せるために少し遅延
  setTimeout(() => {
    const rowCount = table.getRowCount();
    const songs = [];

    for (let i = 0; i < rowCount; i++) {
      const dateStr = table.getString(i, 3).trim(); // 例: 2011-09-17T19:00:28+09:00
      const title   = table.getString(i, 0).trim();
      const smId    = table.getString(i, 1).trim();

      // 日付パース: "YYYY-MM-DD" 部分だけ見る
      const datePart = dateStr.substring(0, 10); // "2011-09-17"
      const rowMonth = parseInt(datePart.substring(5, 7));
      const rowDay   = parseInt(datePart.substring(8, 10));
      const rowYear  = parseInt(datePart.substring(0, 4));

      if (rowMonth !== m || rowDay !== d) continue;

      // ニコカラを除外
      if (title.includes('ニコカラ')) continue;

      songs.push({ title, smId, year: rowYear, dateStr: datePart });
    }

    loading.style.display = 'none';

    // 見出しを更新
    const today = new Date();
    const thisYear = today.getFullYear();
    headingEl.innerHTML = `<span class="date-text">${m}月${d}日</span>に生まれたボカロ曲 <span class="count-badge">${songs.length}件</span>`;

    if (songs.length === 0) {
      noResults.style.display = 'flex';
      return;
    }

    // 年ごとにグループ化してソート（新しい年順）
    const byYear = {};
    songs.forEach(s => {
      if (!byYear[s.year]) byYear[s.year] = [];
      byYear[s.year].push(s);
    });
    const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

    years.forEach(year => {
      const yearsAgo = thisYear - year;
      const section = document.createElement('section');
      section.className = 'year-section';

      const yearHead = document.createElement('h2');
      yearHead.className = 'year-heading';
      yearHead.innerHTML = `<span class="year-num">${year}年</span><span class="years-ago">${yearsAgo}年前</span>`;
      section.appendChild(yearHead);

      const grid = document.createElement('div');
      grid.className = 'songs-grid';

      byYear[year].forEach(song => {
        const card = document.createElement('div');
        card.className = 'song-card';

        card.innerHTML = `
          <div class="card-embed">
            <iframe
              src="https://ext.nicovideo.jp/thumb/${song.smId}"
              scrolling="no"
              frameborder="0"
              allowfullscreen
              loading="lazy"
              title="${escapeHtml(song.title)}"
            ></iframe>
          </div>
          <div class="card-info">
            <p class="card-title">${escapeHtml(song.title)}</p>
            <a class="card-link" href="https://www.nicovideo.jp/watch/${song.smId}" target="_blank" rel="noopener">
              ニコニコで見る →
            </a>
          </div>
        `;
        grid.appendChild(card);
      });

      section.appendChild(grid);
      songListEl.appendChild(section);
    });
  }, 50);
}

// XSS対策
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
