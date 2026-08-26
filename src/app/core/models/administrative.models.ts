export enum ProvinceDivisionType {
  Province = 1,
  CentrallyRunCity = 2,
}

export enum WardDivisionType {
  Ward = 1,
  Commune = 2,
  Township = 3,
}

export interface ProvinceDto {
  id: string;
  code: string;
  name: string;
  fullName: string;
  divisionType?: ProvinceDivisionType | number;
  divisionTypeName?: string;
  administrativeRegion?: string;
  sortOrder?: number;
  isActive: boolean;
  wardCount?: number;
  createdAt?: string;
}

export interface WardDto {
  id: string;
  provinceId: string;
  provinceCode: string;
  provinceName?: string;
  code: string;
  name: string;
  fullName: string;
  divisionType?: WardDivisionType | number;
  divisionTypeName?: string;
  sortOrder?: number;
  isActive: boolean;
  createdAt?: string;
}

export interface AdministrativeTreeNodeDto {
  value: string;
  label: string;
  isLeaf?: boolean;
  children?: AdministrativeTreeNodeDto[];
}
