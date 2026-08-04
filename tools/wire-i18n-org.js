const fs = require('fs');
const path = require('path');

const ORG_ROOT = path.join('src/app/pages/main/organizition');

const MANAGERS = [
  { file: 'company-manager/company-manager.component.ts', key: 'organization.company.entityName', vi: 'công ty' },
  { file: 'branch-manager/branch-manager.component.ts', key: 'organization.branch.entityName', vi: 'chi nhánh' },
  { file: 'department-manager/department-manager.component.ts', key: 'organization.department.entityName', vi: 'phòng ban' },
  { file: 'part-manager/part/part.component.ts', key: 'organization.part.entityName', vi: 'bộ phận' },
  { file: 'part-manager/part-master/part-master.component.ts', key: 'organization.part.partMaster.entityName', vi: 'danh mục bộ phận' },
  { file: 'position-manager/position/position.component.ts', key: 'organization.position.entityName', vi: 'chức vụ' },
  { file: 'position-manager/position-master/position-master.component.ts', key: 'organization.position.positionMaster.entityName', vi: 'danh mục chức vụ' },
];

const FORMS = [
  { file: 'company-manager/add-or-update-company/add-or-update-company.component.ts', key: 'organization.company.entityName' },
  { file: 'branch-manager/add-or-update-branch/add-or-update-branch.component.ts', key: 'organization.branch.entityName' },
  { file: 'department-manager/add-or-update-department/add-or-update-department.component.ts', key: 'organization.department.entityName' },
  { file: 'part-manager/part/add-or-update-part/add-or-update-part.component.ts', key: 'organization.part.entityName' },
  { file: 'part-manager/part-master/add-or-update-part-master/add-or-update-part-master.component.ts', key: 'organization.part.partMaster.entityName' },
  { file: 'position-manager/position/add-or-update-position/add-or-update-position.component.ts', key: 'organization.position.entityName' },
  { file: 'position-manager/position-master/add-or-update-position-master/add-or-update-position-master.component.ts', key: 'organization.position.positionMaster.entityName' },
];

const DETAILS = [
  'company-manager/company-detail/company-detail.component.ts',
  'branch-manager/branch-detail/branch-detail.component.ts',
  'department-manager/department-detail/department-detail.component.ts',
  'part-manager/part/part-detail/part-detail.component.ts',
  'part-manager/part-master/part-master-detail/part-master-detail.component.ts',
  'position-manager/position/position-detail/position-detail.component.ts',
  'position-manager/position-master/position-master-detail/position-master-detail.component.ts',
];

function ensureImport(content) {
  if (content.includes('I18nMessageService')) return content;
  return content.replace(
    /(import \{ ApiService \} from '[^']+';)/,
    "$1\nimport { I18nMessageService } from '../../../../../core/services/i18n-message.service';".replace(
      /(\.\.\/)+/g,
      (m) => m,
    ),
  );
}

function fixImportDepth(content, depth) {
  const importPath = `${'../'.repeat(depth)}core/services/i18n-message.service`;
  if (content.includes('I18nMessageService')) {
    return content.replace(
      /import \{ I18nMessageService \} from '[^']+';/,
      `import { I18nMessageService } from '${importPath}';`,
    );
  }
  const apiImport = content.match(/import \{ ApiService \} from '([^']+)';/);
  if (!apiImport) return content;
  return content.replace(
    apiImport[0],
    `${apiImport[0]}\nimport { I18nMessageService } from '${importPath}';`,
  );
}

function ensureConstructor(content) {
  if (content.includes('private readonly i18n: I18nMessageService')) return content;
  return content.replace(
    /(constructor\([\s\S]*?)(private readonly apiService: ApiService,)/,
    '$1private readonly i18n: I18nMessageService,\n    $2',
  ).replace(
    /(constructor\([\s\S]*?)(private apiService: ApiService,)/,
    '$1private readonly i18n: I18nMessageService,\n    $2',
  );
}

function wireManager(filePath, entityKey, viEntity) {
  let content = fs.readFileSync(filePath, 'utf8');
  const depth = filePath.split(path.sep).filter((p) => p === '..').length || (filePath.includes('part-manager') ? 5 : 5);
  content = fixImportDepth(content, 5);
  content = ensureConstructor(content);

  if (!content.includes('ENTITY_KEY')) {
    content = content.replace(
      /export class \w+ implements/,
      `private readonly ENTITY_KEY = '${entityKey}';\n\n  export class `.replace('export class ', ''),
    );
    // fix botched replace
    content = content.replace(
      /private readonly ENTITY_KEY = '[^']+';\n\n  export class (\w+)/,
      'export class $1',
    );
    content = content.replace(
      /(export class \w+ implements \w+ \{)/,
      `$1\n  private readonly ENTITY_KEY = '${entityKey}';`,
    );
  }

  const e = viEntity;
  const cap = e.charAt(0).toUpperCase() + e.slice(1);

  content = content
    .replace(new RegExp(`err\\.error \\|\\| 'Không thể tải danh sách ${e}\\.'`, 'g'), `this.i18n.loadListFailed(this.ENTITY_KEY, err.error)`)
    .replace(new RegExp(`'Không tìm thấy ID ${e}\\.'`, 'g'), `this.i18n.entityNotFound(this.ENTITY_KEY)`)
    .replace(new RegExp(`confirmActivate\\('${e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`, 'g'), `confirmActivate(this.ENTITY_KEY`)
    .replace(new RegExp(`confirmDeactivate\\('${e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`, 'g'), `confirmDeactivate(this.ENTITY_KEY`)
    .replace(new RegExp(`\`Kích hoạt ${e} "\\$\\{([^}]+)\\}" thành công!\``, 'g'), `this.i18n.activateSuccess(this.ENTITY_KEY, $1)`)
    .replace(new RegExp(`\`Ngưng hoạt động ${e} "\\$\\{([^}]+)\\}" thành công!\``, 'g'), `this.i18n.deactivateSuccess(this.ENTITY_KEY, $1)`)
    .replace(new RegExp(`'Không thể kích hoạt ${e}\\.'`, 'g'), `this.i18n.activateFailed(this.ENTITY_KEY)`)
    .replace(new RegExp(`'Không thể ngưng hoạt động ${e}\\.'`, 'g'), `this.i18n.deactivateFailed(this.ENTITY_KEY)`)
    .replace(new RegExp(`err\\.error \\|\\| 'Có lỗi xảy ra khi kích hoạt ${e}\\.'`, 'g'), `this.i18n.activateError(this.ENTITY_KEY, err.error)`)
    .replace(new RegExp(`err\\.error \\|\\| 'Có lỗi xảy ra khi ngưng hoạt động ${e}\\.'`, 'g'), `this.i18n.deactivateError(this.ENTITY_KEY, err.error)`)
    .replace(/this\.message\.error\('Không thể tải file mẫu Excel\.'\)/g, `this.message.error(this.i18n.excelTemplateFailed())`)
    .replace(/this\.message\.success\('Tải file mẫu Excel thành công!'\)/g, `this.message.success(this.i18n.excelTemplateSuccess())`)
    .replace(/this\.message\.error\('Không thể xuất file Excel\.'\)/g, `this.message.error(this.i18n.excelExportFailed())`)
    .replace(/this\.message\.success\('Xuất Excel thành công!'\)/g, `this.message.success(this.i18n.excelExportSuccess())`)
    .replace(/this\.message\.error\(err\.error \|\| 'Import Excel thất bại\.'\)/g, `this.message.error(this.i18n.excelImportFailed(err.error))`)
    .replace(
      /this\.message\.warning\(\s*`Import hoàn tất: \$\{result\.successCount\}\/\$\{result\.totalRows\} thành công\. \$\{result\.errorCount\} lỗi\.`,\s*\)/g,
      `this.message.warning(this.i18n.excelImportPartial(result.successCount, result.totalRows, result.errorCount))`,
    )
    .replace(
      new RegExp('`Import Excel thành công \\$\\{result\\.successCount\\} ' + e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '!`', 'g'),
      'this.i18n.excelImportSuccess(result.successCount, this.ENTITY_KEY)',
    );

  // position uses displayName variable
  content = content
    .replace(/this\.message\.success\(`Kích hoạt chức vụ "\$\{displayName\}" thành công!`\)/g, `this.message.success(this.i18n.activateSuccess(this.ENTITY_KEY, displayName))`)
    .replace(/this\.message\.success\(`Ngưng hoạt động chức vụ "\$\{displayName\}" thành công!`\)/g, `this.message.success(this.i18n.deactivateSuccess(this.ENTITY_KEY, displayName))`);

  // part-master multi-line success
  content = content.replace(
    /this\.message\.success\(\s*`Ngưng hoạt động danh mục bộ phận "\$\{partMaster\.name\}" thành công!`,\s*\)/g,
    `this.message.success(this.i18n.deactivateSuccess(this.ENTITY_KEY, partMaster.name))`,
  );
  content = content.replace(
    /this\.message\.success\(\s*`Ngưng hoạt động danh mục chức vụ "\$\{positionMaster\.name\}" thành công!`,\s*\)/g,
    `this.message.success(this.i18n.deactivateSuccess(this.ENTITY_KEY, positionMaster.name))`,
  );
  content = content.replace(
    /this\.message\.success\(\s*`Import Excel thành công \$\{result\.successCount\} danh mục bộ phận!`,\s*\)/g,
    `this.message.success(this.i18n.excelImportSuccess(result.successCount, this.ENTITY_KEY))`,
  );
  content = content.replace(
    /this\.message\.success\(\s*`Import Excel thành công \$\{result\.successCount\} danh mục chức vụ!`,\s*\)/g,
    `this.message.success(this.i18n.excelImportSuccess(result.successCount, this.ENTITY_KEY))`,
  );

  fs.writeFileSync(filePath, content);
  console.log('Manager:', filePath);
}

function wireForm(filePath, entityKey) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = fixImportDepth(content, 6);
  content = ensureConstructor(content);

  content = content
    .replace(/this\.message\.error\('Không thể tải danh sách công ty để chọn\.'\)/g, `this.message.error(this.i18n.instant('common.messages.loadCompanySelectFailed'))`)
    .replace(/this\.message\.error\(err\.error \|\| 'Không thể tải chi tiết[^']+'\)/g, `this.message.error(this.i18n.loadDetailFailed(err.error))`)
    .replace(/this\.message\.error\(err\.error \|\| 'Lưu thông tin thất bại\.'\)/g, `this.message.error(this.i18n.genericError(err.error))`)
    .replace(
      /this\.message\.success\(\s*this\.isEdit \? 'Cập nhật[^']+' : 'Thêm mới[^']+',\s*\)/g,
      `this.message.success(this.isEdit ? this.i18n.updateSuccess() : this.i18n.createSuccess())`,
    );

  fs.writeFileSync(filePath, content);
  console.log('Form:', filePath);
}

function wireDetail(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = fixImportDepth(content, 6);
  content = ensureConstructor(content);
  content = content.replace(
    /this\.message\.error\(err\.error \|\| 'Không thể tải chi tiết[^']+'\)/g,
    `this.message.error(this.i18n.loadDetailFailed(err.error))`,
  );
  fs.writeFileSync(filePath, content);
  console.log('Detail:', filePath);
}

for (const m of MANAGERS) {
  wireManager(path.join(ORG_ROOT, m.file), m.key, m.vi);
}
for (const f of FORMS) {
  wireForm(path.join(ORG_ROOT, f.file), f.key);
}
for (const d of DETAILS) {
  wireDetail(path.join(ORG_ROOT, d));
}

console.log('Done');
