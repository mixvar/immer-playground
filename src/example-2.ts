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
  | { type: "add"; payload: Item }
  | { type: "addAll"; payload: Item[] }
  | { type: "remove"; payload: { id: string } }
  | { type: "editFoo"; payload: { id: string; value: string } };

type Dictionary<T> = {
  readonly [key: string]: T | undefined;
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
          [action.payload.id]: action.payload
        }
      };
    case "addAll":
      return {
        ...state,
        items: action.payload.reduce(
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
          Object.entries(state.items).filter(([id]) => id !== action.payload.id)
        )
      };
    case "editFoo":
      return {
        ...state,
        items: Object.fromEntries(
          Object.entries(state.items).map(([id, item]) =>
            id === action.payload.id
              ? [id, { ...item, foo: action.payload.value }]
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
        draft.items[action.payload.id] = action.payload;
        break;

      case "addAll":
        action.payload.forEach(item => {
          draft.items[item.id] = item;
        });
        break;

      case "remove":
        delete draft.items[action.payload.id];
        break;

      case "editFoo":
        const item = draft.items[action.payload.id];
        if (item) {
          item.foo = action.payload.value;
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
  payload: { id: "i1", value: "new foo" }
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
