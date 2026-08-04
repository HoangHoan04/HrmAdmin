const fs = require('fs');
const path = require('path');

const DETAILS = [
  {
    file: 'department-manager/department-detail/department-detail.component.ts',
    key: 'organization.department.entityName',
    vi: 'phòng ban',
  },
  {
    file: 'part-manager/part/part-detail/part-detail.component.ts',
    key: 'organization.part.entityName',
    vi: 'bộ phận',
  },
  {
    file: 'part-manager/part-master/part-master-detail/part-master-detail.component.ts',
    key: 'organization.part.partMaster.entityName',
    vi: 'danh mục bộ phận',
  },
  {
    file: 'position-manager/position/position-detail/position-detail.component.ts',
    key: 'organization.position.entityName',
    vi: 'chức vụ',
  },
  {
    file: 'position-manager/position-master/position-master-detail/position-master-detail.component.ts',
    key: 'organization.position.positionMaster.entityName',
    vi: 'danh mục chức vụ',
  },
];

const FORMS = [
  'company-manager/add-or-update-company/add-or-update-company.component.ts',
  'part-manager/part/add-or-update-part/add-or-update-part.component.ts',
  'part-manager/part-master/add-or-update-part-master/add-or-update-part-master.component.ts',
  'position-manager/position/add-or-update-position/add-or-update-position.component.ts',
  'position-manager/position-master/add-or-update-position-master/add-or-update-position-master.component.ts',
];

for (const d of DETAILS) {
  const fp = path.join('src/app/pages/main/organizition', d.file);
  let c = fs.readFileSync(fp, 'utf8');
  if (!c.includes('ENTITY_KEY')) {
    c = c.replace(/export class (\w+) implements OnInit \{/, `export class $1 implements OnInit {\n  private readonly ENTITY_KEY = '${d.key}';`);
  }
  c = c
    .replace(new RegExp(`confirmActivate\\('${d.vi}'`, 'g'), 'confirmActivate(this.ENTITY_KEY')
    .replace(new RegExp(`confirmDeactivate\\('${d.vi}'`, 'g'), 'confirmDeactivate(this.ENTITY_KEY')
    .replace(
      /this\.message\.success\(\s*this\.[\w]+!\.isDeleted\s*\?\s*'[^']+'\s*:\s*'[^']+',\s*\)/gs,
      `this.message.success(\n            this.${c.match(/this\.(\w+)!\.isDeleted/)?.[1] || 'entity'}!.isDeleted\n              ? this.i18n.activateSuccess(this.ENTITY_KEY, this.${c.match(/load(\w+)Detail/)?.[1]?.toLowerCase() || 'entity'}!.name)\n              : this.i18n.deactivateSuccess(this.ENTITY_KEY, this.${c.match(/load(\w+)Detail/)?.[1]?.toLowerCase() || 'entity'}!.name),\n          )`,
    );
  // simpler manual replacements per entity
  const entityVar = {
    'phòng ban': 'department',
    'bộ phận': 'part',
    'danh mục bộ phận': 'partMaster',
    'chức vụ': 'position',
    'danh mục chức vụ': 'positionMaster',
  }[d.vi];
  c = c.replace(
    new RegExp(
      `this\\.message\\.success\\([\\s\\S]*?\\? 'Kích hoạt[^']+'\\s*:\\s*'Ngưng hoạt động[^']+',\\s*\\)`,
      'm',
    ),
    `this.message.success(\n            this.${entityVar}!.isDeleted\n              ? this.i18n.activateSuccess(this.ENTITY_KEY, this.${entityVar}!.name)\n              : this.i18n.deactivateSuccess(this.ENTITY_KEY, this.${entityVar}!.name),\n          )`,
  );
  c = c.replace(/this\.message\.error\(err\.error \|\| 'Có lỗi xảy ra\.'\)/g, 'this.message.error(err.error || this.i18n.genericError())');
  fs.writeFileSync(fp, c);
  console.log('Detail fixed:', d.file);
}

for (const f of FORMS) {
  const fp = path.join('src/app/pages/main/organizition', f);
  let c = fs.readFileSync(fp, 'utf8');
  c = c
    .replace(/this\.message\.error\('Không thể tải danh sách công ty\.'\)/g, "this.message.error(this.i18n.instant('common.messages.loadCompanyListFailed'))")
    .replace(/this\.message\.error\('Không thể tải danh sách công ty mẹ\.'\)/g, "this.message.error(this.i18n.instant('common.messages.loadParentCompanyFailed'))")
    .replace(/error: \(\) => this\.message\.error\('Không thể tải danh sách công ty\.'\)/g, "error: () => this.message.error(this.i18n.instant('common.messages.loadCompanyListFailed'))")
    .replace(/this\.message\.error\(err\.error \|\| 'Không thể tải thông tin chi tiết công ty\.'\)/g, 'this.message.error(this.i18n.loadDetailFailed(err.error))');
  fs.writeFileSync(fp, c);
  console.log('Form fixed:', f);
}

console.log('Done');
