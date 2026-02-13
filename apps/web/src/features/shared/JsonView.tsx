export function JsonView({ value }: { value: unknown }): JSX.Element {
  return <pre>{JSON.stringify(value, null, 2)}</pre>;
}
