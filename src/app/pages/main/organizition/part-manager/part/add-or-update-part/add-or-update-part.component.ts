import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ROUTES_CONFIG } from '../../../../../../core/constants/common/routes.config';

@Component({
  standalone: false,
  selector: 'app-add-or-update-part',
  templateUrl: './add-or-update-part.component.html',
  styleUrls: [],
})
export class AddOrUpdatePartComponent implements OnInit {
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
      this.loadPartDetail(this.id);
    }
  }

  initForm(): void {
    this.validateForm = this.fb.group({
      id: [null],
      code: ['', [Validators.required, Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.maxLength(250)]],
      departmentName: ['', [Validators.required]],
      description: [''],
    });
  }

  loadPartDetail(id: string): void {
    this.loading = true;
    setTimeout(() => {
      this.validateForm.patchValue({
        id,
        code: 'P-WEB-01',
        name: 'Nhóm Frontend Angular',
        departmentName: 'Phòng Kỹ thuật Hà Nội',
        description: 'Tổ dự án phụ trách phát triển các giao diện người dùng web và mobile hybrid.',
      });
      this.loading = false;
    }, 200);
  }

  goBack(): void {
    const basePath = ROUTES_CONFIG.ORGANIZATION.children.PART_MANAGER.path;
    this.router.navigate([basePath]);
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
        this.isEdit ? 'Cập nhật bộ phận thành công!' : 'Thêm mới bộ phận thành công!',
      );
      this.submitting = false;
      this.goBack();
    }, 500);
  }
}
