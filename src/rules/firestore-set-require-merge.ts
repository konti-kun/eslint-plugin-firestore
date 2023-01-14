import { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "./utils/createRule";
import { getPropertyName } from "eslint-ast-utils";

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
    messages: {
      missingMerge: "Missing merge option parameter.",
      addOptionParameterMergeTrue: "Add radix parameter { merge: true }.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const generateSuggest = (node: TSESTree.CallExpression) => [
      {
        messageId: "addOptionParameterMergeTrue",
        fix(fixer: any) {
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
      } as any,
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
        if (!checkSet(node) && !checkSetDoc(node)) {
          return;
        }

        if (node.arguments.length <= 1) {
          context.report({
            messageId: "missingMerge",
            node,
            suggest: generateSuggest(node),
          });
          return;
        }
        const argument = node.arguments[1] as any;
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
