# Enforce the consistent use of the merge option argument when using `DocumentReference.set() or setDoc() of firebase/firestore`

In most cast, DocumentReference.set() or setDoc() requires merge option. 
We created this rule because missing merge option would lead to an important mistake by unintentionally overwriting all document data.

## Rule Details

Examples of **incorrect** code for this rule:

```js
setDoc(doc(getFirestore(), 'messages', 'MESSAGE1'), { content: 'Hello!' })
```

Examples of **correct** code for this rule:
```js
setDoc(doc(getFirestore(), 'messages', 'MESSAGE1'), { content: 'Hello!' }, { merge: true })
```


## Resources

- [Rule Source](https://github.com/konti-kun/eslint-plugin-firestore/blob/main/src/rules/firestore-set-require-merge.ts)
- [Test Source](https://github.com/konti-kun/eslint-plugin-firestore/blob/main/tests/firestore-set-require-merge.test.ts)