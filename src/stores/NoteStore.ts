import { APIInstance } from "@/utils/Axios";

import { defineStore, storeToRefs } from "pinia";
import { ref } from "vue";
import { useNotificationStore } from "./NotificationStore";
import { useActiveUserStore } from "./ActiveUserStore";

interface Note {
  id: string;
  creatorID: string;
  userID: string;
  note: string;
}

export const useNotesStore = defineStore("note", () => {
  const notes = ref<{
    [userID: string]: string;
  }>({});

  const activeUserData = storeToRefs(useActiveUserStore()).activeUserData;

  const saveNote = async (userID: string, note: string) => {
    try {
      await APIInstance.request({
        method: "POST",
        url: "/notes/update",
        data: { creatorID: activeUserData.value?.id, userID, note },
      });

      return true;
    } catch {
      useNotificationStore().pushAlert({
        type: "warn",
        message: "Failed to update note",
      });
      return false;
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await APIInstance.request({
        method: "GET",
        url: `/notes/getUserNotes/`,
      });

      if (res.data.notes) {
        res.data.notes.forEach((note: Note) => {
          notes.value![note.userID] = note.note;
        });
      } else throw "Err";

      return true;
    } catch {
      return false;
    }
  };

  return {
    notes,
    saveNote,
    fetchNotes,
  };
});
