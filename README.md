# eslint-plugin-firestore

Firestore linting rules for ESLint.

## Install

```
npm install --save-dev eslint-plugin-firestore 
```

## Configuration

1. Add plugins section and specify eslint-plugin-firestore as a plugin.
2. Enable rules.

```json
{
  plugins: [ "@konti-kun/firestore"],
  rules: {
    "@konti-kun/firestore/firestore-set-require-merge": "warn",
  },
}
```

