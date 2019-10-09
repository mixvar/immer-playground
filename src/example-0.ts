import { produce } from "immer";
import { clone as deepClone } from "remeda";

type Item = { id: number; key: string };

const items: Item[] = [
  { id: 1, key: "a" },
  { id: 2, key: "b" },
  { id: 3, key: "c" }
];

/**
 * If a tree falls in a forest and no one is around to hear it, does it make a sound?
 * If a pure function mutates some local data in order to produce an immutable return value, is that ok?
 * @see https://clojure.org/reference/transients
 */

const indexItems = (items: Item[]) =>
  items.reduce<Record<number, Item>>((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

console.log({ indexedItems: indexItems(items) });

// same change in 3 different ways

const naivelyChangeItems = (items: Item[]) => {
  const itemsCopy: Item[] = deepClone(items);

  itemsCopy[0].key = "A";
  itemsCopy.push({ id: 4, key: "d" });

  return itemsCopy;
};

const changeItemsWithImmer = (items: Item[]) =>
  produce(items, draft => {
    draft[0].key = "A";
    draft.push({ id: 4, key: "d" });
  });

const immutablyChangeItems = (items: Item[]) =>
  items
    .map((it, i) => (i === 0 ? { ...it, key: "A" } : it))
    .concat({ id: 4, key: "d" });

const naivelyChangedItems = naivelyChangeItems(items);
const itemsChangedWithImmer = changeItemsWithImmer(items);
const immutablyChangedItems = immutablyChangeItems(items);

console.log({ naivelyChangedItems });
console.log({ itemsChangedWithImmer });
console.log({ immutablyChangedItems });
console.log({ items });

const OldOrNewReference = (newItem: Item, i: number) =>
  newItem === items[i] ? "old" : "new";

console.log("references", {
  naivelyChangedItems: naivelyChangedItems.map(OldOrNewReference), // oops!
  itemsChangedWithImmer: itemsChangedWithImmer.map(OldOrNewReference), // structural sharing
  immutablyChangedItems: immutablyChangedItems.map(OldOrNewReference) // structural sharing
});

items[0].key = "mutation!";
// itemsChangedWithImmer[0].key = "mutation!"; // immer auto freezing causes TypeError
