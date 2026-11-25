# Tổ Hợp Đội Nhóm Chuẩn (Team Composition Presets)

Chọn nhanh đội hình phù hợp với từng loại công việc (chỉ triệu tập đúng thành viên mang lại giá trị thực).

---

## 1. Architecture Debate / RFC Squad (Khởi tạo dự án mới & Quyết định kiến trúc lớn)
- **Khi dùng**: Xây nền móng dự án mới, đổi kiến trúc lõi, thiết kế hệ thống đa nền tảng (Web/Desktop/Mobile), hoặc có > 1 hướng giải cần tranh biện.
- **Đội hình**: `Minh · Architect` (`pro`) đề xuất 2 phương án + trade-offs → `Long` (`pro`), `Linh` (`flash`/`pro`), `Khanh` (`flash`), `Hung` (`pro`) **phản biện chéo đa góc nhìn** → `An · Tech Lead` (`inherit`) tổng hợp Mini-ADR chốt với người dùng.
- **Dòng báo mẫu**:
  > 🤖 **Đội hình AI:** `An · Tech Lead` (`inherit`) điều phối ADR · `Minh · Architect` (`pro`) đề xuất kiến trúc · `Long · Backend` (`pro`) & `Linh · Frontend` (`flash`) phản biện thực thi · `Hung · Reviewer` (`pro`) Red-Team bảo mật

## 2. Feature Fullstack Squad (Tính năng mới Backend + Frontend / Cross-Platform)
- **Đội hình**: `Minh · Architect` (`pro`) chốt Contract/Enum → `Long · Backend` (`pro`/`flash`) + `Linh · Frontend` (`flash`) triển khai song song → `Khanh · QA` (`flash`) kiểm thử Happy/Edge/Error → `Hung · Reviewer` (`pro`) tổng duyệt.
- **Dòng báo mẫu**:
  > 🤖 **Đội hình AI:** `An · Tech Lead` (`inherit`) điều phối · `Minh · Architect` (`pro`) chốt contract · `Long · Backend` (`pro`) & `Linh · Frontend` (`flash`) triển khai song song · `Khanh · QA` (`flash`) kiểm chứng

## 3. Deep Bug Hunt Squad (Điều tra & sửa lỗi khó)
- **Đội hình**: `Tin · Scout` (`flash_lite`) khoanh vùng log & blast-radius → `Long · Backend` hoặc `Linh · Frontend` (`pro`) truy gốc (tuân thủ 3-Strikes) & vá tối thiểu → `Khanh · QA` (`flash`) viết regression test.
- **Dòng báo mẫu**:
  > 🤖 **Đội hình AI:** `An · Tech Lead` (`inherit`) điều phối · `Tin · Scout` (`flash_lite`) khoanh vùng log · `Long · Backend` (`pro`) vá gốc lỗi · `Khanh · QA` (`flash`) viết test chống tái phát

## 4. UI/UX Polish Squad (Thiết kế & nâng cấp giao diện Desktop + Mobile)
- **Đội hình**: `Linh · Frontend` (`flash`, nâng `pro` nếu state khó) đóng gói component DRY + Material 3 + responsive + i18n + build → `Browser` (`inherit`, tùy chọn) kiểm tra trực quan → `Hung · Reviewer` (`pro`, tùy chọn) soát leak & chất lượng.
- **Dòng báo mẫu**:
  > 🤖 **Đội hình AI:** `Linh · Frontend` (`flash`) thiết kế UI responsive & build · `Hung · Reviewer` (`pro`) soát chất lượng & i18n

## 5. Audit & Refactor Squad (Rà soát diện rộng / Chuẩn hóa dự án)
- **Đội hình**: `Tin · Scout` (`flash_lite`) lập danh sách phạm vi → `Minh · Architect` (`pro`) chia lô an toàn → fan-out song song (`run_workflow` hoặc subagents độc lập) → `Khanh · QA` (`flash`) & `Hung · Reviewer` (`pro`) tổng duyệt.
- **Dòng báo mẫu**:
  > 🤖 **Đội hình AI:** `Tin · Scout` (`flash_lite`) kiểm kê · `Minh · Architect` (`pro`) chia lô · `Khanh · QA` (`flash`) & `Hung · Reviewer` (`pro`) tổng duyệt

## 6. Release & QA Gate Squad (Kiểm định trước khi Merge / Build / Release)
- **Đội hình**: `Khanh · QA` (`flash`) chạy toàn bộ test & build gate + kiểm tra 0 file rác → `Hung · Reviewer` (`pro`) review `git diff` & bảo mật OWASP/STRIDE.
- **Dòng báo mẫu**:
  > 🤖 **Đội hình AI:** `Khanh · QA` (`flash`) chạy test & build gate · `Hung · Reviewer` (`pro`) tổng duyệt diff & bảo mật

---

## Quy tắc Bàn giao (Handoff Contract)
Mọi lời giao việc (`Prompt`) cho thành viên PHẢI nêu rõ 5 ý ngắn:
1. **Mục tiêu cụ thể** cần trả lời, phản biện hoặc đầu ra cần hoàn thành.
2. **Phạm vi file được đọc / sửa** (không dẫm chân nhau khi chạy song song).
3. **Ràng buộc riêng của dự án** (workspace `.agents/AGENTS.md` + `engineering-foundations.md`).
4. **Góc nhìn phản biện cần kiểm tra** (nếu đang ở bước tranh biện chéo).
5. **Định dạng báo cáo**: đường dẫn file, dòng code, kết quả test/build thực tế và rủi ro còn lại.
