---
version: alpha
name: NextStop 行程線
description: 雙北公車通勤看板的設計系統。單色加唯一重點色，用等寬數字與 10 格燈條把「還要幾分鐘」變成一眼可讀的形狀；地圖是點陣建築的灰階基底。
colors:
  bg: "#f4f4f2"
  surface: "#ffffff"
  ink: "#0d0e10"
  muted: "#676b71"
  line: "#e3e3e0"
  route: "#5a6068"
  cell: "#e6e6e3"
  hot: "#ff4d1a"
  hot-bg: "#0d0e10"
  hot-ink: "#f4f4f2"
  hot-muted: "#9a9ea4"
  hot-cell: "#2a2c30"
  now: "#c8321e"
  now-ink: "#ffffff"
  soon: "#a65300"
  map-hot: "#ff4d1a"
  me: "#1f6fe5"
  bg-dark: "#0b0c0d"
  surface-dark: "#151618"
  ink-dark: "#ecebe6"
  muted-dark: "#8d9095"
  line-dark: "#26282b"
  route-dark: "#9aa0a6"
  cell-dark: "#26282b"
  hot-dark: "#b92c0c"
  hot-bg-dark: "#ecebe6"
  hot-ink-dark: "#0d0e10"
  hot-muted-dark: "#5c6066"
  hot-cell-dark: "#d4d3ce"
  now-dark: "#ff5a3c"
  now-ink-dark: "#2a0400"
  soon-dark: "#ffb020"
  map-hot-dark: "#ff5a3c"
  me-dark: "#5b9dff"
typography:
  countdown:
    fontFamily: Geist Mono
    fontSize: 52px
    fontWeight: 500
    lineHeight: 0.8
    letterSpacing: "-3px"
  countdown-list:
    fontFamily: Geist Mono
    fontSize: 24px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-1.5px"
  route-number:
    fontFamily: Geist Mono
    fontSize: 22px
    fontWeight: 600
    letterSpacing: "-0.5px"
  route-title:
    fontFamily: Geist Mono
    fontSize: 26px
    fontWeight: 600
    letterSpacing: "-1px"
  title:
    fontFamily: Huninn
    fontSize: 20px
    fontWeight: 400
  body:
    fontFamily: Huninn
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.45
  status:
    fontFamily: Huninn
    fontSize: 13px
    fontWeight: 400
  label:
    fontFamily: Geist Mono
    fontSize: 11px
    fontWeight: 500
    letterSpacing: 1.5px
  micro:
    fontFamily: Geist Mono
    fontSize: 10px
    fontWeight: 500
    letterSpacing: 1.5px
rounded:
  card: 18px
  panel: 14px
  list: 12px
  control: 10px
  pill: 6px
spacing:
  page: 16px
  card-x: 16px
  stack: 10px
  row-x: 12px
  row-y: 10px
components:
  trip-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: 16px
  trip-card-hot:
    backgroundColor: "{colors.hot-bg}"
    textColor: "{colors.hot-ink}"
    rounded: "{rounded.card}"
    padding: 16px
  trip-card-hot-countdown:
    backgroundColor: "{colors.hot-bg}"
    textColor: "{colors.hot}"
    typography: "{typography.countdown}"
  trip-card-hot-dark:
    backgroundColor: "{colors.hot-bg-dark}"
    textColor: "{colors.hot-ink-dark}"
    rounded: "{rounded.card}"
    padding: 16px
  trip-card-hot-countdown-dark:
    backgroundColor: "{colors.hot-bg-dark}"
    textColor: "{colors.hot-dark}"
    typography: "{typography.countdown}"
  trip-card-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.ink-dark}"
    rounded: "{rounded.card}"
    padding: 16px
  cell:
    backgroundColor: "{colors.cell}"
    height: 6px
  cell-on:
    backgroundColor: "{colors.ink}"
    height: 6px
  cell-hot-on:
    backgroundColor: "{colors.hot}"
    height: 6px
  cell-dark:
    backgroundColor: "{colors.cell-dark}"
    height: 6px
  cell-hot-dark:
    backgroundColor: "{colors.hot-cell}"
    height: 6px
  cell-hot-on-dark:
    backgroundColor: "{colors.hot-dark}"
    height: 6px
  cell-hot-off-dark:
    backgroundColor: "{colors.hot-cell-dark}"
    height: 6px
  eta-now:
    backgroundColor: "{colors.now}"
    textColor: "{colors.now-ink}"
    rounded: "{rounded.pill}"
    padding: 7px
  eta-now-dark:
    backgroundColor: "{colors.now-dark}"
    textColor: "{colors.now-ink-dark}"
    rounded: "{rounded.pill}"
    padding: 7px
  eta-soon:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.soon}"
    typography: "{typography.countdown-list}"
  eta-soon-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.soon-dark}"
    typography: "{typography.countdown-list}"
  eta-muted:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
  eta-muted-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.muted-dark}"
  hot-card-label:
    backgroundColor: "{colors.hot-bg}"
    textColor: "{colors.hot-muted}"
    typography: "{typography.micro}"
  hot-card-label-dark:
    backgroundColor: "{colors.hot-bg-dark}"
    textColor: "{colors.hot-muted-dark}"
    typography: "{typography.micro}"
  page:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.ink}"
    padding: "{spacing.page}"
  page-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.ink-dark}"
    padding: "{spacing.page}"
  list:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.list}"
  list-divider:
    backgroundColor: "{colors.line}"
    height: 1px
  list-divider-dark:
    backgroundColor: "{colors.line-dark}"
    height: 1px
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    height: 48px
  route-line:
    backgroundColor: "{colors.route}"
    width: 5px
  route-line-dark:
    backgroundColor: "{colors.route-dark}"
    width: 5px
  map-bus:
    backgroundColor: "{colors.map-hot}"
    size: 16px
  map-bus-dark:
    backgroundColor: "{colors.map-hot-dark}"
    size: 16px
  map-me:
    backgroundColor: "{colors.me}"
    textColor: "{colors.now-ink}"
    size: 14px
  map-me-dark:
    backgroundColor: "{colors.me-dark}"
    size: 14px
---

## Overview

NextStop 是給一個人通勤用的雙北公車看板。設計只回答一個問題：「我要搭的那班車還要多久？」所以整個系統建立在三條規則上：

- **單色加唯一重點色。** 介面是墨色與灰階，只有「最急的那一班」用橘紅（`hot`）。常用頁是最快到、有即時倒數的那張卡；路線頁是選取的站；站牌看板是最快到的那一班；地圖上是公車。重點色從不用在裝飾或分類。
- **時間是形狀，不是數字。** 每個倒數都配一條 10 格燈條，一格等於一分鐘，向上取整，超過 10 分鐘全亮。數字給精確值，燈條讓人不必讀數字也看得出遠近。行程卡、列表到站牌與地圖上的公車移動，都用同一種時間語言。
- **說人話。** 一句話狀態只依分鐘分級（進站中、3 分內快到了、8 分內還有一點時間、其餘還早）。看板沒有步行時間資料，所以不寫「何時出門」。資料還沒回來時說「等待中」，不能說「無資料」。

視覺參照（2026-11-18 研究）：Braun ET66 只有「＝」是黃色（唯一重點色）、Teenage Engineering OP-1 的細線與等寬小標、Nothing Glyph 的燈格、Flighty 的「起點、進度、終點加一句話」。

## Colors

淺色與深色各一組，跟隨系統設定。深色不是淺色反相：重點卡在深色模式「反白」成淺底深字，重點色換成深一階的 `hot-dark`，維持對比。

- **ink／muted／line／surface／bg：** 介面主體。文字用 `ink`，次要資訊用 `muted`（淺 5.4:1、深 5.7:1 對 surface），分隔線用 `line`。
- **hot：** 唯一重點色，規則見 Overview。重點卡上，數字用 `hot`，其他文字用 `hot-ink`／`hot-muted`；無資料、未發車這類文字狀態不用 `hot`。
- **now：** 「進站中」紅底膠囊（需求：1 分鐘內紅底閃爍）。閃爍用外圈光暈，不改不透明度，避免動畫中對比掉到標準以下。
- **soon：** 3 分鐘內的到站牌數字與燈條（需求：3 分鐘內變色）。
- **route：** 沒有家族色的路線線、路線條與一般站牌外框。紅、藍、棕、綠、橘、小字頭的路線用各自的家族色（在程式的 `FAM` 定義，淺深兩組、文字對比都 ≥ 4.5:1）。
- **map-hot：** 地圖上的公車，和介面的 `hot` 同色系。
- **me：** 地圖上「我的位置」與定位波紋。這是重點色以外唯一的彩色，只代表使用者自己，用藍色和墨色的站牌、橘紅的公車區分。
- **cell／hot-cell：** 燈條未亮的格子。

## Typography

- **Huninn（jf 粉圓體）負責中文**，只有 400 一種字重。`font-synthesis-weight:none` 關掉瀏覽器假粗體，層級靠字級與顏色，不靠粗細。
- **Geist 負責內文英數，Geist Mono 負責所有數字與路線號。** 倒數會每分鐘變動，比例字型的「1」比「8」窄，數字變動時會左右跳；等寬加上 `tabular-nums` 讓數字不晃。
- **小標（label、micro）是等寬、加寬字距**，用在「選取的站」、「LIVE」、區段標題等輔助資訊。
- Noto Sans TC 只當缺字備援。

## Layout

- 地圖鋪滿畫面，列表浮在上面（使用者選定「地圖為主」，不要改回列表為主）。手機是底部抽屜（peek、half、full 三段）；1024px 以上是左側 408px 浮動面板。
- 面板內 `main` 是直排 flex，子元素一律 `flex-shrink:0`，否則列表會被壓扁、無法捲動。
- 觸控目標至少 44px。路線頁選取站的卡放在標題列，抽屜收起時仍看得到。

## Elevation & Depth

幾乎不用陰影。層級靠 1px 細線與底色差：卡片與列表是 `surface` 加 `line` 外框，面板是 `bg`。只有浮動面板與地圖控制按鈕有柔和陰影，用來和地圖分開。

## Shapes

- 行程卡 18px、選取站卡與桌面面板 14px、列表 12px、按鈕與分段控制 10px、進站中膠囊 6px、最近搜尋膠囊全圓角。
- 燈條格子是 6px 高、1px 圓角的細長方塊，末端接一個空心圓代表「你的站」。

## Components

- **行程卡（trip-card）：** 路線號（家族色）＋往哪＋站名；右上大字倒數（countdown）；中間 10 格燈條；底部一句話與 LIVE／表定標記。最急的一張用 `trip-card-hot`。等待資料時顯示骨架與「排隊等 TDX 配額」，不用重點色。
- **到站牌（列表）：** 數字（countdown-list）加小字「分」，右上小訊號圖示代表即時預估，下方 10 格迷你燈條。即將到站用 `soon`；表定是灰字虛線燈條；進站中是 `eta-now` 膠囊；無資料、未發車用 `muted` 小字。
- **路線條：** 每列左側一段直線串起整條路線，站是空心小圈，選取的站實心。公車點用 `ink`（不用紅色，避免和紅色路線混在一起），依推算進度在兩站之間連續移動。
- **站牌看板：** 有倒數的前 3 班用行程卡，其餘路線用精簡列表。
- **地圖：** 由下而上是底色、水域與公園淡色塊、建築點陣（點雲）、小路圓點虛線、主要道路細實線、文字、路線（底色描邊 10px 加 5px 實線）、站牌、我的位置、公車、動態層。定位後一條流動曲線掃過一次，之後從我的位置每 6 秒擴散一圈淡波紋。

## Do's and Don'ts

- **Do** 只給最急的那一班用 `hot`；一個畫面最多一個重點。
- **Do** 每個倒數都配燈條；燈條一格永遠等於一分鐘。
- **Do** 資料沒回來時說「等待中」；只有資料回來後仍沒有的站才說「無資料」。
- **Do** 減少動態時停掉掃描、波紋、骨架流光與閃爍；頁面在背景時不跑動畫。
- **Don't** 加回已否決的方向：琥珀點陣 LED、跑馬燈、時間雷達、依時間拉開列高（2026-11-18 使用者看過後說「感覺沒有到位」）；也不要用遮罩把地圖蓋成點陣（地圖會失去辨識度），掃描線不要用直線或橢圓。
- **Don't** 用彩色做裝飾；藍色只屬於「我的位置」。
- **Don't** 為了強調而假粗體中文；粉圓體只有一種字重。
- **Don't** 寫「何時出門」或任何沒有資料支持的建議。
