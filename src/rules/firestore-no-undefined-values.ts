import { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "./utils/createRule";
import { getPropertyName } from "eslint-ast-utils";

const messages = {
  noUndefinedValues:
    "Firestore does not support undefined values in set(), update(), or create() operations. Use null instead or remove the field.",
};

type RuleOptions = {
  additionalObjects?: string[];
};

module.exports = createRule<[RuleOptions?], "noUndefinedValues">({
  name: "firestore-no-undefined-values",
  meta: {
    docs: {
      description:
        "Disallow undefined values in Firestore set(), update(), and create() operations",
      recommended: 'error',
    },
    type: "problem",
    messages,
    schema: [
      {
        type: "object",
        properties: {
          additionalObjects: {
            type: "array",
            items: {
              type: "string",
            },
            description:
              "Additional object names (e.g., 'batch', 'transaction') to check for set(), update(), and create() methods",
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{}],
  create(context) {
    const options = context.options[0] || {};
    const additionalObjects = options.additionalObjects || [];
    // Check if the function is one of: set, setDoc, update, updateDoc, addDoc, create
    function isFirestoreWriteOperation(node: TSESTree.CallExpression): boolean {
      const callee = node.callee as any;

      // Check for direct function calls: setDoc, updateDoc, addDoc
      if (callee.type === "Identifier") {
        return ["setDoc", "updateDoc", "addDoc"].includes(callee.name);
      }

      // Check for method calls: doc().set(), doc().update(), doc().create()
      // or custom objects like batch.set(), transaction.update()
      if (callee.type === "MemberExpression") {
        const propertyName = getPropertyName(callee);
        if (!["set", "update", "create"].includes(propertyName || "")) {
          return false;
        }

        // If additionalObjects is specified, check if the object matches
        if (additionalObjects.length > 0) {
          const object = callee.object;
          if (object.type === "Identifier") {
            return additionalObjects.includes(object.name);
          }
          // Also support chained calls like doc().set()
          return true;
        }

        // Default behavior: allow all method calls with set/update/create
        return true;
      }

      return false;
    }

    // Get the data argument index based on the operation type
    function getDataArgumentIndex(node: TSESTree.CallExpression): number {
      const callee = node.callee as any;

      // For setDoc, updateDoc, and addDoc, data is the second argument (index 1)
      if (
        callee.type === "Identifier" &&
        (callee.name === "setDoc" || callee.name === "updateDoc" || callee.name === "addDoc")
      ) {
        return 1;
      }

      // For method calls (set, update, create), data is the first argument (index 0)
      return 0;
    }

    // Check if an expression contains undefined
    function hasUndefinedValue(node: TSESTree.Node): boolean {
      if (!node) return false;

      // Direct undefined identifier
      if (node.type === "Identifier" && node.name === "undefined") {
        return true;
      }

      // Object expression with undefined values
      if (node.type === "ObjectExpression") {
        return node.properties.some((prop) => {
          if (prop.type === "Property") {
            // Check property value
            if (hasUndefinedValue(prop.value)) {
              return true;
            }
          }
          if (prop.type === "SpreadElement") {
            // For spread elements, we can't easily check without data flow analysis
            // So we'll skip them for now
            return false;
          }
          return false;
        });
      }

      // Check if it's a variable that might be undefined
      // For a more complete implementation, we'd need to track variable declarations
      // For now, we'll do basic checks
      if (node.type === "Identifier") {
        // Try to find the variable declaration in the scope
        const sourceCode = context.getSourceCode();
        const scope = sourceCode.scopeManager?.acquire(node) || context.getScope();
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
