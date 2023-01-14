"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createRule_1 = require("./utils/createRule");
const eslint_ast_utils_1 = require("eslint-ast-utils");
module.exports = (0, createRule_1.createRule)({
    name: "firestore-set-required-merge",
    meta: {
        docs: {
            description: "Enforce the consistent use of the merge option argument when using `DocumentReference.set() or setDoc() of firebase/firestore`",
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
        const generateSuggest = (node) => [
            {
                messageId: "addOptionParameterMergeTrue",
                fix(fixer) {
                    const sourceCode = context.getSourceCode();
                    const tokens = sourceCode.getTokens(node);
                    const lastToken = tokens[tokens.length - 1];
                    const secondToLastToken = tokens[tokens.length - 2];
                    const hasTrailingComma = secondToLastToken.type === "Punctuator" &&
                        secondToLastToken.value === ",";
                    return fixer.insertTextBefore(lastToken, hasTrailingComma ? " { merge: true }" : ", { merge: true }");
                },
            },
        ];
        function checkSetDoc(node) {
            const callee = node.callee;
            if (callee.name !== "setDoc") {
                return false;
            }
            return true;
        }
        function checkSet(node) {
            var _a, _b;
            const callee = node.callee;
            const propertyName = (0, eslint_ast_utils_1.getPropertyName)(callee);
            if (propertyName !== "set") {
                return false;
            }
            if (((_b = (_a = callee.object) === null || _a === void 0 ? void 0 : _a.callee) === null || _b === void 0 ? void 0 : _b.name) !== "doc") {
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
                const argument = node.arguments[1];
                const haveMergeTrue = argument.properties.some(({ key, value, }) => (key.name === "merge" && value.value) ||
                    (key.name === "mergeFields" && value.type === "ArrayExpression"));
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
