# 雙北公車即時看板：專案交接

給接手的 Claude Code。回覆使用者時用繁體中文（台灣用語）。

## 目標

給使用者自己通勤用的手機版公車即時看板，涵蓋台北市與新北市公車。

## 目前檔案

- `index.html`：整個看板，單一檔案（HTML、CSS、JS 都在裡面），沒有建置步驟。原檔名是 `bus-board.html`。
- `manifest.webmanifest`、`icon.svg`、`icons/icon-{180,192,512}.png`：PWA 名稱與圖示。PNG 由 `icon.svg` 用 `sips -s format png -z N N icon.svg --out icons/icon-N.png` 產生，改圖示時三個尺寸要一起重產
- `sw.js`：service worker（2026-11-18 加入）。導覽請求 network-first，失敗時回快取的 `./`；同源 png/svg/webmanifest 與 Leaflet CDN cache-first；NLSC 圖磚 stale-while-revalidate、上限 400 張；TDX 與 Google Fonts 不攔截。改快取清單或策略時把 `VERSION` 加一。圖磚以 `crossOrigin:"anonymous"` 請求（NLSC 有 CORS），避免 opaque 回應灌水占用儲存配額
- `README.md`：給使用者與訪客看的說明（功能、取得金鑰、隱私、技術說明）。功能或端點有變動時要一起更新。
- `drafts/`：設計草案與 designforge 紀錄（`2026-11-17--nextstop-map.md`），已在 `.gitignore`，不進 repo。

## 已確認的需求

- 範圍：可以搜尋任何路線或站牌，也可以把「路線＋站牌」或整個站牌看板收藏到「常用」
- 裝置：以手機為主
- 顯示：到站倒數、車輛目前在哪一站（車牌）、營運狀態（尚未發車、交管不停靠、末班車已過、今日未營運）、去回程切換、即將到站提醒（3 分鐘內變色，1 分鐘內紅底閃爍「進站中」）
- 資料來源：只用 TDX。使用者評估過北市與新北的免金鑰開放資料，決定不採用
- 每 60 秒自動更新，頁面切到背景時暫停（原本 30 秒；因 TDX 免費方案的頻率限制，2026-11-17 經使用者同意改為 60 秒）
- 地圖（2026-11-17 使用者選定「地圖為主、浮動面板」，草案 B）：地圖鋪滿畫面，列表浮在上面。手機是底部抽屜（peek／half／full 三段，可拖曳）；1024px 以上是左側 408px 浮動面板，分頁列移到面板上方。使用者看過「列表為主分欄」的推薦後仍選地圖為主，不要改回

## 架構

- 金鑰由使用者在頁面的「設定」分頁填入，存在瀏覽器的 localStorage（`tdx_cred`）。access token 也快取在 localStorage（`tdx_tok`）
- 程式裡沒有寫死任何金鑰。不要把金鑰寫進程式碼或提交到 git
- 取 token：POST `https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token`，參數 `grant_type=client_credentials`
- 資料：`https://tdx.transportdata.tw/api/basic/v2/Bus/`，用到以下端點：
  - `EstimatedTimeOfArrival/City/{Taipei|NewTaipei}[/{路線}]`：到站時間
  - `RealTimeNearStop/City/...`：車輛在哪一站
  - `StopOfRoute/City/...`：路線的站序
  - `Route/City/...`：整個城市的路線清單（`$top=5000`），快取 7 天，`routeList()` 用；搜尋路線與站牌看板的「往 ○○」都在本機查
  - `Stop/City/...`：站牌，搜尋時用（`$select` 含 `StopPosition`，站牌看板的地圖用）。只有輸入含非英數字元（中文）時才查，純數字搜尋不呼叫
  - `Shape/City/{City}/{路線}`：路線線形，先讀 `Geometry`（WKT），沒有再讀 `EncodedPolyline`；快取 7 天，在到站資料之後以背景請求排隊（`stale.quiet`，排隊時不顯示等待訊息）；拿不到就用站牌連線
- TDX 免費的基礎會員限制（2026-11-17 查官網訂閱收費頁）：每把金鑰每分鐘 5 次；每月 3 點，基礎服務 1,500 次折 1 點（另有 150 MB 折 1 點，合併計算），約 4,500 次。用量達 105% 會停用帳號到月底。付費的銅級方案起為每秒 5 次
- 請求依序送出：`queued()` 在任一 61 秒內最多送 5 次，呼叫時間記在 localStorage（`tdx_calls`），同一瀏覽器的分頁共用。遇到 429 時把 `tdx_block` 設到 Retry-After 或 61 秒後，等配額恢復再重試一次
- 每個 `api()` 呼叫可帶 `stale()`：換頁或下一輪更新開始後，排隊中的舊請求不送出，避免浪費配額
- 靜態資料快取 7 天：路線清單存在 `routes|{City}`，站序（含站牌座標 `pos`）存在 `sor2|{City}|{路線}`，線形存在 `shape|{City}|{路線}`。舊版的 `route_info` 啟動時刪除
- 地圖：Leaflet 1.9.4（cdnjs，有 SRI）＋內政部國土測繪中心 EMAP01（灰階）WMTS 底圖，用 CSS filter 壓低對比，深色模式反相。使用者要求底圖簡化；CARTO 簡化底圖已改為需要 API key，不採用。公車畫在 RealTimeNearStop 的站牌座標上，不呼叫 GPS 端點，避免增加每輪呼叫次數。`window.L` 不存在時 `<html>` 加 `.nomap`，退回單欄列表
- 收藏項目會存座標（`rs` 存 `pos:[lat,lon]`，`st` 存 `pos:[[lat,lon],...]`）。舊收藏沒有座標時自動回填、不另外呼叫 API：啟動時用快取的 `sor2|` 站序（`backfillFromCache`）、打開路線時用該路線站序（`backfillFromRoute`，`st` 依站名合併座標）、搜尋與附近站牌時用帶回的站牌座標（`backfillStops`）
- 本月呼叫次數記在 `tdx_usage`（只算這台裝置），設定頁顯示；達 3,600 次（80%）時頁面頂端顯示警告
- 網址路由：`#home`、`#search`、`#settings`、`#route/{City}/{路線}/{方向}`、`#stop/{站名}`。`go()` 換頁時 pushState，`depth` 記錄在看板內前進幾頁；畫面上的返回鍵在 depth>0 時用 history.back()，否則回 `S.prev`。切換方向用 replaceState。無效網址落回首頁並改正網址
- 面板內 `main` 是 flex 直排，`#app main>*{flex-shrink:0}` 不能拿掉，否則列表會被壓扁且捲不動（2026-11-17 曾發生）
- 定位：地圖右上 ◎（`locate()`）只在本機用位置；路線頁會選取目前方向最近的站。搜尋頁「附近的站牌」（`findNearby()`）用 OData `$filter` 圈 StopPosition 經緯度方框（約 ±400 公尺），再在本機算距離過濾，台北、新北各 1 次呼叫。沒用 `$spatialFilter`：v3 Bus Swagger 沒列這個參數，無金鑰也無法驗證
- 選取站的到站時間顯示在標題列（`.pickline`），抽屜 peek 時也看得到
- 常用分組（2026-11-18，參考 Bus+、Citymapper、Transit）：收藏可帶 `group: "work"|"home"`。`autoTab()` 依時段預設分頁（<12 點 work、≥16 點 home，該組沒有項目就 all）；手動切換存在 `S.homeTab`（只在這次開啟有效）。編輯模式（`S.editFav`）設定分組與移除收藏。常用頁地圖只畫目前分頁的項目
- 即時與表定（參考 Transit、OneBusAway）：StopStatus 0 的 EstimateTime 是即時預估，加訊號圖示；StopStatus 1 且有 EstimateTime 是表定推算，`.eta.sched` 虛線框、字樣「表定」。到站牌有 aria-label 說明是哪一種
- 方向記憶（參考 Transit）：切換方向時寫入 `route_dir`（`{City}|{路線}` → 方向）。從搜尋結果進路線時沿用；從收藏、站牌看板或網址進來時用它們自己的方向
- 觸控裝置（pointer:coarse）地圖按鈕 44px；把手視覺 22px、觸控範圍用 ::after 往上延伸到 44px
- DOM 順序是面板 → 分頁列 → 地圖，讓 Tab 順序與畫面一致；地圖是 fixed 定位，順序不影響版面
- 「進站中」用 `--now-ink` 當字色（淺色白字、深色深字），閃爍用外圈 box-shadow，不改 opacity，避免動畫中對比掉到標準以下
- 沒有金鑰時會用 `demoApi()` 產生示範資料（假的 307 路線）

## 已驗證

- 使用者實測：金鑰驗證成功（設定頁顯示「連線成功」），所以瀏覽器可以直接跨網域呼叫 TDX，至少 token 端點可以
- 使用者實測：舊版在路線頁被 TDX 回 429（請求太密）。後來加了 350 毫秒間隔仍然 429（262 路線頁），原因是免費方案每分鐘只有 5 次，因此改成上面的每分鐘節流
- 2026-11-17 在瀏覽器用模擬 fetch 測過：連續換頁與重複更新時最多 5 次／61 秒、沒有 429；超量請求排隊後約 61 秒送出；伺服器回 429 時會等配額恢復後重試成功；重開同一路線不再抓站序
- 用 jsdom 模擬測過所有畫面、按鈕、收藏、搜尋，以及模擬的 429 情境
- 2026-11-17 使用者實測：第一次查路線要等 60 秒配額。原因是搜尋每次花 4 次（路線＋站牌 × 2 城市），再開路線 3 次就超過。改成本機路線清單後，模擬測試：首次使用搜尋 2 次、開路線 3 次，資料 1.6 秒顯示；之後搜尋 0 次、開路線 2 到 3 次
- 2026-11-17 UI/UX 審視後修正：列表壓扁（手機 8 站只顯示 151/525px、桌面 60 站只顯示 545/3905px）、深色「進站中」對比 2.3:1、換頁不寫瀏覽紀錄。修正後實測：列表完整高度、滑鼠滾輪可捲、深色「進站中」8.0:1、動畫中 opacity 固定 1、返回鍵與 history.back 正確回上一頁、深層連結可直接開啟、無效網址改正為 #home
- 2026-11-18 三項吸收功能模擬測試：分組後「上班」只顯示西門站、「回家」只顯示南京敦化路口、地圖跟著分頁；時段 7、11 點 → 上班，12、14 點 → 全部，16、22 點 → 回家，上班組清空時退回全部；表定項目 aria-label「表定推算：12 分鐘」、虛線框，即時項目有訊號圖示；307 切到回程後從搜尋再進入維持回程；編輯列在 320px 寬名稱一行、按鈕 67×44、無水平溢位
- 2026-11-18 舊收藏補座標模擬測試：沒有 pos 的 `rs` 與 `st` 收藏，開 262 後都補上座標、首頁地圖 0 → 2 個點、沒有額外 API 呼叫；清掉座標後重新載入，啟動時從快取補回
- 2026-11-18 PWA：sw.js 在 Node 以模擬的 caches／fetch 測過 9 項（安裝快取 8 個檔、線上導覽走網路、離線導覽回快取頁、TDX 與 Fonts 不攔截、Leaflet 不重抓、圖磚上限 400、離線用快取圖磚、啟用時刪舊版快取）。Claude 內建預覽瀏覽器不支援 service worker（註冊時 fetch script 失敗，看板功能不受影響）；Vivaldi headless 不會自行結束，無法用來驗證
- 2026-11-18 P2 修正後模擬測試：觸控按鈕 44×44、把手上方 15px 仍點得到、Tab 順序面板在前；定位（假造座標）在路線頁選到最近的站、標題列顯示「6 分 捷運西門站」且 peek 時可見；附近站牌列出「捷運西門站 39 公尺」；定位被拒時顯示權限說明；手機 375 無水平溢位
- 2026-11-17 地圖版用示範資料在瀏覽器測過：桌面 1440 與手機 390、320 寬度、深淺色、列表與地圖雙向選取、抽屜點按與拖曳、Leaflet 被擋時的單欄退路；各頁 root 沒有水平溢位

## 尚未驗證

- 改成每分鐘節流後，用真實 TDX 資料是否還會出現 429
- 真實 API 回傳的欄位是否都跟程式預期的一致（站牌看板的「往 ○○」、末班車標記、車牌顯示）
- 手機上實際的排版與抽屜拖曳手感（只在桌面瀏覽器模擬過）
- 「附近的站牌」的 OData 經緯度 `$filter` 在真實 TDX 上是否接受（語法是標準 OData，但沒拿到真實回應）
- 實機定位權限流程（iOS Safari／加入主畫面）
- 真實瀏覽器中 service worker 的註冊與離線開啟（只在 Node 模擬環境測過策略）；iOS 加入主畫面後的圖示與全螢幕外觀
- TDX `Shape` 的 `Geometry` 與 `StopPosition` 欄位格式（WKT 與 encoded polyline 解析器已用已知資料測過，但沒有拿到真實 TDX 回應；使用者截圖中的直線是線形還在排隊）

## 已知限制

- Claude 的分享頁面會擋掉所有對外連線，所以看板不能放在 Claude 上用
- 使用者的手機不方便直接開 HTML 檔，所以需要放到網路空間

## 部署（已決定）

- 走 GitHub Pages：repository `Bookman117/NextStop`（公開），從 `main` 分支根目錄發布
- 網址：https://bookman117.github.io/NextStop/
- 使用者之後會繼續擴充功能。建立 repository、push、部署等對外動作仍要先取得使用者同意
- 原本的備選方案（自建 TDX MCP 連接器，部署在 Cloudflare Workers，金鑰放伺服器端）暫不做
