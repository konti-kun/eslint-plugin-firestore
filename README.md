# eslint-plugin-firestore

Firestore linting rules for ESLint.

## Install

```
npm install --save-dev @sonicgarden/eslint-plugin-firestore 
```

## Configuration

1. Add plugins section and specify eslint-plugin-firestore as a plugin.
2. Enable rules.

```json
{
  plugins: [ "@sonicgarden/firestore"],
  rules: {
    "@sonicgarden/firestore/firestore-set-require-merge": "warn",
  },
}
```

