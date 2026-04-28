// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let statusMessage = "正在初始化系統...";
let isModelLoaded = false;

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 檢查 WebGL 支援程度
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  if (!gl) {
    statusMessage = "❌ 錯誤：您的裝置不支援 WebGL，無法啟動 AI 辨識。";
    return; // 停止後續初始化
  }

  statusMessage = "⏳ 正在啟動攝影機與載入模型...";
  
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // 初始化 HandPose 模型
  // 使用回呼函式確認模型是否載入成功
  handPose = ml5.handPose({ flipped: true }, () => {
    statusMessage = "✅ 模型載入完成，開始辨識手勢";
    isModelLoaded = true;
    // 開始偵測手勢
    handPose.detectStart(video, gotHands);
  });
  
  // 捕捉可能的載入錯誤
  if (!handPose) {
    statusMessage = "❌ 錯誤：無法載入 ml5.js 模型";
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background('#e7c6ff');

  // 顯示狀態文字
  fill(0);
  noStroke();
  textSize(18);
  textAlign(CENTER, TOP);
  text(statusMessage, width / 2, 20);

  // 計算顯示的尺寸（畫布的 50%）
  let displayW = width * 0.5;
  let displayH = height * 0.5;
  
  // 計算置中的位置
  let offsetX = (width - displayW) / 2;
  let offsetY = (height - displayH) / 2;

  // 在中間繪製影像
  image(video, offsetX, offsetY, displayW, displayH);

  // 如果模型還沒準備好，不執行後續繪製
  if (!isModelLoaded) {
    return;
  }

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 設定連線與點的顏色（左手洋紅，右手黃色）
        let handColor = hand.handedness === "Left" ? color(255, 0, 255) : color(255, 255, 0);
        
        // 定義連線群組：0-4 (大拇指), 5-8 (食指), 9-12 (中指), 13-16 (無名指), 17-20 (小拇指)
        let fingerParts = [
          [0, 1, 2, 3, 4],
          [5, 6, 7, 8],
          [9, 10, 11, 12],
          [13, 14, 15, 16],
          [17, 18, 19, 20]
        ];

        // 1. 繪製手指連線
        stroke(handColor);
        strokeWeight(3);
        for (let part of fingerParts) {
          for (let i = 0; i < part.length - 1; i++) {
            let p1 = hand.keypoints[part[i]];
            let p2 = hand.keypoints[part[i + 1]];
            
            let x1 = map(p1.x, 0, video.width, offsetX, offsetX + displayW);
            let y1 = map(p1.y, 0, video.height, offsetY, offsetY + displayH);
            let x2 = map(p2.x, 0, video.width, offsetX, offsetX + displayW);
            let y2 = map(p2.y, 0, video.height, offsetY, offsetY + displayH);
            
            line(x1, y1, x2, y2);
          }
        }

        // 2. 繪製關鍵點圓圈
        noStroke();
        fill(handColor);
        for (let keypoint of hand.keypoints) {
          // 將偵測到的座標對應到縮放並置中後的影像區域
          let mappedX = map(keypoint.x, 0, video.width, offsetX, offsetX + displayW);
          let mappedY = map(keypoint.y, 0, video.height, offsetY, offsetY + displayH);
          circle(mappedX, mappedY, 16);
        }
      }
    }
  }
}
