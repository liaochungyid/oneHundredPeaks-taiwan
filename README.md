<div id="top"></div>

# Simple Twitter

![image](https://github.com/liaochungyid/oneHundredPeaks-taiwan/blob/main/public/images/cover.png)

本專案為 Node.js 原生語言開發(無後端套件)作品

使用 Node.js 展示 RESTful API 後端功能
使用 XMLHttpsRequest 方式展示前後 API 串接

- file system 模擬資料庫 CRUD
- file system 及 string.replace 模擬模板
- crypto hash function 模擬登入 session
- RESTful 路由及 API 設計
- MVC 架構

[Live Demo](https://tranquil-lake-73390.herokuapp.com/)

<p align="right">(<a href="#top">back to top</a>)</p>

## Table of Contents

- [Features](#features)
- [Environment Setup](#environment-setup)
- [Installation](#installation)

## Features

1. **首頁瀏覽**

   - 使用者能在首頁瀏覽立體台灣方條圖
   - 使用者能在首頁瀏覽相關照片，slider 更換照片
   - 使用者能在首頁瀏覽相關作品
     - 點擊作品進入 Arcade 頁面，並開啟 peak a peak 分頁標籤
     - 點擊 mint，進入 Arcade 頁面，並開啟 mint a peak 分頁標籤

2. **使用者互動**

   - 使用者可以登錄(claim)自己的購買
   - 使用者可以編輯、刪除自己的登錄(claim)內容
     - 以 anti-phishing-phrase 驗證權限

3. **數據摘要**

   - 使用者可在 Arcade 右下清單欄看到最新的登錄
     - 排序依登錄日期，最新的在前

<p align="right">(<a href="#top">back to top</a>)</p>

## Environment Setup

- 使用 Node.js v16.13.1 或以上版本
- 其他套件請參閱 package.json

<p align="right">(<a href="#top">back to top</a>)</p>

## Installation

1. 下載本專案到本地端

   ```bash
   git clone https://github.com/liaochungyid/oneHundredPeaks-taiwan.git
   ```

2. 移動當前路徑至專案

   ```bash
   cd oneHundredPeaks-taiwan
   ```

3. 設置

   ```bash
   npm install
   ```

   ```bash
   npm run seed
   ```

4. 開發者模式於本地使用
   ```bash
   npm run dev
   ```

<p align="right">(<a href="#top">back to top</a>)</p>
