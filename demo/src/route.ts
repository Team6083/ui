import { useEffect, useState } from "react"

// Hash routes (#/data), so the demo works from any static host, GitHub Pages included.
function current(): string {
  return window.location.hash.replace(/^#/, "") || "/"
}

export function useRoute(): string {
  const [route, setRoute] = useState(current)
  useEffect(() => {
    const onChange = () => {
      setRoute(current())
      window.scrollTo(0, 0)
    }
    window.addEventListener("hashchange", onChange)
    return () => window.removeEventListener("hashchange", onChange)
  }, [])
  return route
}
