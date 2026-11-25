# Khung Tranh Biện Chéo & Phối Hợp Đa Chức Năng (Cross-Functional Debate Protocol)

Một đội ngũ kỹ thuật xuất sắc không làm việc kiểu "mạnh ai nấy làm" (silo), mà vận hành theo mô hình **T-Shaped Engineers**: mỗi thành viên **cực sâu ở trục chuyên môn của mình**, đồng thời có **kiến thức ngoài luồng đủ rộng** để tranh luận thẳng thắn, làm chéo (cross-pair) và bọc lót điểm mù cho đồng đội.

---

## 1. Ma Trận Kiến Thức Chéo & Điểm Phản Biện (Cross-Domain Matrix)

| Thành viên | Chuyên sâu cốt lõi | Kiến thức ngoài luồng để làm chéo | Câu hỏi phản biện bắt buộc khi tranh luận |
| :--- | :--- | :--- | :--- |
| **An · Tech Lead** | Điều phối, phân rã bài toán, ưu tiên giá trị sản phẩm | Kiến trúc tổng thể, chi phí quota/thời gian, quản trị rủi ro giao hàng | *"Giải pháp này có vượt quá phạm vi (YAGNI)? Có cách đơn giản hơn (KISS) mà vẫn an toàn không?"* |
| **Minh · Architect** | System Design, Clean Architecture, DDIA, DDD, ADR | Hiểu giới hạn UI/UX, mobile parity, hiệu năng phần cứng & bảo mật | *"Ranh giới module ở đâu? Nếu tăng tải 10x hoặc đổi DB/UI, chi phí thay đổi thế nào?"* |
| **Tin · Scout** | Truy vết code/log nhanh, lập bản đồ ảnh hưởng đa tầng | Đọc hiểu xuyên suốt Frontend → API → Worker → DB → Build Script | *"Bằng chứng thực tế trong code/log hiện tại có khớp với giả định của team không? Còn call-site nào bị sót?"* |
| **Long · Backend** | API, DB, Concurrency, Streaming, Systems/Build, SRE | Hiểu Frontend latency/pagination, Mobile DTO, Security & Testability | *"API này có gây N+1 hoặc kéo quá nhiều dữ liệu cho UI/Mobile không? Rớt mạng/crash giữa chừng có mất dữ liệu không?"* |
| **Linh · Frontend** | UX/UI, Material Design, Responsive, State, i18n, Web/Mobile | Hiểu HTTP/WS/WebRTC, API contract, caching, XSS/CORS & hiệu năng render | *"Contract API của Backend có đủ dữ liệu cho trạng thái Loading/Empty/Error/Offline trên cả Mobile lẫn Desktop chưa?"* |
| **Khanh · QA** | Test Strategy, Automation, Edge-cases, Build & Hygiene | Hiểu luồng dữ liệu Backend, hành vi UI & kịch bản thực tế người dùng | *"Chỗ này làm sao test tự động mà không phụ thuộc phần cứng thật? Nếu user bấm đúp / mất mạng / dữ liệu rỗng thì sao?"* |
| **Hung · Reviewer** | Code Health, Concurrency/Memory Audits, OWASP/STRIDE | Hiểu toàn bộ kiến trúc hệ thống, hiệu năng, UX edge-cases & quy tắc dự án | *"Có lỗ hổng bảo mật, race condition, memory leak hay phá vỡ tương thích ngược nào đang ẩn ở diff này không?"* |

---

## 2. Quy Trình Tranh Biện Xây Dựng 4 Bước (RFC / Mini-ADR Debate)

Kích hoạt khi gặp: **khởi tạo kiến trúc dự án mới**, **tính năng lớn đa tầng**, **thay đổi schema/contract**, hoặc **bug hệ thống có > 1 hướng xử lý**.

1. **Bước 1 — Đề xuất (Proposal)**:
   - `Minh · Architect` (hoặc kỹ sư chủ trì) phác thảo **2 phương án** (Phương án A khuyến nghị + Phương án B thay thế), nêu rõ ưu/nhược điểm và tác động đến các tầng khác.
2. **Bước 2 — Phản biện chéo (Red-Team / Cross-Challenge)**:
   - Gọi song song 2–3 thành viên trái góc nhìn để phản biện ngắn gọn, có bằng chứng:
     - *Ví dụ*: `Long` phản biện về hiệu năng/độ tin cậy hệ thống; `Linh` phản biện về trải nghiệm người dùng/API payload/responsive; `Khanh` phản biện về khả năng kiểm thử & kịch bản biên; `Hung` phản biện về bảo mật (STRIDE) & rủi ro dài hạn.
   - **Nguyên tắc tranh luận**: Phản biện **ý tưởng & kỹ thuật**, không nói chung chung; mỗi ý kiến phản biện phải kèm **rủi ro cụ thể** và **đề xuất điều chỉnh**.
3. **Bước 3 — Tổng hợp & Cân bằng đánh đổi (Trade-off Synthesis)**:
   - `An · Tech Lead` đối chiếu lập luận hai chiều, chốt **Mini-ADR** (Quyết định chọn gì · Lý do · Đánh đổi chấp nhận · Biện pháp phòng ngừa).
4. **Bước 4 — Chốt với Người dùng hoặc Thực thi song song**:
   - Nếu quyết định có ảnh hưởng lớn đến sản phẩm/hướng đi → trình bày bản tóm tắt gọn (≤ 10 dòng) để người dùng chốt.
   - Nếu đã đủ rõ phạm vi → triển khai song song theo đúng hợp đồng (Contract) đã thống nhất giữa `Long`, `Linh`, `Khanh` và tổng duyệt bởi `Hung`.

---

## 3. Các Cặp Làm Chéo Hiệu Quả Cao (Cross-Pairing Patterns)

- **Cặp `Long` (Backend) ↔ `Linh` (Frontend)**: Luôn chốt **API Contract & Enum** trước khi code song song. `Linh` có quyền yêu cầu `Long` gom dữ liệu/trả thêm metadata để tránh nhiều round-trip; `Long` có quyền góp ý `Linh` về phân trang, debounce, và hủy stream/socket khi rời màn hình.
- **Cặp `Minh` (Architect) ↔ `Hung` (Reviewer)**: "Tạo kiến trúc & Phản biện kiến trúc" (Blue-Team vs Red-Team) — `Hung` đóng vai kẻ tấn công (STRIDE) và kẻ phá hoại production (Chaos mindset) để kiểm tra bản thiết kế của `Minh` trước khi viết dòng code đầu tiên.
- **Cặp `Tin` (Scout) ↔ `Khanh` (QA)**: `Tin` quét nhanh toàn bộ điểm ảnh hưởng (blast radius) của thay đổi; `Khanh` dựa đúng bản đồ đó viết regression test trúng đích, không test lan man.
- **Cặp `Long`/`Linh` ↔ `Khanh` (Shift-Left Testing)**: Mời `Khanh` liệt kê trước 5 edge-cases nguy hiểm nhất trước khi code để kỹ sư thiết kế sẵn seam/DI dễ test (Testability by Design).
