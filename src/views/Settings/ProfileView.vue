<script setup lang="ts">
import { useCommonStore } from "@/stores/CommonStore";
import SettingModalComponent from "@/components/modals/SettingModalComponent.vue";

import { storeToRefs } from "pinia";
import { computed, ref, onMounted } from "vue";
import { useNotificationStore } from "@/stores/NotificationStore";
import { useActiveUserStore } from "@/stores/ActiveUserStore";

interface ModalData {
  show: boolean;
  placeholder: string;
  title: string;
  validate: Function;
  inputType?: string;
  source: string;
}

const activeUser = storeToRefs(useActiveUserStore()).activeUserData;

const getAboutLength = computed(() => {
  return tempValues.value?.about.length ?? 0;
});

const waiting = ref(false);

const changed = computed(() => {
  return (
    tempValues.value.about != activeUser.value?.about ||
    tempValues.value.displayName != activeUser.value?.displayName ||
    tempValues.value.email != activeUser.value?.email ||
    tempValues.value.profilePic != activeUser.value.profilePic ||
    tempValues.value.password != "**********"
  );
});

const tempValues = ref({
  displayName: "",
  email: "",
  about: "",
  profilePic: "",
  password: "",
});

type TempValuesSource = "displayName" | "email" | "about" | "password";
const fillerPassword = "**********";

onMounted(() => {
  tempValues.value = {
    profilePic: activeUser.value?.profilePic ?? "",
    about: activeUser.value?.about ?? "",
    displayName: activeUser.value?.displayName ?? "",
    email: activeUser.value?.email ?? "",
    password: fillerPassword,
  };
});

const formData = ref();

const uploadImage = async (fileData: File) => {
  const correctSize = fileData.size < 20_971_520; // 20MB
  if (!correctSize) {
    useNotificationStore().pushAlert({
      type: "error",
      message: "File must be less than 20MB in size",
    });
    return;
  }
  const correctType = fileData.type.startsWith("image/");
  if (!correctType) {
    useNotificationStore().pushAlert({
      type: "error",
      message: "Invalid file format",
    });
    return;
  }

  formData.value = new FormData();
  formData.value.append("file", fileData);
  tempValues.value.profilePic = URL.createObjectURL(formData.value.get("file"));
};

const focusInput = () => {
  document.querySelector("textarea")?.focus();
};

const modal = ref<ModalData>({
  show: false,
  placeholder: "",
  title: "",
  validate: () => true,
  inputType: "",
  source: "",
});

const openModal = (data: {
  placeholder: string;
  title: string;
  validate: Function;
  inputType: string;
  source: string;
}) => {
  modal.value = { ...data, show: true };
};

const closeModal = () => {
  modal.value = {
    show: false,
    placeholder: "",
    title: "",
    validate: () => true,
    inputType: "",
    source: "",
  };
};

const userCardOptions = [
  {
    source: "displayName",
    placeholder: "Display name",
    title: "Change your display name",
    inputType: "text",
    validate: (input: string) =>
      input.trim().length >= 5 && input.trim().length <= 20,
  },
  {
    source: "password",
    placeholder: "Password",
    title: "Change your password",
    inputType: "password",
    validate: () => true,
  },
];

const save = async () => {
  waiting.value = true;
  const res = await useActiveUserStore().updateUser({
    about: tempValues.value.about,
    displayName: tempValues.value.displayName,
    profilePic: formData.value,
    password:
      tempValues.value.password === fillerPassword
        ? undefined
        : tempValues.value.password,
  });
  if (res) {
    tempValues.value.password = fillerPassword;
    tempValues.value.profilePic = activeUser.value?.profilePic ?? "";
  }
  waiting.value = false;
};

const undo = async () => {
  tempValues.value = {
    profilePic: activeUser.value?.profilePic ?? "",
    about: activeUser.value?.about ?? "",
    displayName: activeUser.value?.displayName ?? "",
    email: activeUser.value?.email ?? "",
    password: fillerPassword,
  };

  useNotificationStore().pushAlert({
    type: "warn",
    message: "Changes discarded",
  });
};
</script>

<template>
  <div class="category">
    <div class="user-card">
      <div class="head">
        <div class="pfp">
          <img id="profilePic" :src="tempValues.profilePic" />
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.gif"
            @input="(e: any) => uploadImage(e.target.files[0])"
          />
        </div>
        <div class="about-wrapper" @click="focusInput()">
          <span class="label">About</span>
          <span class="count"
            ><span :class="{ exceed: getAboutLength > 200 }">{{
              getAboutLength
            }}</span>
            / 200</span
          >
          <textarea
            class="about"
            spellcheck="false"
            v-model.trim="tempValues!.about"
          ></textarea>
        </div>
      </div>
      <div class="info">
        <div
          class="section"
          v-for="(item, index) in userCardOptions"
          :key="index"
        >
          <div class="name no-txt-overflow">
            <span class="label">{{ item.placeholder }}</span>
            <span class="value no-txt-overflow">{{
              item.source === "password"
                ? fillerPassword
                : tempValues[item.source as TempValuesSource]
            }}</span>
          </div>
          <button
            class="button-small"
            @click="
              openModal({
                placeholder: item.placeholder,
                title: item.title,
                validate: item.validate,
                inputType: item.inputType,
                source: item.source,
              })
            "
          >
            Edit
          </button>
        </div>
      </div>
      <div class="buttons">
        <button class="button-small undo" :disabled="!changed" @click="undo()">
          Discard
        </button>
        <button
          class="button-small"
          :disabled="!changed || getAboutLength > 200 || waiting"
          @click="save()"
        >
          Save
        </button>
      </div>
    </div>
    <SettingModalComponent
      :show="modal.show"
      :placeholder="modal.placeholder"
      :validate="modal.validate"
      :title="modal.title"
      :inputType="modal.inputType ?? 'text'"
      @close="modal.show = false"
      @update="(val) => {
        tempValues[modal.source as TempValuesSource] = val;
        closeModal()
      }"
    ></SettingModalComponent>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/main.less";

.category {
  .user-card {
    border-radius: 10px;
    background: @background;
    padding: 0.7rem;
    display: flex;
    flex-direction: column;
    row-gap: 0.5rem;
    max-width: 25rem;

    .head {
      display: flex;
      column-gap: 1rem;
      justify-content: space-around;
      align-items: center;

      .about-wrapper {
        width: 100%;
        background: @background-light;
        border: 1px solid @special;
        border-radius: 5px;
        padding: 0.3rem;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto auto;
        cursor: text;

        .label {
          font-size: 0.5rem;
          font-weight: 600;
          padding-bottom: 0.3rem;
        }

        .count {
          font-size: 0.5rem;
          text-align: right;
        }

        .exceed {
          color: @accent;
        }

        .about {
          background: transparent;
          outline: none;
          border: none;
          height: 2rem;
          resize: none;
          font-size: 0.45rem;
          font-weight: 500;
          justify-content: space-between;
          color: @foreground;
          grid-column-start: 1;
          grid-column-end: 3;
        }

        ::-webkit-scrollbar-thumb {
          background: @background;
        }
      }

      .pfp {
        width: 3.9rem;
        height: 3.9rem;
        min-width: 3.9rem;
        min-height: 3.9rem;
        padding: 0.5rem;
        position: relative;

        img {
          border-radius: 1000px;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          border-radius: 1000px;

          cursor: pointer;
        }
      }
    }

    .info {
      border-radius: 5px;
      display: flex;
      flex-direction: column;
      row-gap: 0.5rem;

      .section {
        background: @background-light;
        padding: 0.3rem;
        border-radius: 5px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;

        .name {
          display: flex;
          flex-direction: column;

          .label {
            font-size: 0.45rem;
            font-weight: 700;
          }

          .value {
            font-size: 0.5rem;
            color: @foreground;
          }
        }
      }
    }

    .buttons {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      column-gap: 0.5rem;
    }
  }
}

.undo {
  background: @accent;
}
</style>
