import { Directive, inject } from '@angular/core';
import { NzSelectComponent, NzSelectItemInterface } from 'ng-zorro-antd/select';

/**
 * Bỏ dấu tiếng Việt + chữ thường để so khớp: "Nguyễn Văn Đức" -> "nguyen van duc".
 */
export function normalizeSearchText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * Bộ lọc option cho nz-select: không phân biệt hoa thường, không phân biệt dấu,
 * và mọi từ gõ vào đều phải xuất hiện (thứ tự bất kỳ), vd "nv an" khớp "NV001 - Nguyễn Văn An".
 */
export function vietnameseSelectFilter(searchValue: string, item: NzSelectItemInterface): boolean {
  const keyword = normalizeSearchText(searchValue);
  if (!keyword) return true;

  const label = normalizeSearchText(item?.nzLabel);
  if (!label) return false;

  return keyword
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => label.includes(word));
}

/**
 * Mặc định bật ô gõ tìm kiếm cho mọi <nz-select> trong admin.
 * Không áp dụng cho nz-select đã tự khai báo nzShowSearch (kể cả [nzShowSearch]="false").
 */
@Directive({
  selector: 'nz-select:not([nzShowSearch])',
  standalone: false,
})
export class SelectSearchDefaultDirective {
  constructor() {
    const select = inject(NzSelectComponent, { self: true });
    select.nzShowSearch = true;
  }
}

/**
 * Mặc định dùng bộ lọc tiếng Việt không dấu cho mọi <nz-select>.
 * Không áp dụng khi template đã tự truyền nzFilterOption.
 */
@Directive({
  selector: 'nz-select:not([nzFilterOption])',
  standalone: false,
})
export class SelectVietnameseFilterDirective {
  constructor() {
    const select = inject(NzSelectComponent, { self: true });
    select.nzFilterOption = vietnameseSelectFilter;
  }
}
