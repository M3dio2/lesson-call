import * as Y from "yjs";

type BoardElement = { version: number; versionNonce: number; isDeleted: boolean; updated: number };

// Teacher's "Clear" button: empties the text pad and the whiteboard for everyone.
// Whiteboard elements are marked deleted with a higher version (Excalidraw's own way of
// deleting), so reconcileElements removes them from every open scene.
export function clearLesson(doc: Y.Doc) {
  const board = doc.getMap<BoardElement>("board");
  const text = doc.getXmlFragment("default"); // Tiptap Collaboration's default field

  doc.transact(() => {
    for (const [id, element] of board) {
      if (element.isDeleted) continue;
      board.set(id, {
        ...element,
        isDeleted: true,
        version: element.version + 1,
        versionNonce: Math.floor(Math.random() * 2 ** 31),
        updated: Date.now(),
      });
    }
    text.delete(0, text.length);
  });
}
