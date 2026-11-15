import { render, type RenderOptions } from "@testing-library/react"
import type { ReactElement } from "react"

import { UiProvider } from "./provider.js"

export function renderWithUi(ui: ReactElement, { locale = "en", ...options }: RenderOptions & { locale?: string } = {}) {
  return render(ui, {
    wrapper: ({ children }) => <UiProvider locale={locale}>{children}</UiProvider>,
    ...options,
  })
}
