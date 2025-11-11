"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createRule_1 = require("./utils/createRule");
const eslint_ast_utils_1 = require("eslint-ast-utils");
const messages = {
    noUndefinedValues: "Firestore does not support undefined values in set(), update(), or create() operations. Use null instead or remove the field.",
};
module.exports = (0, createRule_1.createRule)({
    name: "firestore-no-undefined-values",
    meta: {
        docs: {
            description: "Disallow undefined values in Firestore set(), update(), and create() operations",
            recommended: 'error',
        },
        type: "problem",
        messages,
        schema: [],
    },
    defaultOptions: [],
    create(context) {
        function isFirestoreWriteOperation(node) {
            const callee = node.callee;
            if (callee.type === "Identifier") {
                return ["setDoc", "updateDoc", "addDoc"].includes(callee.name);
            }
            if (callee.type === "MemberExpression") {
                const propertyName = (0, eslint_ast_utils_1.getPropertyName)(callee);
                return ["set", "update", "create"].includes(propertyName || "");
            }
            return false;
        }
        function getDataArgumentIndex(node) {
            const callee = node.callee;
            if (callee.type === "Identifier" &&
                (callee.name === "setDoc" || callee.name === "updateDoc" || callee.name === "addDoc")) {
                return 1;
            }
            return 0;
        }
        function hasUndefinedValue(node) {
            var _a;
            if (!node)
                return false;
            if (node.type === "Identifier" && node.name === "undefined") {
                return true;
            }
            if (node.type === "ObjectExpression") {
                return node.properties.some((prop) => {
                    if (prop.type === "Property") {
                        if (hasUndefinedValue(prop.value)) {
                            return true;
                        }
                    }
                    if (prop.type === "SpreadElement") {
                        return false;
                    }
                    return false;
                });
            }
            if (node.type === "Identifier") {
                const sourceCode = context.getSourceCode();
                const scope = ((_a = sourceCode.scopeManager) === null || _a === void 0 ? void 0 : _a.acquire(node)) || context.getScope();
                const variable = scope.set.get(node.name);
                if (variable && variable.defs.length > 0) {
                    const def = variable.defs[0];
                    if (def.type === "Variable" && def.node.init) {
                        return hasUndefinedValue(def.node.init);
                    }
                }
            }
            return false;
        }
        return {
            CallExpression: (node) => {
                if (!isFirestoreWriteOperation(node)) {
                    return;
                }
                const dataIndex = getDataArgumentIndex(node);
                const dataArg = node.arguments[dataIndex];
                if (!dataArg) {
                    return;
                }
                if (hasUndefinedValue(dataArg)) {
                    context.report({
                        messageId: "noUndefinedValues",
                        node: dataArg,
                    });
                }
            },
        };
    },
});
