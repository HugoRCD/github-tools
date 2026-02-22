<script setup lang="ts">
const appConfig = useAppConfig()
</script>

<template>
  <div class="flex items-center gap-2">
    <UIcon name="i-simple-icons-github" class="size-5 text-white" />
    <span class="font-semibold text-white">{{ appConfig.docus?.name || 'GitHub Tools' }}</span>
  </div>
</template>
