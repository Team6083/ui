import { act, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"

import { ApiError } from "../lib/api-error.js"
import { ConfigError, parseBaseConfig } from "../lib/runtime-config.js"
import { renderWithUi } from "../test-utils.js"
import { apiErrorMessage } from "./api-error-message.js"
import { AppCommitProvider, AppOutdatedBanner, useAppOutdated, useCommitCheckedFetch } from "./app-commit.js"
import { ConfigErrorPage } from "./config-error-page.js"
import { useNewFrontendBuild } from "./frontend-build.js"
import { NoAccessPage } from "./no-access-page.js"
import { createRuntimeConfig } from "./runtime-config.js"

describe("NoAccessPage", () => {
  it("uses the standard wording in zh-TW", () => {
    renderWithUi(<NoAccessPage />, { locale: "zh-Hant-TW" })
    expect(screen.getByRole("heading", { name: "你沒有這個服務的存取權" })).toBeInTheDocument()
    expect(screen.getByText("請聯絡 admin。")).toBeInTheDocument()
  })

  it("falls back to English and takes actions", () => {
    renderWithUi(<NoAccessPage actions={<button>Sign out</button>} />, { locale: "ja" })
    expect(screen.getByRole("heading", { name: "You don't have access to this service" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument()
  })
})

describe("ConfigErrorPage", () => {
  it("lists each issue", () => {
    renderWithUi(<ConfigErrorPage error={new ConfigError(["apiBaseUrl is missing or empty", "oidc is missing"])} />)
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "apiBaseUrl is missing or empty",
      "oidc is missing",
    ])
  })
})

describe("createRuntimeConfig", () => {
  const config = { apiBaseUrl: "https://api.test", oidc: { authority: "https://id.test", clientId: "a", scope: "openid" } }

  function ApiBase({ use }: { use: () => { apiBaseUrl: string } }) {
    return <p>api: {use().apiBaseUrl}</p>
  }

  it("renders the app once config.json is valid", async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => Response.json(config))
    const { RuntimeConfigProvider, useRuntimeConfig } = createRuntimeConfig({ parse: parseBaseConfig, fetch: fetchFn })
    renderWithUi(
      <RuntimeConfigProvider fallback={<p>loading</p>}>
        <ApiBase use={useRuntimeConfig} />
      </RuntimeConfigProvider>,
    )
    expect(screen.getByText("loading")).toBeInTheDocument()
    expect(await screen.findByText("api: https://api.test")).toBeInTheDocument()
  })

  it("shows the config error page instead of the app", async () => {
    const fetchFn = vi.fn<typeof fetch>(async () => Response.json({}))
    const { RuntimeConfigProvider, useRuntimeConfig } = createRuntimeConfig({ parse: parseBaseConfig, fetch: fetchFn })
    renderWithUi(
      <RuntimeConfigProvider>
        <ApiBase use={useRuntimeConfig} />
      </RuntimeConfigProvider>,
    )
    expect(await screen.findByRole("heading", { name: "Couldn't load the configuration" })).toBeInTheDocument()
    expect(screen.getByText("apiBaseUrl is missing or empty")).toBeInTheDocument()
    expect(screen.queryByText(/^api:/)).not.toBeInTheDocument()
  })
})

describe("app commit check", () => {
  function withCommit(commit: string) {
    return new Response("{}", { headers: { "X-App-Commit": commit } })
  }

  function Client() {
    const checkedFetch = useCommitCheckedFetch()
    const outdated = useAppOutdated()
    const [result, setResult] = useState("")
    const run = (method: string) =>
      checkedFetch("/api/v1/things", { method }).then(
        () => setResult(`${method} ok`),
        (e: ApiError) => setResult(`${method} ${e.code}`),
      )
    return (
      <>
        <AppOutdatedBanner onReload={() => setResult("reloaded")} />
        <button onClick={() => run("GET")}>read</button>
        <button onClick={() => run("POST")} disabled={false}>
          write
        </button>
        <p>outdated: {String(outdated)}</p>
        <p>result: {result}</p>
      </>
    )
  }

  it("shows the banner and refuses writes once the server is on another build", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => withCommit("def5678"))
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    renderWithUi(
      <AppCommitProvider buildCommit="abc1234">
        <Client />
      </AppCommitProvider>,
      { locale: "zh-TW" },
    )
    expect(screen.queryByText("系統已更新，請重新載入")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "read" }))
    expect(await screen.findByText("系統已更新，請重新載入")).toBeInTheDocument()
    expect(screen.getByText("outdated: true")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "write" }))
    expect(await screen.findByText("result: POST app_outdated")).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await user.click(screen.getByRole("button", { name: "重新載入" }))
    expect(screen.getByText("result: reloaded")).toBeInTheDocument()
  })

  it("stays quiet when the commits match or the build has none", async () => {
    vi.stubGlobal("fetch", vi.fn<typeof fetch>(async () => withCommit("abc1234ffff")))
    const user = userEvent.setup()
    renderWithUi(
      <AppCommitProvider buildCommit="abc1234">
        <Client />
      </AppCommitProvider>,
    )
    await user.click(screen.getByRole("button", { name: "write" }))
    expect(await screen.findByText("result: POST ok")).toBeInTheDocument()
    expect(screen.getByText("outdated: false")).toBeInTheDocument()
  })

  it("polls pollUrl so apps without fetch-based writes still notice", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => withCommit("def5678"))
    vi.stubGlobal("fetch", fetchMock)
    renderWithUi(
      <AppCommitProvider buildCommit="abc1234" pollUrl="/api/healthz">
        <Client />
      </AppCommitProvider>,
    )
    await waitFor(() => expect(screen.getByText("outdated: true")).toBeInTheDocument())
    expect(fetchMock).toHaveBeenCalledWith("/api/healthz", { method: "HEAD", cache: "no-store" })
  })

  it("shows what the app reports through `outdated`", () => {
    renderWithUi(
      <AppCommitProvider buildCommit="abc1234" outdated>
        <Client />
      </AppCommitProvider>,
    )
    expect(screen.getByTestId("app-outdated-banner")).toHaveTextContent("The system has been updated")
    expect(screen.getByText("outdated: true")).toBeInTheDocument()
  })

  it("does not poll without a build commit", async () => {
    const fetchMock = vi.fn<typeof fetch>()
    vi.stubGlobal("fetch", fetchMock)
    renderWithUi(
      <AppCommitProvider buildCommit={undefined} pollUrl="/api/healthz">
        <Client />
      </AppCommitProvider>,
    )
    await act(async () => {})
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe("useNewFrontendBuild", () => {
  function Page({ buildCommit }: { buildCommit?: string }) {
    const newBuild = useNewFrontendBuild({ buildCommit, url: "/version.json" })
    return (
      <AppCommitProvider buildCommit={null} outdated={newBuild}>
        <AppOutdatedBanner />
        <p>new build: {String(newBuild)}</p>
      </AppCommitProvider>
    )
  }

  it("shows the banner once the deployed front end is another build", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => Response.json({ commit: "def5678" }))
    vi.stubGlobal("fetch", fetchMock)
    renderWithUi(<Page buildCommit="abc1234" />)
    expect(await screen.findByTestId("app-outdated-banner")).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith("/version.json", { cache: "no-store" })
  })

  it("stays quiet on the same build, a missing file or the SPA fallback", async () => {
    for (const answer of [Response.json({ commit: "abc1234ffff" }), new Response("", { status: 404 }), new Response("<!doctype html>", { headers: { "Content-Type": "text/html" } })]) {
      vi.stubGlobal("fetch", vi.fn<typeof fetch>(async () => answer))
      const { unmount } = renderWithUi(<Page buildCommit="abc1234" />)
      await act(async () => {})
      expect(screen.getByText("new build: false")).toBeInTheDocument()
      unmount()
    }
  })

  it("does not check without a build commit", async () => {
    const fetchMock = vi.fn<typeof fetch>()
    vi.stubGlobal("fetch", fetchMock)
    renderWithUi(<Page />)
    await act(async () => {})
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe("apiErrorMessage", () => {
  it("localizes standard codes", () => {
    expect(apiErrorMessage(new ApiError(403, "missing_role", "Missing role"), "zh-TW")).toBe("你沒有這個服務的存取權，請聯絡 admin。")
  })

  it("prefers the app's own messages", () => {
    expect(apiErrorMessage(new ApiError(409, "order_closed", "Order closed"), "zh-TW", { order_closed: "訂單已結單" })).toBe("訂單已結單")
  })

  it("shows the server's English text only in English", () => {
    const error = new ApiError(409, "order_closed", "Order closed")
    expect(apiErrorMessage(error, "en")).toBe("Order closed")
    expect(apiErrorMessage(error, "zh-TW")).toBe("發生錯誤，請再試一次。")
  })

  it("names network failures", () => {
    expect(apiErrorMessage(new TypeError("Failed to fetch"), "en")).toBe("Couldn't reach the server. Check your connection and try again.")
  })
})
