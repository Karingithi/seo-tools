declare namespace JSX {
  type Element = import('react').ReactElement
  interface IntrinsicElements {
    [elemName: string]: any
  }
}
