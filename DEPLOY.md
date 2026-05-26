# Deploy Block Blast BVB

## 🚀 Tùy chọn Deploy

### ✅ Option 1: GitHub Pages + Vercel (Khuyến nghị)
- **Frontend**: GitHub Pages (https://phamanhduc147862.github.io/block-blast-bvb/)
- **Backend**: Vercel (https://your-app.vercel.app)
- **Kết quả**: ✅ Multiplayer + ✅ Global Leaderboard

### ✅ Option 2: Vercel Full Stack
- **Frontend + Backend**: Vercel (cùng 1 domain)
- **Kết quả**: ✅ Multiplayer + ✅ Global Leaderboard

### ❌ Option 3: GitHub Pages Only
- **Frontend**: GitHub Pages
- **Kết quả**: ✅ Single Player Only (Multiplayer disabled)

---

## 📦 Deploy lên Vercel (Full Stack - Recommended)

### Bước 1: Push code lên GitHub
```bash
# Đổi tên branch
git branch -m master main
git push -u origin main
```

### Bước 2: Tạo Vercel Account
1. Vào https://vercel.com
2. Click **Sign Up** → chọn **GitHub**
3. Authorize Vercel

### Bước 3: Import Project
1. Dashboard Vercel → **Add New** → **Project**
2. Chọn repo `block-blast-bvb`
3. Click **Import**

### Bước 4: Configure Project
Ở trang **Configure Project**:

| Trường | Giá trị |
|-------|--------|
| **Framework Preset** | Node.js |
| **Root Directory** | `.` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Output Directory** | `public` |

### Bước 5: Deploy
Click **Deploy** → Đợi ✅ (khoảng 1-2 phút)

### Bước 6: Lấy URL
Sau deploy xong, Vercel sẽ show URL:
```
https://block-blast-bvb-phamanhduc147862.vercel.app
```

✅ Multiplayer + Leaderboard sẽ tự động hoạt động!

---

## 📦 Deploy lên GitHub Pages (Single Player Only)

### Bước 1: Cấu hình GitHub Pages
1. Settings → **Pages**
2. Source: `gh-pages` branch
3. Folder: `/ (root)`

### Bước 2: Push code
```bash
git branch -m master main
git push -u origin main
```

Workflow sẽ tự động deploy tới:
```
https://phamanhduc147862.github.io/block-blast-bvb/
```

⚠️ **Lưu ý**: Multiplayer & Global Leaderboard sẽ disable

---

## 🌐 Deploy lên GitHub Pages + Vercel Backend (Advanced)

### Bước 1: Deploy Backend trên Vercel
(Làm theo hướng dẫn Vercel Full Stack ở trên)

### Bước 2: Lấy Vercel URL
```
https://your-vercel-app.vercel.app
```

### Bước 3: Sửa network.js để kết nối backend
Sửa `public/js/network.js` dòng 2-10:

```javascript
// Config Socket.io server
let SOCKET_SERVER = null;

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  // Local development
  SOCKET_SERVER = 'http://localhost:3000';
} else if (window.location.hostname.includes('github.io')) {
  // GitHub Pages - connect to Vercel backend
  SOCKET_SERVER = 'https://your-vercel-app.vercel.app';
} else if (window.location.hostname.includes('vercel.app')) {
  // Production on Vercel - connect to same domain
  SOCKET_SERVER = `https://${window.location.hostname}`;
}

window.socket = SOCKET_SERVER ? io(SOCKET_SERVER, { reconnection: true }) : null;
window.isMultiplayer = false;
```

### Bước 4: Deploy Frontend GitHub Pages
```bash
git push origin main
```

✅ Multiplayer + Global Leaderboard sẽ hoạt động!

---

## 🐛 Troubleshooting

### Multiplayer không hoạt động?
- Kiểm tra Console (F12) xem có error gì
- Chắc chắn Vercel URL đúng trong `network.js`
- Chắc chắn Vercel app đang chạy (check Vercel Dashboard)

### Leaderboard không save?
- Leaderboard chỉ lưu khi có server
- Nếu dùng GitHub Pages, leaderboard sẽ lưu cục bộ (localStorage)
- Nếu dùng Vercel, leaderboard sẽ global (server memory)

### Socket.io không connect?
- Kiểm tra CORS policy trên server
- Vercel mặc định đã cho phép CORS

---

## 📝 File thay đổi
- `.github/workflows/deploy.yml` - Workflow tự động deploy GitHub Pages
- `public/js/network.js` - Config socket server auto-detect
- `public/js/auth.js` - Xử lý leaderboard
- `vercel.json` - Config Vercel
- `server.js` - Backend server

**Happy gaming!** 🎮

