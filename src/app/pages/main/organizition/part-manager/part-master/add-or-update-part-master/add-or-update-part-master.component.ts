import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../../../core/constants/common/routes.config';

@Component({
  standalone: false,
  selector: 'app-add-or-update-part-master',
  templateUrl: './add-or-update-part-master.component.html',
  styleUrls: [],
})
export class AddOrUpdatePartMasterComponent implements OnInit {
  id: string | null = null;
  isEdit = false;
  loading = false;
  submitting = false;
  validateForm!: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly message: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;

    if (this.isEdit && this.id) {
      this.loadPartMasterDetail(this.id);
    }
  }

  initForm(): void {
    this.validateForm = this.fb.group({
      id: [null],
      code: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(250)]],
      description: [''],
    });
  }

  loadPartMasterDetail(id: string): void {
    this.loading = true;
    setTimeout(() => {
      this.validateForm.patchValue({
        id,
        code: 'PM-WEB',
        name: 'Tổ Phát triển Web',
        description:
          'Tập hợp các nhóm/bộ phận lập trình và triển khai các ứng dụng trên nền tảng Web.',
      });
      this.loading = false;
    }, 200);
  }

  goBack(): void {
    const basePath = ROUTES_CONFIG.ORGANIZATION.children.PART_MANAGER.path;
    this.router.navigate([basePath], { queryParams: { tab: 'part-master' } });
  }

  submitForm(): void {
    if (this.validateForm.invalid) {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.submitting = true;
    setTimeout(() => {
      this.message.success(
        this.isEdit
          ? 'Cập nhật danh mục bộ phận thành công!'
          : 'Thêm mới danh mục bộ phận thành công!',
      );
      this.submitting = false;
      this.goBack();
    }, 500);
  }
}
