# NextStop：雙北公車即時看板

在這個專案工作時的規則與脈絡。回覆時用繁體中文（台灣用語）。這份只寫「沒讀到會做錯」的事；功能說明在 `README.md`，設計規則在 `DESIGN.md`，經過與細節在 git log 與程式註解。

## 目標與檔案

使用者自己通勤用的手機版公車即時看板，涵蓋台北市與新北市。純靜態網站，沒有建置步驟。

- `index.html`：整個看板（HTML、CSS、JS 都在裡面）
- `sw.js`：service worker；改快取清單或策略時把 `VERSION` 加一
- `DESIGN.md`：設計系統（token、原則、元件、否決過的方向）；`styleguide.html`：樣式頁，執行時讀 `index.html` 的 CSS 與繪製函式，並排呈現淺深兩色的元件
- `manifest.webmanifest`、`icon.svg`、`favicon.svg`、`icons/`：PWA（`favicon.svg` 是分頁圖示的簡化版，不由 `icon.svg` 產生）。改圖示時用 `sips -s format png -z N N icon.svg --out icons/icon-N.png` 重產 180、192、512 三個尺寸
- `tests/`：見〈測試〉
- `.nojekyll`：讓 GitHub Pages 原樣提供檔案（否則 Jekyll 會把有 YAML 開頭的 `DESIGN.md` 轉成網頁，原網址回 503）
- `drafts/`：草案與研究紀錄，在 `.gitignore`，不進 repo（`drafts/2026-11-18--visual-research.md` 是視覺定案前的跨領域研究）

## 使用者已拍板的決策（不要自行改回）

- 只用 TDX 資料；北市、新北的免金鑰開放資料評估過，不採用
- 每 60 秒自動更新，頁面在背景時暫停（因免費方案頻率限制，從 30 秒改來）
- 顯示：到站倒數、車在哪一站（車牌）、營運狀態、去回程切換；3 分鐘內變色、1 分鐘內紅底閃爍「進站中」
- 地圖為主：地圖鋪滿，手機是底部抽屜（peek、half、full），1024px 以上是左側 408px 浮動面板。使用者看過「列表為主」的推薦後仍選地圖為主
- 視覺是「P 行程線」：單色加唯一重點色、10 格燈條、等寬數字。規則與否決過的方向（LED、跑馬燈、雷達、時間比例列高、遮蓋地圖的點陣、直線或橢圓掃描線）見 `DESIGN.md`
- 地圖：MapLibre GL（unpkg 指定版本，有 SRI）＋ OpenFreeMap 向量圖磚，免金鑰。CARTO 要 API key、Stamen Toner 要 Stadia 帳號，不採用
- 中文字體 jf 粉圓體（Huninn），英數 Geist／Geist Mono
- 公車會依下一站的即時秒數沿路線推算移動（地圖與列表路線條同步）；不呼叫 TDX 的 GPS 端點，不增加呼叫次數

## TDX 與資料

- 金鑰由使用者在「設定」填入，存在 localStorage（`tdx_cred`），token 快取在 `tdx_tok`。不要把金鑰寫進程式碼或 git
- 免費基礎會員：每把金鑰每分鐘 5 次、每月約 4,500 次；用量達 105% 會停用帳號到月底。`queued()` 在任一 61 秒內最多送 5 次（`tdx_calls` 跨分頁共用），429 時設 `tdx_block` 等配額恢復再重試一次；`api()` 可帶 `stale()` 讓換頁後的排隊請求不送出。本月用量記在 `tdx_usage`，達 80% 時頁面頂端警告
- 省額度的設計不能破壞：路線清單（`Route`，每城市一次）、站序（含座標）、線形都快取 7 天；搜尋路線在本機清單找，只有含中文時才查 `Stop`；`Shape` 排在到站資料之後當背景請求；收藏的座標從快取回填，不另外呼叫
- 驗證伺服器回應不穩（實測 5 到 12 秒），`getToken()` 逾時 30 秒，資料 API 12 秒
- 「附近的站牌」用 OData `$filter` 圈經緯度方框，台北、新北各 1 次；沒用 `$spatialFilter`（Swagger 沒列）
- 沒有金鑰時用 `demoApi()` 產生示範資料（假的 307）

## 會讓人做錯的陷阱

- 面板 `main` 是直排 flex：`#app main>*{flex-shrink:0}` 不能拿掉，否則列表壓扁、捲不動；`.field input` 要 `flex:none`，否則輸入框被壓扁
- `body` 的 `font-synthesis-weight:none` 不能拿掉：粉圓體只有一種字重，假粗體會糊
- 「進站中」的閃爍用外圈光暈，不改 opacity（動畫中對比會掉到標準以下）
- 資料還沒回來時要顯示「等待中」，不能顯示「無資料」：`waiting(e)` 依 `S.updated` 判斷，`go()` 換畫面時會清掉 `S.updated`
- 看板內部座標一律 `[lat,lon]`，交給 MapLibre 時用 `lnglat()` 轉成 `[lon,lat]`
- MapLibre 換樣式（深淺色切換）會清掉所有圖層：看板圖層集中在 `addOverlays()`，在 `style.load` 重加；建構時的暫時樣式不算就緒（`styled` 旗標），否則會在換樣式空檔操作圖層
- 網址路由（`#home`、`#search`、`#settings`、`#route/…`、`#stop/…`）用 pushState，`depth` 記錄前進幾頁；切換方向用 replaceState
- GitHub Pages 回 `max-age=600`：service worker 抓頁面要帶 `cache:"no-cache"`，否則新版上線後 10 分鐘內看到的還是舊頁
- 改設計時，`index.html` 的 CSS 變數、`DESIGN.md` 的 token 要一起改（`hot-muted` 對應 `--hot-mu`，其餘同名，深色加 `-dark`）；測試會比對兩者

## 測試

- 本機先開伺服器：`python3 -m http.server 8765`
- 瀏覽器測試：開 `http://localhost:8765/tests/`，或用命令列 `sh tests/headless.sh`（淺色）、`sh tests/headless.sh dark`（深色）；分頁標題會寫出結果與實際的深淺色。`QUERY='grep=…&app=../drafts/mut.html'` 可篩選、做突變測試
- Service worker：`node tests/sw.test.mjs`；改了快取清單要同步改預期數字
- 新功能補測試；修 bug 先補一個會失敗的測試；重要改動做一次突變測試，確認測試抓得到
- 測試環境注入在看板 `<head>` 最前面：記憶體版 localStorage（最後一項比對真實 localStorage 沒被動到）、模擬 TDX（`ENV()`）、假定位、固定時段；`openfreemap.org` 走真網路
- 陷阱：
  - 不要在測試裡呼叫真正的 `history.back()`（會把測試頁本身導走），改看 `__pushes` 並模擬 popstate；不要用 `history.length` 判斷（上限 50）
  - 無頭瀏覽器預設跟隨系統深淺色，淺色要明確指定（腳本已處理）
  - Claude 預覽視窗被隱藏時，背景分頁會暫停繪製，MapLibre 載不完、地圖測試逾時，這時改用 `tests/headless.sh`
  - Claude 內建預覽瀏覽器不支援 service worker

## 部署

- GitHub Pages：repository `Bookman117/NextStop`（公開），`main` 分支根目錄，網址 https://bookman117.github.io/NextStop/
- push、建立 repository、部署等對外動作都要先取得使用者同意；每次授權只涵蓋那一批改動
- 這是個人專案：commit 作者用 Bookman117；`gh` 目前的帳號可能是公司身份，push 時用 `GH_TOKEN="$(gh auth token -u Bookman117)"` 只套用在那一條指令
- 上線後確認 Pages 建置完成，並開線上的 `tests/` 跑一次

## 已驗證（真實環境）

- 使用者實測金鑰驗證成功，瀏覽器可以直接跨網域呼叫 TDX
- 使用者實測遇過 429（請求太密）與「第一次查路線要等 60 秒配額」，因此有現在的每分鐘節流與本機路線清單
- 其餘功能都只在模擬資料與桌面瀏覽器測過

## 尚未驗證

- 手機（iOS Safari、加入主畫面）：排版、抽屜拖曳手感、MapLibre 的效能與手勢、定位權限流程、service worker 離線開啟、主畫面圖示
- 真實 TDX 資料：改成每分鐘節流後是否還會 429；欄位是否符合預期（「往 ○○」、末班車、車牌）；`Shape` 的格式；「附近的站牌」的 `$filter` 是否被接受
- 公車推算移動在真實路線上的準確度（平均車速假設 6 m/s）
- 官方的 `npx @google/design.md lint` 沒跑過（npm 下載被自動權限擋下），目前只用自寫檢查驗過 `DESIGN.md`
