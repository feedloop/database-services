export function validIdentifier(name: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

export function validateCondition(condition: any): void {
  if (typeof condition === 'object' && condition !== null) {
    for (const value of Object.values(condition)) {
      if (typeof value === 'string' && /['";]/.test(value)) {
        throw new Error(`Invalid value detected in condition`);
      }
      if (typeof value === 'object') {
        validateCondition(value);
      }
    }
  }
}

export function validateData(data: Record<string, any>): void {
  for (const value of Object.values(data)) {
    if (typeof value === 'string' && /['";]/.test(value)) {
      throw new Error(`Invalid value detected in data`);
    }
    if (typeof value === 'object') {
      validateCondition(value);
    }
  }
}
