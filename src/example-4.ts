import { produce, Draft, Immutable } from "immer";

type User = {
  readonly name: string;
  readonly posts: ReadonlyArray<{
    title: string;
    content: string;
  }>;
};

const doSomeTransformation = (user: User): User => ({
  ...user,
  posts: user.posts.map(it => ({
    title: it.title.toUpperCase(),
    content: it.content.toLowerCase()
  }))
});

type State = {
  user: User;
};

const initialState: State = {
  user: {
    name: "joe",
    posts: [{ title: "Foo", content: "Bar" }]
  }
};

type Action = { type: "transformData" };

const immerReducer = (state = initialState, action: Action): State =>
  produce(state, draft => {
    switch (action.type) {
      case "transformData": {
        draft.user = doSomeTransformation(draft.user);
        break;
      }
    }
  });

console.log(
  JSON.stringify(immerReducer(initialState, { type: "transformData" }))
);

let mutableArray: number[] = []; // Array<number>
let immutableArray: readonly number[] = []; // ReadonlyArray<number>

immutableArray = mutableArray;
mutableArray = immutableArray;
