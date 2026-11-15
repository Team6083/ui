# Keycloak

This package has no Keycloak client and handles no tokens. Apps keep their own
sign-in; the package only renders the page for a `403 missing_role` response
(`NoAccessPage`, detected with `isMissingRole`).
