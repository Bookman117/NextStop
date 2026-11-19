#!/bin/sh
# 用無頭的 Chromium 系瀏覽器跑 tests/index.html，讀分頁標題拿結果（「通過 N/N」或「失敗 x/N」）。
# 預覽視窗被隱藏時，瀏覽器會暫停背景分頁的繪製，MapLibre 的樣式載不完，地圖相關測試會逾時；無頭模式沒有這個問題。
# 用法：先在專案根目錄開 python3 -m http.server 8765，再執行
#   sh tests/headless.sh            淺色
#   sh tests/headless.sh dark       深色
# 環境變數 QUERY 會接在測試網址後面（例如 QUERY='grep=介面&app=../drafts/mut.html' 做突變測試）；BROWSER 可指定瀏覽器執行檔（預設 Vivaldi；Chrome 為 /Applications/Google Chrome.app/Contents/MacOS/Google Chrome）。
# 無頭瀏覽器不會自己結束，這支腳本讀到結果後會把它關掉。
BROWSER="${BROWSER:-/Applications/Vivaldi.app/Contents/MacOS/Vivaldi}"
PORT="${PORT:-9333}"
PROFILE="$(mktemp -d)"
# 無頭瀏覽器預設跟隨系統深淺色（2026-11-19 發現：系統是深色時，原本的「淺色」其實跑成深色），所以兩種都明確指定
EXTRA="--blink-settings=preferredColorScheme=1"
[ "$1" = "dark" ] && EXTRA="--force-dark-mode"
"$BROWSER" --headless=new --user-data-dir="$PROFILE" --enable-unsafe-swiftshader --use-angle=swiftshader \
  --window-size=1280,800 --remote-debugging-port="$PORT" $EXTRA "http://localhost:8765/tests/?h=$$&${QUERY:-}" >/dev/null 2>&1 &
PID=$!
RESULT="逾時"
i=0
while [ $i -lt 40 ]; do
  sleep 3; i=$((i+1))
  T=$(curl -s "http://127.0.0.1:$PORT/json" | python3 -c "import json,sys
try:print([p['title'] for p in json.load(sys.stdin) if '/tests/' in p.get('url','')][0])
except Exception:print('')" 2>/dev/null)
  case "$T" in 通過*|失敗*) RESULT="$T"; break;; esac
done
kill $PID 2>/dev/null
rm -rf "$PROFILE"
echo "$RESULT"
case "$RESULT" in 通過*) exit 0;; *) exit 1;; esac
