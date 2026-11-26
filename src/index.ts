// Theme and provider
export { system } from "./theme.js"
export { UiProvider, type UiProviderProps } from "./provider.js"
export { resolveUiLocale, uiMessages, useUiLocale, useUiMessages, type UiLocale, type UiMessages } from "./i18n.js"

// Chakra snippets every app used to copy
export * from "./chakra/color-mode.js"
export { Toaster, toaster } from "./chakra/toaster.js"
export { Tooltip, type TooltipProps } from "./chakra/tooltip.js"
export { InfoTip, ToggleTip, type InfoTipProps, type ToggleTipProps } from "./chakra/toggle-tip.js"

// Standard blocks
export { StatusPage, type StatusPageProps } from "./blocks/status-page.js"
export { NoAccessPage, type NoAccessPageProps } from "./blocks/no-access-page.js"
export { ConfigErrorPage, type ConfigErrorPageProps } from "./blocks/config-error-page.js"
export { createRuntimeConfig, type RuntimeConfigProviderProps } from "./blocks/runtime-config.js"
export {
  AppCommitProvider,
  AppOutdatedBanner,
  useAppOutdated,
  useReloadNeeded,
  useCommitCheckedFetch,
  type AppCommitProviderProps,
  type AppOutdatedBannerProps,
} from "./blocks/app-commit.js"
export { useFrontendOutdated, type FrontendOutdatedOptions } from "./blocks/frontend-outdated.js"
export { apiErrorMessage, useApiErrorMessage } from "./blocks/api-error-message.js"

// Framework-free helpers
export {
  ApiError,
  isApiError,
  isMissingRole,
  readApiError,
  STANDARD_ERROR_CODES,
  type ClientErrorCode,
  type StandardErrorCode,
} from "./lib/api-error.js"
export { COMMIT_HEADER, commitsDiffer, isWriteMethod } from "./lib/commit.js"
export {
  baseConfigIssues,
  ConfigError,
  loadRuntimeConfig,
  parseBaseConfig,
  type BaseRuntimeConfig,
  type LoadRuntimeConfigOptions,
} from "./lib/runtime-config.js"

// Layout, from OverHours
export {
  AccountMenu,
  AppShell,
  BuildInfo,
  LanguageMenu,
  SignInButton,
  SignOutMenuItem,
  type AccountMenuProps,
  type LanguageMenuProps,
  type AppShellProps,
  type AppBuild,
  type BuildInfoProps,
  type NavGroup,
  type NavItem,
  type NavLink,
  type RenderLink,
} from "./blocks/app-shell.js"
export { avatarPaletteFor, MemberAvatar, type MemberAvatarProps } from "./blocks/member-avatar.js"
export {
  EmptyState,
  PageColumn,
  TitleBar,
  type EmptyStateProps,
  type TitleBarProps,
} from "./blocks/page-parts.js"

// Data pages: tables people pick from and act on
export {
  DataTable,
  type DataColumn,
  type DataPagination,
  type DataSort,
  type DataTableProps,
  type DataTableSelection,
  type RowAction,
  type SortDirection,
} from "./blocks/data-table.js"
export {
  FactList,
  FilterBar,
  SelectionBar,
  Totals,
  type Fact,
  type FactListProps,
  type FilterBarProps,
  type SelectionBarProps,
  type TotalsLine,
  type TotalsProps,
} from "./blocks/data-parts.js"
