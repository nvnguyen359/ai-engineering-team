# Tổ Hợp Đội Nhóm Chuẩn (Team Composition Presets)

Chọn nhanh đội hình phù hợp với từng loại công việc (chỉ gọi đúng thành viên cần thiết).

---

## 1. Feature Fullstack Squad (Tính năng mới Backend + Frontend)
- **Đội hình**: `Minh · Architect` (`pro`) → `Long · Backend` (`pro`/`flash`) + `Linh · Frontend` (`flash`) song song → `Khanh · QA` (`flash`) → `Hung · Reviewer` (`pro`).
- **Dòng báo mẫu**:
  > 🤖 **Đội hình AI:** `An · Tech Lead` (`inherit`) điều phối · `Minh · Architect` (`pro`) chốt thiết kế · `Long · Backend` (`pro`) & `Linh · Frontend` (`flash`) triển khai song song · `Khanh · QA` (`flash`) kiểm chứng

## 2. Deep Bug Hunt Squad (Điều tra & sửa lỗi khó)
- **Đội hình**: `Tin · Scout` (`flash_lite`) gom bằng chứng & log → `Long · Backend` hoặc `Linh · Frontend` (`pro`) vá gốc lỗi tối thiểu → `Khanh · QA` (`flash`) viết regression test.
- **Dòng báo mẫu**:
  > 🤖 **Đội hình AI:** `An · Tech Lead` (`inherit`) điều phối · `Tin · Scout` (`flash_lite`) khoanh vùng log · `Long · Backend` (`pro`) vá gốc lỗi · `Khanh · QA` (`flash`) viết test chống tái phát

## 3. UI/UX Polish Squad (Thiết kế & nâng cấp giao diện Desktop + Mobile)
- **Đội hình**: `Linh · Frontend` (`flash`, nâng `pro` nếu state phức tạp) làm UI DRY + responsive + i18n + build → `Browser` (`inherit`, tùy chọn) kiểm tra trực quan → `Hung · Reviewer` (`pro`, tùy chọn) soát chất lượng.
- **Dòng báo mẫu**:
  > 🤖 **Đội hình AI:** `Linh · Frontend` (`flash`) thiết kế UI responsive & build · `Hung · Reviewer` (`pro`) soát chất lượng & i18n

## 4. Audit & Refactor Squad (Rà soát diện rộng / Chuẩn hóa dự án)
- **Đội hình**: `Tin · Scout` (`flash_lite`) lập danh sách phạm vi → `Minh · Architect` (`pro`) chia lô an toàn → fan-out song song (`run_workflow` hoặc subagents theo lô file độc lập) → `Khanh · QA` (`flash`) & `Hung · Reviewer` (`pro`).
- **Dòng báo mẫu**:
  > 🤖 **Đội hình AI:** `Tin · Scout` (`flash_lite`) kiểm kê · `Minh · Architect` (`pro`) chia lô · `Khanh · QA` (`flash`) & `Hung · Reviewer` (`pro`) tổng duyệt

## 5. Release & QA Gate Squad (Kiểm định trước khi Merge / Build / Release)
- **Đội hình**: `Khanh · QA` (`flash`) chạy toàn bộ test & build check → `Hung · Reviewer` (`pro`) review `git diff` & bảo mật.
- **Dòng báo mẫu**:
  > 🤖 **Đội hình AI:** `Khanh · QA` (`flash`) chạy test & build gate · `Hung · Reviewer` (`pro`) tổng duyệt diff & bảo mật

---

## Quy tắc Bàn giao (Handoff Contract)
Mọi lời giao việc (`Prompt`) cho thành viên PHẢI nêu rõ 4 ý ngắn:
1. **Mục tiêu cụ thể** cần trả lời hoặc đầu ra cần hoàn thành.
2. **Phạm vi file được đọc / sửa** (không dẫm chân nhau khi chạy song song).
3. **Ràng buộc riêng của dự án** (nếu workspace có `.agents/AGENTS.md`).
4. **Định dạng báo cáo**: đường dẫn file, dòng code, kết quả test/build thực tế và rủi ro còn lại.
