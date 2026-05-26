# Deploy Block Blast BVB lên GitHub Pages

## 🚀 Hướng dẫn Deploy

### Bước 1: Đổi tên branch sang `main`
```bash
git branch -m master main
git push -u origin main
```

### Bước 2: Cấu hình GitHub Pages
1. Vào **Settings** → **Pages**
2. Chọn **Source**: Deploy from a branch
3. Chọn branch: **gh-pages**
4. Chọn folder: **/ (root)**

### Bước 3: Tự động Deploy
Mỗi khi bạn push lên branch `main`:
```bash
git push origin main
```

Workflow sẽ tự động:
1. Build dự án
2. Deploy lên branch `gh-pages`
3. Hiển thị tại: `https://phamanhduc147862.github.io/block-blast-bvb/`

---

## ⚠️ Lưu ý Quan Trọng

### Tính năng khả dụng
✅ **Chơi Đơn** (Single Player)  
✅ **Bảng Xếp Hạng cục bộ**  
✅ **Lưu tên người chơi**

### Tính năng không khả dụng
❌ **Chơi Multiplayer** (Vì GitHub Pages không có server Node.js)  
❌ **Leaderboard Global** (Cần server để lưu dữ liệu)

---

## 🔧 Để enable Multiplayer & Leaderboard Global

Bạn cần deploy server riêng trên:
- **Vercel** (miễn phí, recommend)
- **Railway** (miễn phí)
- **Render** (miễn phí)

### Setup với Vercel:
1. Push code lên GitHub
2. Vào https://vercel.com → Import project
3. Vercel sẽ auto detect `vercel.json`
4. Deploy (sẽ có cả frontend + backend)
5. Sửa `network.js` line 2-6 để point tới Vercel URL:

```javascript
const SOCKET_SERVER = 'https://your-vercel-app.vercel.app';
window.socket = io(SOCKET_SERVER, { reconnection: true });
```

---

## 📝 File thay đổi
- `.github/workflows/deploy.yml` - Workflow tự động deploy
- `public/js/network.js` - Config socket server
- `public/js/auth.js` - Xử lý leaderboard
- `vercel.json` - Config để deploy lên Vercel

**Happy gaming!** 🎮
