import { RuleTester } from "./utils";

const tester = new RuleTester({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
});
const message = {
  messageId: "missingMerge",
};
tester.run(
  "setRequireMerge",
  require("../src/rules/firestore-set-require-merge"),
  {
    valid: [
      { code: "doc().set({}, { merge: true})" },
      { code: "collection().doc().set({}, { merge: true})" },
      {
        code: "setDoc(doc(getFirestore(), 'test'), {content: 'aaa'}, { merge: true})",
      },
      {
        code: "setDoc(doc(getFirestore(), 'test'), {content: 'bbbb'}, { mergeFields: []})",
      },
    ],
    invalid: [
      {
        code: "doc().set({});",
        errors: [
          {
            messageId: "missingMerge",
            suggestions: [
              {
                messageId: "addOptionParameterMergeTrue",
                output: "doc().set({}, { merge: true });",
              },
              {
                messageId: "changeUpdate",
                output: "doc().update({});",
              },
            ],
          },
        ],
      },
      {
        code: "doc().set({},);",
        errors: [
          {
            messageId: "missingMerge",
            suggestions: [
              {
                messageId: "addOptionParameterMergeTrue",
                output: "doc().set({}, { merge: true });",
              },
              {
                messageId: "changeUpdate",
                output: "doc().update({},);",
              },
            ],
          },
        ],
      },
      {
        code: "setDoc(doc(getFirestore(), 'test'), {content: 'aaa'})",
        errors: [
          {
            messageId: "missingMerge",
            suggestions: [
              {
                messageId: "addOptionParameterMergeTrue",
                output: "setDoc(doc(getFirestore(), 'test'), {content: 'aaa'}, { merge: true })",
              },
              {
                messageId: "changeUpdate",
                output: "updateDoc(doc(getFirestore(), 'test'), {content: 'aaa'})",
              },
            ],
          },
        ],
      },
      {
        code: "setDoc(doc(getFirestore(), {content: 'aaa'}, {merge: 'aaa'}))",
        errors: [message],
      },
      {
        code: "setDoc(doc(getFirestore(), {content: 'aaa'}, {mergeFields: true}))",
        errors: [message],
      },
    ],
  }
);
