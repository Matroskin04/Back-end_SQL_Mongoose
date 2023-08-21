export function createBodyErrorBadRequest(message: string, field: string) {
  return [
    {
      message,
      field,
    },
  ];
}
