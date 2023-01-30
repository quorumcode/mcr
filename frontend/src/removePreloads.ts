export default () => ({
  name: 'remove-preloads',
  enforce: 'post',
  transformIndexHtml(html: string) {
    return html.replace(
      /\s*(<link rel="(?:module)?preload".*?>)\s*/gi,
      ''
    )
  },
})