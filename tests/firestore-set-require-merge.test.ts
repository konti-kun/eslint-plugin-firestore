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
      { code: "setDoc(doc(getFirestore(), 'test'), { merge: true})" },
      { code: "setDoc(doc(getFirestore(), 'test'), { mergeFields: []})" },
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
            ],
          },
        ],
      },
      { code: "setDoc(doc(getFirestore(), 'test'))", errors: [message] },
      { code: "setDoc(doc(getFirestore(), {merge: 'aaa'}))", errors: [message] },
      { code: "setDoc(doc(getFirestore(), {mergeFields: true}))", errors: [message] },
    ],
  }
);
