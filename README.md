# Cubewise

Học giải Rubik 3x3 từ con số 0, và hiểu vì sao từng nước đi hoạt động.

Cubewise là một web app cài được lên màn hình chính (PWA), chạy cả khi không có mạng. Mọi tiến độ lưu ngay trên máy, không cần tài khoản.

## Có gì trong bản này

- **Khối 3D** kéo để xoay, bấm R L U D F B để vặn.
- **12 bài học, cấp 0 đến 2**: ba loại mảnh, ký hiệu, gỡ ngược công thức, phương pháp tầng-theo-tầng (7 bước), commutator và liên hợp. Mỗi bài chạy từng nước trên khối 3D, làm mờ các mảnh không liên quan, làm sáng mảnh cần theo dõi, và kết thúc bằng một câu hỏi "vì sao".
- **Đồng hồ** giữ-thả kiểu speedcubing, scramble 20 nước hiện luôn trên khối, Ao5, Ao12, kỷ lục.
- **Hành trình**: 7 cấp, mỗi cấp mở bằng một mốc thật (học xong bài, tự giải được khối, Ao12 dưới 2 phút...). XP, level và 13 thành tựu.

## Cài lên iPhone

Mở link trang bằng Safari, bấm Chia sẻ, chọn **Thêm vào MH chính**.

## Chạy trên máy

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # bản production trong dist/
```

## Cấu trúc

| File | Nội dung |
| --- | --- |
| `src/cube.js` | Khối 3D (three.js): vặn mặt có hoạt ảnh, làm mờ, làm sáng mảnh |
| `src/lessons.js` | Nội dung bài học và các cấp |
| `src/store.js` | Lưu tiến độ, XP, Ao5/Ao12 |
| `src/main.js` | Giao diện và luồng màn hình |

Hướng khối: vàng trên, trắng dưới, xanh lá trước, cam phải, đỏ trái, xanh dương sau.

## Triển khai

Mỗi lần đẩy lên `main`, GitHub Actions build và đăng lên GitHub Pages.
