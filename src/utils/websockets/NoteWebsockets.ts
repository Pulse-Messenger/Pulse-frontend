import { storeToRefs } from "pinia";

import { socket } from "@/utils/Socket";
import { useNotesStore } from "@/stores/NoteStore";

const loadNoteWebsockets = () => {
  const notes = storeToRefs(useNotesStore()).notes;

  socket.on(
    "notes:update",
    async (data: {
      note: {
        userID: string;
        note: string;
      };
    }) => {
      notes.value[data.note.userID] = data.note.note;
    }
  );
};

export default loadNoteWebsockets;
