import { UserPermissions, UserRole } from "@/types/common";

export function getRolePermissions(
  role: UserRole | undefined
): UserPermissions {
  return {
    hasAdminControls: role
      ? [UserRole.manager, UserRole.support].includes(role)
      : false,
    canEditAllCompanies: role === UserRole.manager,
    canGetUsersInfo: role === UserRole.manager,
    canBanUsers: role === UserRole.manager,
    canRemoveCompanies: role === UserRole.manager,
    canWorkWitchReports: role
      ? [UserRole.manager, UserRole.support].includes(role)
      : false,
    canEditPages: role === UserRole.manager,
    canCancelSubscriptions: role
      ? [UserRole.manager, UserRole.support].includes(role)
      : false,
    canConvertCompanyToTest: role === UserRole.manager,
  };
}
