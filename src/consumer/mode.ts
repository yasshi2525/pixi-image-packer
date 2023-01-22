type modeType = 'view' | 'download'
export const mode = (): modeType =>
  new URL(window.location.href).searchParams
    .get('download') == null
    ? 'view'
    : 'download'
