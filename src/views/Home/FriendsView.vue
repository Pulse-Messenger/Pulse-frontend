<script setup lang="ts">
import { useCommonStore } from "@/stores/CommonStore";
import { storeToRefs } from "pinia";

const friendships = storeToRefs(useCommonStore()).friendsData;
</script>

<template>
  <div class="friendlist">
    <table>
      <tr>
        <td>User</td>
        <td></td>
      </tr>
      <tr v-for="(friend, index) in friendships" :key="index">
        
      </tr>
    </table>
  </div>
</template>

<style lang="less" scoped>
@import "@/assets/base.less";

.friendlist {
}
</style>
