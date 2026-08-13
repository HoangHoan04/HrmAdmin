import { enumData } from '@/app/core/constants/enums';

type EnumEntry = { code: string; value: string; labelKey: string };

function labelKeyOf(dict: Record<string, EnumEntry>, code?: string | null): string | null {
  if (!code) return null;
  const normalized = code.trim().toUpperCase();
  const meta = Object.values(dict).find((x) => x.value === normalized || x.code === normalized);
  return meta?.labelKey ?? null;
}

export function resolveRecruitmentLabel(
  instant: (key: string) => string,
  dict: Record<string, EnumEntry>,
  code?: string | null,
  fallback = '-',
): string {
  const key = labelKeyOf(dict, code);
  if (!key) return code?.trim() || fallback;
  return instant(key) || code || fallback;
}

export function candidateStatusLabel(
  instant: (key: string) => string,
  code?: string | null,
): string {
  return resolveRecruitmentLabel(
    instant,
    enumData.CANDIDATE_STATUS as Record<string, EnumEntry>,
    code,
  );
}

export function hiringPlanStatusLabel(
  instant: (key: string) => string,
  code?: string | null,
): string {
  return resolveRecruitmentLabel(
    instant,
    enumData.HIRING_PLAN_STATUS as Record<string, EnumEntry>,
    code,
  );
}

export function interviewStatusLabel(
  instant: (key: string) => string,
  code?: string | null,
): string {
  return resolveRecruitmentLabel(
    instant,
    enumData.INTERVIEW_STATUS as Record<string, EnumEntry>,
    code,
  );
}

export function requestStatusLabel(instant: (key: string) => string, code?: string | null): string {
  return resolveRecruitmentLabel(
    instant,
    enumData.RECRUITMENT_REQUEST_STATUS as Record<string, EnumEntry>,
    code,
  );
}

export function requestLevelLabel(instant: (key: string) => string, code?: string | null): string {
  return resolveRecruitmentLabel(
    instant,
    enumData.RECRUITMENT_REQUEST_LEVEL as Record<string, EnumEntry>,
    code,
  );
}

export function hiringSourceChannelLabel(
  instant: (key: string) => string,
  code?: string | null,
): string {
  return resolveRecruitmentLabel(
    instant,
    enumData.HIRING_SOURCE_CHANNEL as Record<string, EnumEntry>,
    code,
  );
}

export function candidateStatusLabelKey(code?: string | null): string | null {
  return labelKeyOf(enumData.CANDIDATE_STATUS as Record<string, EnumEntry>, code);
}

export function interviewStatusLabelKey(code?: string | null): string | null {
  return labelKeyOf(enumData.INTERVIEW_STATUS as Record<string, EnumEntry>, code);
}
