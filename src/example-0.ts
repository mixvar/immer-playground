import { produce } from "immer";
import { clone as deepClone } from "remeda";

/**
 *  intro
 *  @see https://medium.com/hackernoon/introducing-immer-immutability-the-easy-way-9d73d8f71cb3
 *
 *  If a tree falls in a forest and no one is around to hear it, does it make a sound?
 *  If a pure function mutates some local data in order to produce an immutable return value, is that ok?
 *  @see https://clojure.org/reference/transients
 */

type Item = { id: number; key: string };

const items: Item[] = [
  { id: 1, key: "a" },
  { id: 2, key: "b" },
  { id: 3, key: "c" }
];

// create a new value without modifying previous, while performing some mutations in local scope:

const indexedItems = items.reduce<Record<number, Item>>((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

console.log({ indexedItems });

// same change in 3 different ways

const immutablyChangedItems = items
  .map((it, i) => (i === 0 ? { ...it, key: "A" } : it))
  .concat({ id: 4, key: "d" });

const mutablyChangedItems = produce(items, draft => {
  draft[0].key = "A";
  draft.push({ id: 4, key: "d" });
});

const naivelyChangedItems = (() => {
  const itemsCopy: Item[] = deepClone(items);

  itemsCopy[0].key = "A";
  itemsCopy.push({ id: 4, key: "d" });

  return itemsCopy;
})();

console.log({ immutablyChangedItems });
console.log({ mutablyChangedItems });
console.log({ naivelyChangedItems });
console.log({ items });

const OldOrNewReference = (newItem: Item, i: number) =>
  newItem === items[i] ? "old" : "new";

console.log("references", {
  mutablyChangedItems: mutablyChangedItems.map(OldOrNewReference),
  immutablyChangedItems: immutablyChangedItems.map(OldOrNewReference),
  naivelyChangedItems: naivelyChangedItems.map(OldOrNewReference)
});

// changedItems[0].key = "asd"; // immer auto freezing causes TypeError
