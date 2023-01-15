import { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "./utils/createRule";
import { getPropertyName } from "eslint-ast-utils";
import {
  ReportSuggestionArray,
  RuleFixer,
} from "@typescript-eslint/utils/dist/ts-eslint";

const messages = {
  missingMerge: "Missing merge option parameter.",
  addOptionParameterMergeTrue: "Add option parameter { merge: true }.",
  changeUpdate: "Change from set to update.",
};

module.exports = createRule({
  name: "firestore-set-required-merge",
  meta: {
    docs: {
      description:
        "Enforce the consistent use of the merge option argument when using `DocumentReference.set() or setDoc() of firebase/firestore`",
      recommended: false,
    },
    hasSuggestions: true,
    type: "suggestion",
    messages,
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const generateSuggest = (
      node: TSESTree.CallExpression
    ): ReportSuggestionArray<keyof typeof messages> => [
      {
        messageId: "addOptionParameterMergeTrue",
        fix(fixer: RuleFixer) {
          const sourceCode = context.getSourceCode();
          const tokens = sourceCode.getTokens(node);
          const lastToken = tokens[tokens.length - 1];
          const secondToLastToken = tokens[tokens.length - 2];
          const hasTrailingComma =
            secondToLastToken.type === "Punctuator" &&
            secondToLastToken.value === ",";

          return fixer.insertTextBefore(
            lastToken,
            hasTrailingComma ? " { merge: true }" : ", { merge: true }"
          );
        },
      },
      {
        messageId: "changeUpdate",
        fix(fixer: RuleFixer) {
          const sourceCode = context.getSourceCode();
          const tokens = sourceCode.getTokens(node);

          const setDocIndex = tokens.findIndex(
            (token) => token.value === "setDoc"
          );
          if (setDocIndex >= 0) {
            return fixer.replaceText(tokens[setDocIndex], "updateDoc");
          }
          const setIndex = tokens.findIndex((token) => token.value === "set");
          if (setIndex >= 0) {
            return fixer.replaceText(tokens[setIndex], "update");
          }
          return null;
        },
      },
    ];

    function checkSetDoc(node: TSESTree.CallExpression): boolean {
      const callee = node.callee as { name: string };

      if (callee.name !== "setDoc") {
        return false;
      }

      return true;
    }

    function checkSet(node: TSESTree.CallExpression): boolean {
      const callee = node.callee as any;

      const propertyName = getPropertyName(callee);
      if (propertyName !== "set") {
        return false;
      }
      if (callee.object?.callee?.name !== "doc") {
        return false;
      }
      return true;
    }
    return {
      CallExpression: (node) => {
        const isSet = checkSet(node);
        const isSetDoc = checkSetDoc(node);
        if (!isSet && !isSetDoc) {
          return;
        }

        const mergeIndex = isSet ? 1 : 2;
        if (node.arguments.length <= mergeIndex) {
          context.report({
            messageId: "missingMerge",
            node,
            suggest: generateSuggest(node),
          });
          return;
        }
        const argument = node.arguments[mergeIndex] as any;
        const haveMergeTrue = argument.properties.some(
          ({
            key,
            value,
          }: {
            key: { name: string };
            value: { value: boolean; type: string };
          }) =>
            (key.name === "merge" && value.value) ||
            (key.name === "mergeFields" && value.type === "ArrayExpression")
        );
        if (haveMergeTrue) {
          return true;
        }
        context.report({
          messageId: "missingMerge",
          node,
          suggest: generateSuggest(node),
        });
        return false;
      },
    };
  },
});
