import { produce } from "immer";
import { equals as deepEqual } from "remeda";

/**
 * Example 2: reducer on dictionary
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

type Dictionary<T> = {
  readonly [key: string]: T;
};

type State = Readonly<{
  otherStuff: string;
  items: Dictionary<Item>;
}>;

const initialState: State = {
  otherStuff: "",
  items: {}
};

// clasic

const classicReducer = (state = initialState, action: Action): State => {
  switch (action.type) {
    case "add":
      return {
        ...state,
        items: {
          ...state.items,
          [action.paylaod.id]: action.paylaod
        }
      };
    case "addAll":
      return {
        ...state,
        items: action.paylaod.reduce(
          (map, item) => ({
            ...map,
            [item.id]: item
          }),
          state.items
        )
      };
    case "remove":
      return {
        ...state,
        items: Object.fromEntries(
          Object.entries(state.items).filter(([id]) => id !== action.paylaod.id)
        )
      };
    case "editFoo":
      return {
        ...state,
        items: Object.fromEntries(
          Object.entries(state.items).map(([id, item]) =>
            id === action.paylaod.id
              ? [id, { ...item, foo: action.paylaod.value }]
              : [id, item]
          )
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
        draft.items[action.paylaod.id] = action.paylaod;
        break;

      case "addAll":
        action.paylaod.forEach(item => {
          draft.items[item.id] = item;
        });
        break;

      case "remove":
        delete draft.items[action.paylaod.id];
        break;

      case "editFoo":
        const item = draft.items[action.paylaod.id];
        if (item) {
          item.foo = action.paylaod.value;
        }
        break;
    }
  });

// tests

console.log("Example 2: reducer on dictionary");

const state: State = {
  otherStuff: "",
  items: {
    i1: {
      id: "i1",
      foo: "foo",
      bar: "bar"
    },
    i2: {
      id: "i2",
      foo: "foo",
      bar: "bar"
    }
  }
};
const action: Action = {
  type: "editFoo",
  paylaod: { id: "i1", value: "new foo" }
};

const resultA = classicReducer(state, action);
const resultB = immerReducer(state, action);

console.log("same result", deepEqual(resultA, resultB));

console.log(
  "item 1 changed",
  state.items["i1"] !== resultA.items["i1"] &&
    state.items["i1"] !== resultB.items["i1"]
);

console.log(
  "item 2 unchanged",
  state.items["i2"] === resultA.items["i2"] &&
    state.items["i2"] === resultB.items["i2"]
);
