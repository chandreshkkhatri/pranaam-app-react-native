const DEFAULT_RECIPIENTS = [
  { id: "1", name: "Amit" },
  { id: "2", name: "Seema" },
  { id: "3", name: "Rohan" },
  { id: "4", name: "Neha" },
  { id: "5", name: "Suresh" },
  { id: "6", name: "Divya" },
  { id: "7", name: "Manish" },
  { id: "8", name: "Pooja" },
];

const ROW_HEIGHT = 64; // Height of each recipient row in the FlatList
const VISIBLE_ROWS = 4; // for clarity
const LIST_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;

export { DEFAULT_RECIPIENTS, ROW_HEIGHT, LIST_HEIGHT, VISIBLE_ROWS };
