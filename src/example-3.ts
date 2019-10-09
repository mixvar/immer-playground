import { produce, Draft } from "immer";
import { equals as deepEqual } from "remeda";
/**
 * Example 3: corner case
 *
 * Immer assumes your state to be a unidirectional tree.
 * That is, no object should appear twice in the tree,
 * and there should be no circular references.
 *
 * @see https://immerjs.github.io/immer/docs/pitfalls
 */

type FormSubData = Readonly<{ foo: string; bar: string }>;

type FormData = Readonly<{
  subObjectA: FormSubData;
  subObjectB: FormSubData;
}>;

type CategoryId = string;

type State = Readonly<{
  fetchedData: FormData;
  editedPerCategory: Record<CategoryId, FormData>;
}>;

const initialState: State = {
  fetchedData: {
    subObjectA: { foo: "foo", bar: "bar" },
    subObjectB: { foo: "foo", bar: "bar" }
  },
  editedPerCategory: {}
};

type Action =
  | { type: "doSomeTransformation" }
  | {
      type: "editA";
      paylaod: { categoryId: CategoryId; changes: Partial<FormSubData> };
    }
  | {
      type: "editB";
      paylaod: { categoryId: CategoryId; changes: Partial<FormSubData> };
    };

const immerReducer = (state = initialState, action: Action): State =>
  produce(state, draft => {
    switch (action.type) {
      case "editA": {
        const { categoryId, changes } = action.paylaod;
        initEditorDataIfAbsent(draft, categoryId);

        draft.editedPerCategory[categoryId].subObjectA = {
          ...draft.editedPerCategory[categoryId].subObjectA,
          ...changes
        };
        break;
      }

      case "editB": {
        const { categoryId, changes } = action.paylaod;
        initEditorDataIfAbsent(draft, categoryId);

        draft.editedPerCategory[categoryId].subObjectB = {
          ...draft.editedPerCategory[categoryId].subObjectB,
          ...changes
        };
        break;
      }
    }
  });

function initEditorDataIfAbsent(state: Draft<State>, categoryId: CategoryId) {
  if (state.editedPerCategory[categoryId] == null) {
    state.editedPerCategory[categoryId] = state.fetchedData;
  }
}

// tests

console.log("Example 3: corner case");

const state: State = {
  fetchedData: {
    subObjectA: { foo: "foo.a", bar: "bar.a" },
    subObjectB: { foo: "foo.b", bar: "bar.b" }
  },
  editedPerCategory: {}
};
const action: Action = {
  type: "editA",
  paylaod: { categoryId: "c1", changes: { foo: "foo.a.new!" } }
};

const result = immerReducer(state, action);

console.log("before", JSON.stringify(state, null, 2));

console.log("after", JSON.stringify(result, null, 2));

console.log(
  "fetchedData changed?",
  !deepEqual(state.fetchedData, result.fetchedData)
);
