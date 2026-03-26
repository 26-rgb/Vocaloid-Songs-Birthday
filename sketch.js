// ボカロ曲の誕生日 — 純粋なバニラJS実装（p5.js不要）

var csvData = null;
var currentMonth = null;
var currentDay = null;

// ========== 視聴履歴（localStorage）==========
var WATCHED_KEY = 'vocaloid_watched'; // localStorage のキー

// 視聴済みセットを取得
function getWatched() {
  try {
    var raw = localStorage.getItem(WATCHED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch(e) {
    return new Set();
  }
}

// ========== ネギカウンター表示を更新 ==========
function updateNegiCounter() {
  var count = getWatched().size;
  var counter = document.getElementById('negi-counter');
  var numEl   = document.getElementById('negi-count');
  if (!counter || !numEl) return;
  numEl.textContent = count;
  counter.style.display = count > 0 ? 'flex' : 'none';
}

// smId を視聴済みとして記録し、対応カードにバッジを即反映
function markWatched(smId) {
  try {
    var watched = getWatched();
    if (watched.has(smId)) return; // 既に記録済み
    watched.add(smId);
    localStorage.setItem(WATCHED_KEY, JSON.stringify(Array.from(watched)));
  } catch(e) { /* プライベートモード等でlocalStorageが使えない場合は無視 */ }

  // DOM上の対応カードにバッジを付ける
  var card = document.querySelector('.song-card[data-smid="' + smId + '"]');
  if (card) card.classList.add('is-watched');

  // ネギカウンターをリアルタイム更新
  updateNegiCounter();
}

// ========== 初期化 ==========
document.addEventListener('DOMContentLoaded', function() {

  // ハンバーガーメニュー
  var hamburger = document.getElementById('hamburger');
  var nav = document.getElementById('nav');
  hamburger.addEventListener('click', function() {
    nav.classList.toggle('active');
  });
  hamburger.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') nav.classList.toggle('active');
  });
  document.addEventListener('click', function(e) {
    if (!hamburger.contains(e.target) && !nav.contains(e.target)) {
      nav.classList.remove('active');
    }
  });

  // 今日の日付をセット
  var today = new Date();
  currentMonth = today.getMonth() + 1;
  currentDay = today.getDate();
  setSelectValue('selectMonth', currentMonth);
  setSelectValue('selectDay', currentDay);

  // セレクトボックスのイベント
  document.getElementById('selectMonth').addEventListener('change', function() {
    currentMonth = parseInt(this.value) || null;
    if (csvData) vocaloidbirthday(currentMonth, currentDay);
  });
  document.getElementById('selectDay').addEventListener('change', function() {
    currentDay = parseInt(this.value) || null;
    if (csvData) vocaloidbirthday(currentMonth, currentDay);
  });

  // CSVを読み込む
  loadCSV('vocaloid_data.csv');

  // ページ表示時点の視聴済み数をカウンターに反映
  updateNegiCounter();
});

// ========== CSV読み込み ==========
function loadCSV(path) {
  showLoading(true);
  fetch(path)
    .then(function(res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    })
    .then(function(text) {
      csvData = parseCSV(text);
      vocaloidbirthday(currentMonth, currentDay);
    })
    .catch(function(err) {
      showLoading(false);
      document.getElementById('date-heading').textContent = 'CSVの読み込みに失敗しました。';
      console.error('CSV load error:', err);
    });
}

// ========== RFC4180準拠CSVパーサー（タイトル内カンマ対応）==========
function parseCSV(text) {
  // BOM除去・改行統一
  text = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  var rows = [];
  var lines = text.split('\n');
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (line.trim() === '') continue;
    var cols = splitCSVLine(line);
    rows.push(cols);
  }
  return rows;
}

// 1行をカンマで分割（ダブルクォート内カンマを正しく処理）
function splitCSVLine(line) {
  var cols = [];
  var current = '';
  var inQuote = false;
  for (var i = 0; i < line.length; i++) {
    var ch = line[i];
    if (inQuote) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'; i++; // エスケープされたクォート
        } else {
          inQuote = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuote = true;
      } else if (ch === ',') {
        cols.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  cols.push(current.trim());
  return cols;
}

// ========== セレクトボックスに値をセット ==========
function setSelectValue(id, value) {
  var sel = document.getElementById(id);
  for (var i = 0; i < sel.options.length; i++) {
    if (parseInt(sel.options[i].value) === value) {
      sel.selectedIndex = i;
      break;
    }
  }
}

// ========== ローディング表示切り替え ==========
function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'flex' : 'none';
}

// ========== m月d日が誕生日の曲を表示 ==========
function vocaloidbirthday(m, d) {
  if (!m || !d || !csvData) return;

  var songListEl = document.getElementById('song-list');
  var headingEl  = document.getElementById('date-heading');
  var noResults  = document.getElementById('no-results');

  songListEl.innerHTML = '';
  noResults.style.display = 'none';
  showLoading(true);

  var songs = [];
  for (var i = 0; i < csvData.length; i++) {
    var row = csvData[i];
    if (row.length < 4) continue;

    var title   = row[0];
    var smId    = row[1];
    var dateStr = row[3]; // "2011-09-17T19:00:28+09:00"

    if (!dateStr || dateStr.length < 10) continue;

    var rowMonth = parseInt(dateStr.substring(5, 7));
    var rowDay   = parseInt(dateStr.substring(8, 10));
    var rowYear  = parseInt(dateStr.substring(0, 4));

    if (isNaN(rowMonth) || isNaN(rowDay) || isNaN(rowYear)) continue;
    if (rowMonth !== m || rowDay !== d) continue;
    if (title.indexOf('ニコカラ') !== -1) continue;

    songs.push({ title: title, smId: smId, year: rowYear });
  }

  showLoading(false);

  var thisYear = new Date().getFullYear();
  headingEl.innerHTML =
    '<span class="date-text">' + m + '月' + d + '日</span>に生まれたボカロ曲' +
    '<span class="count-badge">' + songs.length + '件</span>';

  if (songs.length === 0) {
    noResults.style.display = 'flex';
    return;
  }

  // 年ごとにグループ化・降順ソート
  var byYear = {};
  for (var j = 0; j < songs.length; j++) {
    var y = songs[j].year;
    if (!byYear[y]) byYear[y] = [];
    byYear[y].push(songs[j]);
  }
  var years = Object.keys(byYear).map(Number).sort(function(a, b) { return b - a; });

  for (var k = 0; k < years.length; k++) {
    var year = years[k];
    var yearsAgo = thisYear - year;

    var section = document.createElement('section');
    section.className = 'year-section';

    var yearHead = document.createElement('h2');
    yearHead.className = 'year-heading';
    yearHead.innerHTML =
      '<span class="year-num">' + year + '年</span>' +
      '<span class="years-ago">' + yearsAgo + '年前</span>';
    section.appendChild(yearHead);

    var grid = document.createElement('div');
    grid.className = 'songs-grid';

    var group = byYear[year];
    var watched = getWatched(); // このyearブロック描画前に一度だけ取得
    for (var n = 0; n < group.length; n++) {
      var song = group[n];
      var isWatched = watched.has(song.smId);

      var card = document.createElement('div');
      card.className = 'song-card' + (isWatched ? ' is-watched' : '');
      card.dataset.smid = song.smId; // data-smid 属性（視聴後の即時反映に使用）

      card.innerHTML =
        '<div class="card-embed">' +
          '<iframe src="https://ext.nicovideo.jp/thumb/' + escapeHtml(song.smId) + '"' +
          ' scrolling="no" frameborder="0" loading="lazy"' +
          ' title="' + escapeHtml(song.title) + '"></iframe>' +
        '</div>' +
        '<div class="card-info">' +
          '<p class="card-title">' + escapeHtml(song.title) + '</p>' +
          '<div class="card-bottom">' +
            '<a class="card-link" href="https://www.nicovideo.jp/watch/' + escapeHtml(song.smId) + '"' +
            ' target="_blank" rel="noopener">ニコニコで見る →</a>' +
            '<div class="watched-badge" aria-label="視聴済み">' +
              '<img src="negi.png" alt="" class="watched-badge-img">' +
              '視聴済み' +
            '</div>' +
          '</div>' +
        '</div>';

      // 「ニコニコで見る」リンクをクリック → 視聴済み記録
      card.querySelector('.card-link').addEventListener('click', (function(id) {
        return function() { markWatched(id); };
      })(song.smId));

      // カード全体クリック → 視聴済み記録（リンク自体のクリックと重複しても問題なし）
      card.addEventListener('click', (function(id) {
        return function() { markWatched(id); };
      })(song.smId));

      grid.appendChild(card);
    }

    section.appendChild(grid);
    songListEl.appendChild(section);
  }
}

// ========== XSS対策 ==========
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
