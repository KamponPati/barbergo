export function JsonView({ value }: { value: unknown }): JSX.Element {
  return <pre className="json-view">{JSON.stringify(value, null, 2)}</pre>;
}
