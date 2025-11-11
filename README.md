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
    "@sonicgarden/firestore/firestore-no-undefined-values": "error",
  },
}
```

## Rules

### `firestore-no-undefined-values`

Disallows `undefined` values in Firestore `set()`, `update()`, and `create()` operations, as Firestore does not support `undefined` values.

#### Default Behavior

By default, this rule checks the following Firestore operations:

- Function calls like `setDoc()`, `updateDoc()`, `addDoc()`
- Method calls like `doc().set()`, `doc().update()`, `doc().create()`

```javascript
// ❌ Bad
doc().set({ name: undefined });
setDoc(docRef, { age: undefined });

// ✅ Good
doc().set({ name: null });
doc().set({ name: 'value' });
```

#### Options

Use the `additionalObjects` option to include custom objects like `batch` or `transaction` in the check.

```json
{
  "@sonicgarden/firestore/firestore-no-undefined-values": [
    "error",
    {
      "additionalObjects": ["batch", "transaction"]
    }
  ]
}
```

With this configuration, the following code will also be checked:

```javascript
// ❌ Bad
batch.set({ name: undefined });
batch.update({ age: undefined });
transaction.create({ status: undefined });

// ✅ Good
batch.set({ name: null });
batch.update({ age: null });
transaction.create({ status: 'active' });
```

