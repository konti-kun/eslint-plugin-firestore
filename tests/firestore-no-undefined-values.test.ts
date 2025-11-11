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
    ],
  }
);
