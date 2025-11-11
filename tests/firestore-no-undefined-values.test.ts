import { RuleTester } from "./utils";

const tester = new RuleTester({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

tester.run(
  "noUndefinedValues",
  require("../src/rules/firestore-no-undefined-values"),
  {
    valid: [
      // set with valid values
      { code: "doc().set({ name: 'test', age: 20 })" },
      { code: "doc().set({ name: 'test', age: null })" },
      { code: "setDoc(doc(getFirestore(), 'test'), { content: 'aaa' })" },

      // update with valid values
      { code: "doc().update({ name: 'test' })" },
      { code: "updateDoc(doc(getFirestore(), 'test'), { content: 'aaa' })" },

      // create with valid values (addDoc)
      { code: "addDoc(collection(getFirestore(), 'test'), { content: 'aaa' })" },
      { code: "collection().doc().create({ name: 'test' })" },

      // Variables with known values (not undefined)
      { code: "const data = { name: 'test' }; doc().set(data)" },

      // Conditional that filters out undefined
      { code: "const value = someValue !== undefined ? someValue : 'default'; doc().set({ value })" },

      // Batch operations with valid values (without options)
      { code: "batch.set({ name: 'test' })" },
      { code: "batch.update({ name: 'test' })" },
      { code: "batch.create({ name: 'test' })" },

      // Batch operations with valid values (with options)
      {
        code: "batch.set({ name: 'test' })",
        options: [{ additionalObjects: ["batch"] }],
      },
      {
        code: "batch.update({ name: 'test' })",
        options: [{ additionalObjects: ["batch"] }],
      },
      {
        code: "batch.create({ name: 'test' })",
        options: [{ additionalObjects: ["batch"] }],
      },

      // Custom object name
      {
        code: "transaction.set({ name: 'test' })",
        options: [{ additionalObjects: ["transaction"] }],
      },
    ],
    invalid: [
      // set with undefined
      {
        code: "doc().set({ name: undefined })",
        errors: [{ messageId: "noUndefinedValues" }],
      },
      {
        code: "doc().set({ name: 'test', age: undefined })",
        errors: [{ messageId: "noUndefinedValues" }],
      },
      {
        code: "setDoc(doc(getFirestore(), 'test'), { content: undefined })",
        errors: [{ messageId: "noUndefinedValues" }],
      },
      {
        code: "const value = undefined; doc().set({ value })",
        errors: [{ messageId: "noUndefinedValues" }],
      },

      // update with undefined
      {
        code: "doc().update({ name: undefined })",
        errors: [{ messageId: "noUndefinedValues" }],
      },
      {
        code: "updateDoc(doc(getFirestore(), 'test'), { content: undefined })",
        errors: [{ messageId: "noUndefinedValues" }],
      },

      // create (addDoc) with undefined
      {
        code: "addDoc(collection(getFirestore(), 'test'), { content: undefined })",
        errors: [{ messageId: "noUndefinedValues" }],
      },
      {
        code: "collection().doc().create({ name: undefined })",
        errors: [{ messageId: "noUndefinedValues" }],
      },

      // Nested undefined
      {
        code: "doc().set({ user: { name: undefined } })",
        errors: [{ messageId: "noUndefinedValues" }],
      },

      // Shorthand property with undefined variable
      {
        code: "const name = undefined; doc().set({ name })",
        errors: [{ messageId: "noUndefinedValues" }],
      },

      // Batch operations with undefined (with options)
      {
        code: "batch.set({ name: undefined })",
        options: [{ additionalObjects: ["batch"] }],
        errors: [{ messageId: "noUndefinedValues" }],
      },
      {
        code: "batch.update({ name: undefined })",
        options: [{ additionalObjects: ["batch"] }],
        errors: [{ messageId: "noUndefinedValues" }],
      },
      {
        code: "batch.create({ name: undefined })",
        options: [{ additionalObjects: ["batch"] }],
        errors: [{ messageId: "noUndefinedValues" }],
      },

      // Custom object name with undefined
      {
        code: "transaction.set({ name: undefined })",
        options: [{ additionalObjects: ["transaction"] }],
        errors: [{ messageId: "noUndefinedValues" }],
      },
    ],
  }
);
