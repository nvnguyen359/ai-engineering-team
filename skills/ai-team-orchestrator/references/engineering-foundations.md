# Nền Móng Kỹ Thuật Mọi Dự Án Công Nghệ (Engineering Foundations Canon)

Tài liệu nền móng dùng chung cho toàn bộ đội ngũ AI (`An`, `Minh`, `Tin`, `Long`, `Linh`, `Khanh`, `Hung`) khi xây dựng, nâng cấp hoặc cứu hộ **bất kỳ dự án công nghệ nào** (Web, Mobile, Desktop App, Backend/API, Realtime/Media, Extension, Cloud/Edge).

---

## 1. Tủ Sách Kinh Điển Gối Đầu Giường Theo Trục Kiến Thức

| Trục kiến thức | Tác phẩm kinh điển | Tinh hoa cốt lõi áp dụng vào thực chiến |
| :--- | :--- | :--- |
| **Tư duy Kỹ sư & Craftsmanship** | *The Pragmatic Programmer* (Hunt & Thomas)<br>*A Philosophy of Software Design* (Ousterhout)<br>*Software Engineering at Google* (Winters et al.) | DRY (Single Source of Truth), Orthogonality (giảm dính chùm), Deep Modules (giao diện đơn giản, che giấu phức tạp bên trong), Tracer Bullets, không để "Broken Windows", tối ưu cho khả năng đọc & bảo trì dài hạn (Hyrum's Law). |
| **Kiến trúc Phần mềm** | *Clean Architecture* (Robert C. Martin)<br>*Software Architecture: The Hard Parts* (Ford et al.)<br>*Domain-Driven Design* (Eric Evans) | 9 nguyên tắc (SoC, Modularity, Abstraction, KISS, DRY, YAGNI, SOLID, Demeter, Profile-first), Dependency Rule (Domain độc lập Framework/DB/UI), phân tích đánh đổi (*Trade-offs*), Bounded Context, ghi nhận **ADR** (Architecture Decision Records). |
| **Hệ thống Dữ liệu & Độ tin cậy** | *Designing Data-Intensive Applications — DDIA* (Kleppmann)<br>*Release It!* (Michael Nygard)<br>*Google SRE* (Beyer et al.)<br>*Systems Performance* (Brendan Gregg) | Storage & Indexing, Transactions & Idempotency, Schema Evolution tương thích ngược, Stability Patterns (**Timeouts, Circuit Breaker, Bulkhead, Backpressure, Graceful Degradation**), Observability (Logs/Metrics/Traces), **đo đạc (profile) trước khi tối ưu**. |
| **Giao diện & Trải nghiệm (UX/UI)** | *The Design of Everyday Things* (Don Norman)<br>*Refactoring UI* (Wathan & Schoger)<br>*Patterns.dev* | Affordances & Immediate Feedback, Visual Hierarchy, Tabular Nums cho số liệu live, Smart vs Dumb Components, Unidirectional Data Flow (Signals/MVI), Skeleton thay màn hình trắng, Empty State có CTA, Responsive 1 nguồn template + CSS Media Queries. |
| **Kiểm thử & Chất lượng (QA)** | *Unit Testing: Principles, Practices, and Patterns* (Khorikov)<br>*Working Effectively with Legacy Code* (Feathers) | 4 trụ cột test tốt (chống hồi quy, bền vững khi refactor, chạy nhanh, dễ bảo trì), kiểm thử hành vi thay vì chi tiết nội bộ, chỉ mock phụ thuộc ngoài biên (DB/Network/Hardware), phủ đủ **Happy Path + Edge Cases + Error Cases**, vệ sinh dữ liệu test cô lập & tự dọn rác. |
| **Bảo mật & Review Độc lập** | *OWASP Top 10 & Code Review Guide*<br>*Threat Modeling — STRIDE* (Adam Shostack)<br>*Web Security for Developers* (McDonald) | Phòng thủ theo chiều sâu (Defense in Depth): kiểm soát đầu vào chống Injection/Path Traversal/XSS/CSRF, phân quyền Least Privilege, tuyệt đối không hardcode secrets, không lộ stack trace nhạy cảm ra client production. |
| **Gỡ lỗi Khoa học (Debugging)** | *Debugging: The 9 Indispensable Rules* (David Agans) | Hiểu hệ thống trước khi sửa, tái hiện lỗi ổn định, **"Quit thinking and look"** (đo log/dữ liệu thực thay vì đoán mò), chia để trị (binary search), lưu dấu vết kiểm chứng. |

---

## 2. Mười Nguyên Lý Thực Chiến Chắt Lọc Từ Hệ Sinh Thái Đa Nền Tảng

1. **Map-First, Zero Blind Scan**: Luôn tra bản đồ kiến trúc/tài liệu dự án (`PROJECT_MAP.md`, `AGENTS.md`, `README.md`) trước khi quét rộng để giữ context sạch và định vị chính xác.
2. **Surgical Edits & Scope Discipline**: Sửa tối thiểu đúng phạm vi được giao; không tự ý refactor code đang chạy ổn; hỏi rõ ngay khi yêu cầu mơ hồ (No Blind Assumptions).
3. **Contract-First & Strict Enum Parity**: Backend, Frontend và Mobile phải đồng bộ tuyệt đối về Schema/DTO, API Response Envelope thống nhất, và dùng Enum chuẩn (cấm chuỗi magic literal tự do). Khi dự án có nhiều nền tảng (Desktop + Mobile), đảm bảo **Cross-Platform Parity** về nghiệp vụ, validation, trạng thái và bản dịch (i18n).
4. **Dual Deployment Readiness (Desktop/Edge & Cloud/Web)**:
   - Không hardcode đường dẫn tương đối khi chạy app đóng gói (dùng helper resolve resource an toàn).
   - Không để subprocess nhấp nháy cửa sổ hệ thống trên Windows (`CREATE_NO_WINDOW`), không bật auto-reload trong binary production, giữ console/service log an toàn encoding ASCII/UTF-8.
5. **Resource Lifecycle & Hardware Respect**: Mọi tài nguyên hệ thống (file, socket, DB session, video/audio stream, subprocess, timer, RxJS subscription) phải có vòng đời dọn dẹp chắc chắn (`try...finally`, context manager, `ngOnDestroy`/`takeUntilDestroyed`). Tôn trọng giới hạn vật lý của thiết bị (quota kết nối, CPU/RAM/Disk, Zero-Copy cho dữ liệu lớn).
6. **Safe Data Evolution & Quarantine**:
   - Nâng cấp DB bằng migration an toàn, không xóa dữ liệu/bảng production đột ngột.
   - Chống "Thành công ảo" (chỉ xác nhận hoàn tất khi mọi đầu ra thực tế hợp lệ); khi tiến trình xử lý gặp lỗi liên tiếp, **cách ly (Quarantine)** thay vì xóa mất dữ liệu gốc hay để vòng lặp treo CPU vô hạn.
7. **The "3-Strikes" Evidence Rule**: Nếu sửa một lỗi 3 lần liên tiếp chưa dứt điểm → **DỪNG đoán mò ngay lập tức**. Chèn telemetry/log để thu thập dữ liệu runtime thật rồi mới phân tích và vá đúng gốc.
8. **Zero-Trash Testing Hygiene**: Toàn bộ test/benchmark phải nằm tập trung trong thư mục `tests/`, cô lập dữ liệu vào thư mục tạm (`tmp_path`/`tempfile`) hoặc DB in-memory, và **tự động dọn sạch 100%** file tạm sau khi chạy xong (kể cả lúc fail).
9. **Observability & Self-Healing Design**: Thiết kế hệ thống biết tự chẩn đoán (health check, rotating logs, metrics nhẹ, circuit breaker/retry có giới hạn + backoff) thay vì im lặng chết ngầm hoặc spam cảnh báo vô tận.
10. **Documentation & Onboarding Always In Sync**: Mọi thay đổi kiến trúc, component tái sử dụng hoặc giao diện quan trọng phải được cập nhật đồng bộ vào tài liệu dự án, i18n và hướng dẫn người dùng.
