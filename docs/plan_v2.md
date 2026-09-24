# PLAN v2 — Phát triển tiếp SMARTHRM (Admin ⇄ API ↔ Mobile)

> **Trạng thái:** OPEN · Khởi tạo 2026-08-17
> **Tiền đề:** `plan.md` **COMPLETE / CLOSED (v1)** — Web Admin §0.1 + Phase M Mobile v1 DONE.
> **Vận hành:** `HDSD.md`.
> **Quy ước:** Loại nghỉ = **DayOffConfig** (`DayOffConfigId` / Code / Name) — không còn `DayOffType`.

---

## 0. Mục tiêu v2

Nâng từ **HRM vận hành đủ** (v1) lên **HRM trải nghiệm realtime + sâu nghiệp vụ VN**:

1. **Push & engagement** — FCM, deep-link duyệt đơn / phiếu lương / sinh nhật
2. **Chấm công tin cậy** — offline sync · (sau) Face / QR
3. **Leave & Payroll sâu** — hourly · thâm niên/carry · formula · so sánh kỳ · khiếu nại lương
4. **Tích hợp thật** — SSO OIDC · Zalo/SMS production (bỏ stub)
5. **People ops** — onboarding + e-Sign · eNPS · JobGrade · Shift instance

Ký hiệu: **P0** (làm trước) · **P1** · **P2** · **P3** (hardware / vendor).

---

## 0.1 Bản đồ wave đề xuất

```text
Wave V2-A  Platform + Push foundation     (P0)  ~1–2 tuần
Wave V2-B  Leave & Payroll depth          (P0–P1)
Wave V2-C  Integrations production        (P1)
Wave V2-D  Offline punch + Time polish    (P1)
Wave V2-E  People ops (onboarding/eNPS)   (P1–P2)
Wave V2-F  Hardware / Face·QR·chat        (P3)
```

Mỗi hạng mục xong: cập nhật **`HDSD.md`** mục tương ứng + đánh dấu `[x]` bên dưới.

---

## 1. Wave V2-A — Platform & Push (P0)

### A1. Auth polish — **DONE** (2026-08-17)

| #    | Việc                                                          | TT |
| ---- | -------------------------------------------------------------- | -- |
| A1.1 | Light`/me` vs heavy `/profile`                             | ✅ |
| A1.2 | Cache IP allowlist (TTL ~45s + invalidate CRUD)                | ✅ |
| A1.3 | `ILogger` thay `Console.WriteLine` hot path                | ✅ |
| —   | Admin session email + light`/me` F5                          | ✅ |
| —   | Mobile skip heavy profile sau login · light`initializeAuth` | ✅ |

> Chi tiết đã gộp vào codebase; file `optimize-authentication.md` đã xoá sau khi DONE.

- [X] A1.1 Light me
- [X] A1.2 IP allowlist cache
- [X] A1.3 ILogger

### A2. FCM Push infra

| #    | Việc                 | API                                                               | Admin                                     | Mobile                                |
| ---- | --------------------- | ----------------------------------------------------------------- | ----------------------------------------- | ------------------------------------- |
| A2.1 | Device token registry | `DeviceToken` entity + register/unregister                      | —                                        | Expo Notifications register sau login |
| A2.2 | Send hooks            | Leave decide · Payslip finalize · Birthday job · Late reminder | Template map (reuse NotificationTemplate) | Deep-link → inbox / leave / salary   |
| A2.3 | Preferences           | Optional mute per type                                            | System settings toggle test-send          | Settings bật/tắt loại thông báo  |

**Done khi:** duyệt phép / chốt lương / sinh nhật → push tới app (dev + staging).

- [ ] A2.1 Device tokens
- [ ] A2.2 Send hooks (leave · payslip · birthday · late)
- [ ] A2.3 Preferences

### A3. Soft-delete purge thật

- [ ] Retention worker hard-delete theo policy (bỏ stub) + ActionLog

---

## 2. Wave V2-B — Leave & Payroll depth (P0–P1)

### B1. Nghỉ theo giờ (hourly leave)

- [ ] API: `LeaveSession` mở rộng / `Hours` + quy đổi ngày theo Shift/WorkPattern
- [ ] Admin: DayOffConfig flag `AllowHourly` · balance deduct theo giờ
- [ ] Mobile: form chọn giờ bắt đầu–kết thúc · preview days/hours

### B2. Cấp phép tự động (thâm niên / HĐ) + carry-over

- [ ] API: rule engine theo thâm niên / ContractType · year-end carry %/max
- [ ] Admin: cấu hình trên DayOffConfig + job cấp quỹ đầu năm
- [ ] Mobile: balance hiển thị *carried* vs *new*

### B3. Payroll polish

- [ ] Liên kết tăng lương ↔ `EmployeeSalaryHistory` (từ approve raise / finalize)
- [ ] So sánh kỳ lương (period-diff report) Admin `/reports` hoặc payroll
- [ ] Formula engine chung cho SalaryConfig line (expression an toàn)
- [ ] Payslip PDF + email (không chỉ HTML) · hook FCM “phiếu mới”
- [ ] Mobile: **khiếu nại lương** (entity + workflow + HR inbox Admin)

---

## 3. Wave V2-C — Integrations production (P1)

### C1. SSO Google / Microsoft

- [ ] API: OIDC token exchange thật (bỏ subject stub / `501` khi thiếu config)
- [ ] Admin: Security settings callback URL · test login
- [ ] Mobile: (tuỳ chọn sau) OAuth / enterprise SSO

### C2. Zalo OA / SMS thật

- [ ] API: provider SDK (Zalo OA · SMS gateway) thay “stub OK”
- [ ] Admin: giữ `/integrations/*` + test-send + delivery log
- [ ] Template gắn event (OTP · duyệt · lương)

### C3. Tuyển dụng mở rộng

- [ ] Email template tự động theo stage (Interview / Offer / Reject)
- [ ] (Tuỳ chọn) Import CV / webhook jobboard

---

## 4. Wave V2-D — Timekeeping tin cậy (P1)

### D1. Offline punch + sync

- [ ] Mobile: queue local (SQLite/AsyncStorage) · retry · conflict UI
- [ ] API: batch punch idempotent (`clientPunchId`) · audit “delayed”
- [ ] Admin: báo cáo punch sync trễ / nghi ngờ

### D2. Time polish

- [ ] `ShiftEntity` / shift instance operable (override CN–ngày)
- [ ] JobGrade master (multi-band) gắn PositionMaster
- [ ] Real biometric app unlock (thay preference stub — LocalAuthentication ship đủ)

---

## 5. Wave V2-E — People ops (P1–P2)

### E1. Onboarding + e-Sign

- [ ] API: OnboardingChecklist template · task · signature blob/URL
- [ ] Admin: builder checklist theo ContractType / Position
- [ ] Mobile: hoàn thành task + ký điện tử

### E2. Truyền thông & khảo sát

- [ ] eNPS / pulse survey (API + Admin create/report + Mobile prompt)
- [ ] Feedback 1-1 Performance (thread riêng chu kỳ)
- [ ] Form đơn mua sắm / IT trên Mobile (consume FormTemplate)

### E3. Discipline / Training sâu

- [ ] Workflow duyệt biên bản kỷ luật đa bước
- [ ] Upload chứng chỉ đào tạo (file) + hạn dùng

### E4. Phúc lợi (thấp hơn)

- [ ] Claims / bảo hiểm bồi thường · OCR hóa đơn (vendor sau)

---

## 6. Wave V2-F — Hardware & realtime sâu (P3)

> Làm khi có thiết bị / vendor / ngân sách.

- [ ] Face Recognition punch (SDK / on-device)
- [ ] QR code quầy (rotate token + geofence quầy)
- [ ] Biometric device SDK (máy vân tay/khuôn mặt → ingest API)
- [ ] Chat / Zalo OA in-app messaging
- [ ] Multi-tenant UX sâu (switch company trên Mobile)
- [ ] Báo cáo gian lận chấm công nâng cao (GPS spoof heuristics)

---

## 7. Thứ tự triển khai khuyến nghị

```text
1  ~~V2-A1 Auth light me + IP cache + ILogger~~ — **DONE**
2  V2-A2 FCM (token → leave decide → payslip → birthday)
3  V2-B1 Hourly leave
4  V2-B2 Seniority + carry-over
5  V2-B3 Payroll history/compare + salary dispute + PDF/email
6  V2-C  SSO + Zalo/SMS thật
7  V2-D1 Offline punch
8  V2-E  Onboarding e-Sign · eNPS
9  V2-F  Face / QR / chat (khi sẵn sàng)
```

Convention module mới: giữ checklist mẫu trong **`plan.md` §4**.

---

## 8. Definition of Done (mỗi epic)

1. Domain + migration (nếu có) · Features · `api/v1/...`
2. Admin route ≤ 3 cấp + i18n VI/EN (nếu UX HR)
3. Mobile feature + i18n (nếu UX NV/QL)
4. Permission code + DataScope nếu cần
5. ActionLog cho action quan trọng
6. Cập nhật **`HDSD.md`**
7. Đánh `[x]` trong file này

---

## 9. Tài liệu liên quan

| File                                 | Vai trò                                             |
| ------------------------------------ | ---------------------------------------------------- |
| **`plan.md`**                | CLOSED v1 — lịch sử module đã xong              |
| **`plan_v2.md`** (file này) | Backlog mở phát triển tiếp                       |
| **`HDSD.md`**                | Hướng dẫn vận hành (cập nhật theo từng epic) |
| **`production.md`**          | Deploy · HTTPS · CORS · Mobile store · bán SaaS |

---

## 10. Tóm tắt ưu tiên (1 trang)

| Ưu tiên | Epic                                   | Giá trị                                |
| --------- | -------------------------------------- | ---------------------------------------- |
| P0        | FCM push                               | Engagement duyệt đơn / phiếu lương |
| P0        | Hourly leave + seniority/carry         | Đúng nghiệp vụ phép VN              |
| P1        | Payroll compare / PDF / salary dispute | Đóng vòng lương                     |
| P1        | SSO + Zalo/SMS thật                   | Go-live enterprise                       |
| P1        | Offline punch                          | Field / sóng yếu                       |
| P2        | Onboarding e-Sign · eNPS · JobGrade  | People ops                               |
| P3        | Face · QR · chat · device SDK       | Hardware                                 |

---

*Khởi tạo cùng lúc đóng `plan.md` v1 (2026-08-17). Bắt đầu từ **Wave V2-A**.*
