import { produce } from "immer";
import { equals as deepEqual } from "remeda";

/**
 * Example 1: reducer on list
 */

type Item = Readonly<{
  id: string;
  foo: string;
  bar: string;
}>;

type Action =
  | { type: "add"; paylaod: Item }
  | { type: "addAll"; paylaod: Item[] }
  | { type: "remove"; paylaod: { id: string } }
  | { type: "editFoo"; paylaod: { id: string; value: string } };

type State = Readonly<{
  otherStuff: string;
  items: readonly Item[];
}>;

const initialState: State = {
  otherStuff: "",
  items: []
};

// clasic

const vanillaReducer = (state = initialState, action: Action): State => {
  switch (action.type) {
    case "add":
      return {
        ...state,
        items: [...state.items, action.paylaod]
      };
    case "addAll":
      return {
        ...state,
        items: [...state.items, ...action.paylaod]
      };
    case "remove":
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.paylaod.id)
      };
    case "editFoo":
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.paylaod.id
            ? { ...item, foo: action.paylaod.value }
            : item
        )
      };
    default:
      return state;
  }
};

// immer

const immerReducer = (state = initialState, action: Action): State =>
  produce(state, draft => {
    switch (action.type) {
      case "add":
        draft.items.push(action.paylaod);
        break;

      case "addAll":
        draft.items.push(...action.paylaod);
        break;

      case "remove":
        draft.items = draft.items.filter(item => item.id !== action.paylaod.id);
        break;

      case "editFoo":
        const item = draft.items.find(item => item.id === action.paylaod.id);
        if (item) {
          item.foo = action.paylaod.value;
        }
        break;
    }
  });

// tests

console.log("Example 1: reducer on list");

const state: State = {
  otherStuff: "",
  items: [
    {
      id: "i1",
      foo: "foo",
      bar: "bar"
    },
    {
      id: "i2",
      foo: "foo",
      bar: "bar"
    }
  ]
};
const action: Action = {
  type: "editFoo",
  paylaod: { id: "i1", value: "new foo" }
};

const vanillaResult = vanillaReducer(state, action);
const immerResult = immerReducer(state, action);

console.log("same result", deepEqual(vanillaResult, immerResult));

console.log(
  "item 1 changed",
  state.items[0] !== vanillaResult.items[0] &&
    state.items[0] !== immerResult.items[0]
);

console.log(
  "item 2 unchanged",
  state.items[1] === vanillaResult.items[1] &&
    state.items[1] === immerResult.items[1]
);
