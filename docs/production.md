# PRODUCTION — Deploy & thương mại hoá SMARTHRM

> Tài liệu deploy end-to-end cho **HrmApi** (.NET) · **HrmAdmin** (Angular) · **HrmMobile** (Expo).  
> Vận hành nghiệp vụ: **`HDSD.md`**. Backlog tính năng: **`plan_v2.md`**.  
> Cập nhật: 2026-08-17.

---

## 0. Tổng quan kiến trúc production

```text
                    ┌─────────────────┐
   NV / QL          │  HrmMobile      │  App Store / Play / OTA (EAS)
   (HTTPS API)      │  Expo           │  EXPO_PUBLIC_API → https://api.../api/v1
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
   HR / Admin       │  HrmAdmin       │  Nginx / CDN / IIS static
   (HTTPS)          │  Angular dist/  │  environment.apiUrl → same API
                    └────────┬────────┘
                             │ HTTPS + CORS
                    ┌────────▼────────┐
                    │  HrmApi         │  Kestrel behind reverse proxy
                    │  WebApi         │  api/v1/* · JWT · Migrate on start
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
         PostgreSQL      Object storage     SMTP / SSO
         (UTF-8)         S3/Cloudinary   (email / OIDC)
```

| Thành phần | Runtime | Port dev | Prod gợi ý |
|---|---|---|---|
| **HrmApi** | .NET 10 / Kestrel | `5036` (HTTP) | `https://api.yourdomain.com` (443 → reverse proxy) |
| **HrmAdmin** | Static SPA | `4200` | `https://hrm.yourdomain.com` |
| **HrmMobile** | iOS / Android | Expo LAN | Store build + `EXPO_PUBLIC_API` |
| **PostgreSQL** | 14+ | `5432` | Managed DB (UTF-8) |

---

## 1. Checklist thương mại hoá (trước khi bán / go-live khách)

### 1.1 Bắt buộc (blocker)

- [ ] **HTTPS** toàn bộ (API + Admin + Mobile chỉ gọi HTTPS)
- [ ] **Đổi mật khẩu admin mặc định** (`admin` / `admin123@` từ seed — đổi ngay lần đầu)
- [ ] **JWT Secret** ≥ 32 ký tự, random, chỉ nằm env/secret store (không commit)
- [ ] **CORS** cho đúng origin Admin production (hiện code hardcode `localhost:4200` — xem §4.4)
- [ ] **Swagger tắt** trên production (hiện `IsDevelopment() \|\| true` — xem §4.5)
- [ ] **Connection string** production riêng; DB backup tự động
- [ ] **Upload** cấu hình Cloudinary **hoặc** S3 (không để trống)
- [ ] **SMTP** thật (quên mật khẩu / thông báo)
- [ ] Admin `environment.production.ts` trỏ **API public**, không còn `localhost:5036`
- [ ] Mobile release set `EXPO_PUBLIC_API=https://api…/api/v1`
- [ ] Smoke **HDSD §12** (GPS, ca, phép, RBAC, Mobile hub)

### 1.2 Nên có (commercial ready)

- [ ] Reverse proxy (Nginx / Caddy / IIS / Cloudflare) + HSTS
- [ ] Health check endpoint + uptime monitor
- [ ] Log tập trung (Seq / ELK / CloudWatch) + alert lỗi 5xx
- [ ] Backup DB hàng ngày + thử restore quý 1 lần
- [ ] IP allowlist (Admin API) nếu khách yêu cầu (§ HDSD bảo mật)
- [ ] 2FA bắt buộc cho role Admin / HR
- [ ] Điều khoản / Privacy / xử lý dữ liệu cá nhân (PDPA / Nghị định VN)
- [ ] Hợp đồng SLA (uptime, RPO/RTO)
- [ ] Gói license / tenant (multi-company đã có trong domain; UX switch sâu = `plan_v2`)

### 1.3 Tính năng vẫn stub / P2 (nói rõ với khách)

| Hạng mục | Hiện trạng | Ghi chú |
|---|---|---|
| SMS gateway | Stub send | Cấu hình DB có; gửi thật → `plan_v2` V2-C |
| Zalo OA | Stub / token DB | Idem |
| SSO Google/Microsoft | Config có; exchange production cần verify | `Authentication:*` trong appsettings |
| FCM push | Chưa | `plan_v2` V2-A2 |
| Face / QR punch | Chưa | `plan_v2` V2-F |
| Offline punch | Chưa | `plan_v2` V2-D |

---

## 2. Bí mật & cấu hình — tuyệt đối không commit

| Bí mật | Nơi cấu hình |
|---|---|
| DB password | `ConnectionStrings__DefaultConnection` / secret |
| `JwtSettings:Secret` | Env / Key Vault |
| SMTP password | `SMTP_*` hoặc `SmtpSettings` |
| Cloudinary / S3 keys | `UploadSettings` hoặc env `CLOUDINARY_*` / `AWS_S3_*` |
| Google/Microsoft ClientSecret | `Authentication:*` |
| Zalo / SMS API key | DB (Admin Integrations) |
| Mobile signing keys | EAS secrets / local keystore (không vào git) |

**Nên commit chỉ:** `appsettings.Example.json`, `.env.example`.  
**Không commit:** `appsettings.json` thật, `.env`, keystore, `*.p8`, `*.jks`.

Sao chép mẫu:

```powershell
cd HrmApi\HrmApi.WebApi
copy appsettings.Example.json appsettings.Production.json
copy .env.example .env
# Điền secret → KHÔNG git add
```

---

## 3. PostgreSQL

### 3.1 Yêu cầu

- PostgreSQL **14+**
- Encoding **UTF8** (API reject DB non-UTF8 lúc bootstrap)
- User riêng, quyền CRUD trên DB `HrmApiDb` (hoặc tên bạn chọn)

### 3.2 Tạo DB (ví dụ)

```sql
CREATE USER hrm_app WITH PASSWORD 'REPLACE_STRONG_PASSWORD';
CREATE DATABASE "HrmApiDb" WITH OWNER hrm_app ENCODING 'UTF8' TEMPLATE template0;
GRANT ALL PRIVILEGES ON DATABASE "HrmApiDb" TO hrm_app;
```

Connection string mẫu:

```text
Host=db.internal;Port=5432;Database=HrmApiDb;Username=hrm_app;Password=...;Encoding=UTF8;Client Encoding=UTF8;SSL Mode=Require
```

### 3.3 Migration

**Tự động:** mỗi lần start WebApi gọi `Database.MigrateAsync()` — đủ cho hầu hết deploy.

**Thủ công (CI/CD hoặc kiểm soát):**

```powershell
cd HrmApi
dotnet ef database update --project HrmApi.Infrastructure --startup-project HrmApi.WebApi
```

Sau migrate: đăng nhập Admin seed → **đổi mật khẩu ngay**.

### 3.4 Backup / restore

```bash
# Backup hàng ngày (cron)
pg_dump -Fc -h HOST -U hrm_app HrmApiDb -f /backup/hrm_$(date +%F).dump

# Restore thử
pg_restore -h HOST -U hrm_app -d HrmApiDb --clean /backup/hrm_YYYY-MM-DD.dump
```

Gợi ý RPO ≤ 24h · giữ bản 30 ngày · backup offsite.

---

## 4. Deploy HrmApi

### 4.1 Cấu hình production (appsettings / env)

Ưu tiên **environment variables** (Linux systemd / Docker / Azure):

| Key | Ví dụ |
|---|---|
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `ASPNETCORE_URLS` | `http://127.0.0.1:5036` (proxy terminate TLS) |
| `ConnectionStrings__DefaultConnection` | xem §3 |
| `JwtSettings__Secret` | random 64+ chars |
| `JwtSettings__Issuer` | `HrmApi` |
| `JwtSettings__Audience` | `HrmAdmin` |
| `JwtSettings__ExpiryInMinutes` | `120`–`720` (tuỳ chính sách) |
| `JwtSettings__RefreshTokenExpiryInDays` | `7` |
| `SmtpSettings__*` hoặc `SMTP_HOST`… | §2 |
| `UploadSettings__Cloudinary__*` hoặc `CLOUDINARY_*` | bắt buộc 1 provider |
| `Authentication__Google__*` / `Microsoft__*` | nếu bật SSO |

File `.env` cạnh WebApi cũng được load lúc start (dev/ops nhỏ) — production nên dùng secret manager.

### 4.2 Build & publish

```powershell
cd HrmApi
dotnet publish HrmApi.WebApi/HrmApi.WebApi.csproj -c Release -o ./publish
```

Chạy:

```powershell
cd publish
$env:ASPNETCORE_ENVIRONMENT="Production"
$env:ASPNETCORE_URLS="http://127.0.0.1:5036"
# + set connection / JWT …
dotnet HrmApi.WebApi.dll
```

### 4.3 Reverse proxy (Nginx mẫu)

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    client_max_body_size 100m;   # khớp limit upload API

    location / {
        proxy_pass         http://127.0.0.1:5036;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

systemd unit gợi ý: `WorkingDirectory=/opt/hrm/api`, `Restart=always`, user không phải root.

### 4.4 CORS — việc phải làm trước commercial

Hiện `Program.cs` chỉ allow `http://localhost:4200` (policy `AllowAngularDev`).  
`CorsSettings:AllowedOrigins` trong JSON **chưa được đọc**.

**Trước go-live bắt buộc** sửa CORS để đọc config, ví dụ origins:

- `https://hrm.yourdomain.com`
- (tuỳ) preview staging

Không dùng `AllowAnyOrigin` kèm credentials.

### 4.5 Swagger production

Hiện Swagger bật vì `IsDevelopment() || true`.  
Production: chỉ bật khi `IsDevelopment()` hoặc flag `Swagger:Enabled=false`.

### 4.6 IP allowlist

Middleware luôn chạy: **danh sách rỗng = cho phép mọi IP**.  
Khi khách yêu cầu khoá Admin: thêm CIDR trong Admin → System → IP allowlist (cache TTL ~45s).

### 4.7 Background jobs

`HrmPeriodicJobsService` chạy in-process (hết hạn HĐ, apply transfer…).  
Deploy **một instance API** xử lý job, hoặc tách worker sau này nếu scale ngang.

---

## 5. Deploy HrmAdmin

### 5.1 Cấu hình API URL

Sửa trước khi build:

```ts
// src/environments/environment.production.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api/v1',
};
```

> Lưu ý: `angular.json` hiện **không** có `fileReplacements` bắt buộc trỏ file này — kiểm tra build dùng đúng `environment.production.ts` (hoặc thêm `fileReplacements` trong cấu hình `production`).

### 5.2 Build

```powershell
cd HrmAdmin
yarn install
yarn build
# hoặc: npx ng build --configuration=production
```

Output: `dist/` (static files).

### 5.3 Nginx SPA mẫu

```nginx
server {
    listen 443 ssl http2;
    server_name hrm.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/hrm.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hrm.yourdomain.com/privkey.pem;

    root /var/www/hrm-admin;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache hashed assets
    location ~* \.(js|css|png|jpg|svg|woff2)$ {
        expires 7d;
        add_header Cache-Control "public";
    }
}
```

Copy nội dung `dist/HrmAdmin/browser` (hoặc path Angular thực tế sau build) vào `/var/www/hrm-admin`.

### 5.4 IIS (Windows)

1. Publish Admin static vào site folder  
2. URL Rewrite: mọi route → `index.html`  
3. Binding HTTPS certificate  
4. Không cần .NET trên site Admin (chỉ static)

---

## 6. Deploy HrmMobile

### 6.1 Biến môi trường release

```bash
EXPO_PUBLIC_API=https://api.yourdomain.com/api/v1
EXPO_PUBLIC_APP_VARIANT=production
EXPO_PUBLIC_APP_NAME=SMARTHRM
EXPO_PUBLIC_BUNDLE_ID=com.yourcompany.smarthrm
```

Non-dev build **bắt buộc** có `EXPO_PUBLIC_API` (không fallback LAN).

### 6.2 Store / EAS

Repo có script `eas build` / `eas update` / `eas submit` trong `package.json`, nhưng **`eas.json` chưa có trong repo** — tạo trước khi CI:

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "staging": { "distribution": "internal", "channel": "staging" },
    "production": { "channel": "production", "autoIncrement": true }
  },
  "submit": {
    "production": {}
  }
}
```

```bash
cd HrmMobile
npx eas build --profile production --platform all
npx eas submit --profile production --platform ios
npx eas submit --profile production --platform android
```

OTA (sau khi đã cấu hình `expo-updates` + `runtimeVersion` trong `app.config`):

```bash
npx eas update --branch production --message "hotfix"
```

### 6.3 Quyền thiết bị

- Location (chấm công GPS)  
- Camera / photo (avatar, đính kèm)  
- (Sau) Notification khi làm FCM — `plan_v2`

### 6.4 Cleartext HTTP

`usesCleartextTraffic` / ATS arbitrary loads đang bật cho dev.  
**Production store:** tắt cleartext; chỉ HTTPS API.

---

## 7. Thứ tự triển khai đề xuất (1 ngày ops)

```text
1. Provision PostgreSQL UTF8 + backup job
2. Điền secret API (JWT, SMTP, upload) → publish API sau reverse proxy HTTPS
3. Verify: GET https://api…/swagger (chỉ staging) hoặc login POST /admin/auth/login
4. Sửa CORS + tắt Swagger prod → redeploy API
5. Build Admin với apiUrl production → Nginx HTTPS
6. Đổi mật khẩu admin · gán Role HR/Manager (HDSD §15)
7. Setup org: Company/Branch GPS · Shift · Pattern · DayOffConfig · Allocation (HDSD §3)
8. Build Mobile production → TestFlight / Internal testing → Store
9. Smoke HDSD §12 + §29.4
10. Bàn giao tài liệu + tài khoản + backup policy
```

---

## 8. Docker Compose (gợi ý — chưa có sẵn trong repo)

Có thể thêm sau; skeleton tham khảo:

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: HrmApiDb
      POSTGRES_USER: hrm_app
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
  api:
    build: ./HrmApi
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      ConnectionStrings__DefaultConnection: Host=db;Port=5432;Database=HrmApiDb;Username=hrm_app;Password=${DB_PASSWORD};Encoding=UTF8;Client Encoding=UTF8
      JwtSettings__Secret: ${JWT_SECRET}
    depends_on: [db]
    ports: ["5036:8080"]
volumes:
  pgdata:
```

Admin thường build static riêng + Nginx; Mobile không chạy trong compose.

---

## 9. Giám sát & vận hành

| Hạng mục | Gợi ý |
|---|---|
| Uptime | Ping `https://api…/swagger` (staging) hoặc thêm `/health` |
| Logs | stdout → journald / Docker → cloud log; mức Warning+ prod |
| Disk | Upload qua cloud — theo dõi volume DB |
| Jobs | Log `HrmPeriodicJobsService`; alert nếu exception lặp |
| Security | Rotate JWT secret = force logout toàn hệ; rotate DB password theo lịch |
| Retention | Admin System retention/purge (soft-delete) — cấu hình theo hợp đồng khách |

---

## 10. Multi-company / bán SaaS

**Đã có trong product:** multi-company, branding màu, DataScope ALL/BRANCH/DEPARTMENT/OWN, RBAC fine-grained.

**Khi bán SaaS:**

1. **Single-tenant mỗi khách** (DB hoặc schema riêng) — đơn giản nhất về compliance  
2. **Shared DB + `CompanyId`** — cần harden: không leak cross-company, IP allowlist, audit  
3. Onboarding: script tạo Company → Admin user → seed DayOffConfig/Shift mẫu  
4. License: số NV (`MaxEmployeeCapacity`), module flags (Recruitment/Asset…) — có thể gắn sau (`plan_v2`)  
5. Hỗ trợ: kênh riêng + bản `HDSD.md` + `production.md` này

---

## 11. Checklist bàn giao khách hàng

- [ ] URL Admin / API / link Store hoặc APK nội bộ  
- [ ] Tài khoản Admin (đã đổi mật khẩu) + 1 user HR demo + 1 Manager + 1 Employee Mobile  
- [ ] Sơ đồ org mẫu + GPS chi nhánh đã test chấm công  
- [ ] Hướng dẫn `HDSD.md` (setup §3, ngày thường §4–7, RBAC §15)  
- [ ] Chính sách backup + liên hệ hỗ trợ  
- [ ] Danh sách hạng mục **chưa gồm** trong gói (Face, FCM, SMS thật…) — tránh tranh chấp  
- [ ] Biên bản nghiệm thu smoke §12  

---

## 12. Troubleshooting deploy nhanh

| Triệu chứng | Nguyên nhân thường gặp | Xử lý |
|---|---|---|
| API die lúc start | DB không UTF8 / sai connection / migrate fail | Xem log Critical bootstrap |
| Admin gọi API CORS error | Origin prod chưa allow | Sửa CORS §4.4 |
| Admin 404 khi F5 route | Nginx thiếu `try_files` SPA | §5.3 |
| Mobile login fail | Sai `EXPO_PUBLIC_API` / thiếu `/api/v1` | Kiểm tra URL đầy đủ |
| Upload lỗi | Cloudinary/S3 trống | Điền UploadSettings |
| Quên mật khẩu không gửi mail | SMTP sai | Test SMTP / App Password Gmail |
| Chấm công “thiếu GPS” | Branch/Company chưa lat/lng | HDSD §13 |
| User thiếu menu | Chưa gán Role | HDSD §15 |

---

## 13. Tài liệu liên quan

| File | Vai trò |
|---|---|
| **`production.md`** (file này) | Deploy · bảo mật · thương mại hoá |
| **`HDSD.md`** | Vận hành nghiệp vụ Admin + Mobile |
| **`plan.md`** | CLOSED v1 — phạm vi đã xong |
| **`plan_v2.md`** | FCM · SSO/SMS thật · offline · Face… |
| `HrmApi/.../appsettings.Example.json` | Mẫu config API |
| `HrmApi/.../.env.example` | Mẫu env |

---

*Deploy production = HTTPS + secret sạch + CORS/Swagger đúng + backup + smoke HDSD §12. Phần còn lại (FCM, SMS thật, Face) bán như add-on theo `plan_v2`.*
