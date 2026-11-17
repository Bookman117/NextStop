# 雙北公車即時看板：專案交接

給接手的 Claude Code。回覆使用者時用繁體中文（台灣用語）。

## 目標

給使用者自己通勤用的手機版公車即時看板，涵蓋台北市與新北市公車。

## 目前檔案

- `index.html`：整個看板，單一檔案（HTML、CSS、JS 都在裡面），沒有建置步驟。原檔名是 `bus-board.html`。
- `README.md`：給使用者與訪客看的說明（功能、取得金鑰、隱私、技術說明）。功能或端點有變動時要一起更新。

## 已確認的需求

- 範圍：可以搜尋任何路線或站牌，也可以把「路線＋站牌」或整個站牌看板收藏到「常用」
- 裝置：以手機為主
- 顯示：到站倒數、車輛目前在哪一站（車牌）、營運狀態（尚未發車、交管不停靠、末班車已過、今日未營運）、去回程切換、即將到站提醒（3 分鐘內變色，1 分鐘內紅底閃爍「進站中」）
- 資料來源：只用 TDX。使用者評估過北市與新北的免金鑰開放資料，決定不採用
- 每 30 秒自動更新，頁面切到背景時暫停

## 架構

- 金鑰由使用者在頁面的「設定」分頁填入，存在瀏覽器的 localStorage（`tdx_cred`）。access token 也快取在 localStorage（`tdx_tok`）
- 程式裡沒有寫死任何金鑰。不要把金鑰寫進程式碼或提交到 git
- 取 token：POST `https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token`，參數 `grant_type=client_credentials`
- 資料：`https://tdx.transportdata.tw/api/basic/v2/Bus/`，用到以下端點：
  - `EstimatedTimeOfArrival/City/{Taipei|NewTaipei}[/{路線}]`：到站時間
  - `RealTimeNearStop/City/...`：車輛在哪一站
  - `StopOfRoute/City/...`：路線的站序
  - `Route/City/...`：路線資訊，搜尋時用
  - `Stop/City/...`：站牌，搜尋時用
- 請求依序送出：`queued()` 讓每兩次請求至少間隔 350 毫秒，遇到 429 會重試最多 3 次
- 沒有金鑰時會用 `demoApi()` 產生示範資料（假的 307 路線）

## 已驗證

- 使用者實測：金鑰驗證成功（設定頁顯示「連線成功」），所以瀏覽器可以直接跨網域呼叫 TDX，至少 token 端點可以
- 使用者實測：舊版在路線頁被 TDX 回 429（請求太密）。因此加了上面的排隊機制
- 用 jsdom 模擬測過所有畫面、按鈕、收藏、搜尋，以及模擬的 429 情境

## 尚未驗證

- 加了排隊機制之後，用真實 TDX 資料是否還會出現 429
- 真實 API 回傳的欄位是否都跟程式預期的一致（站牌看板的「往 ○○」、末班車標記、車牌顯示）
- 手機上實際的排版

## 已知限制

- Claude 的分享頁面會擋掉所有對外連線，所以看板不能放在 Claude 上用
- 使用者的手機不方便直接開 HTML 檔，所以需要放到網路空間

## 部署（已決定）

- 走 GitHub Pages：repository `Bookman117/NextStop`（公開），從 `main` 分支根目錄發布
- 網址：https://bookman117.github.io/NextStop/
- 使用者之後會繼續擴充功能。建立 repository、push、部署等對外動作仍要先取得使用者同意
- 原本的備選方案（自建 TDX MCP 連接器，部署在 Cloudflare Workers，金鑰放伺服器端）暫不做
