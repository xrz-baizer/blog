<script setup lang="ts">
import { useData } from 'vitepress'
import { formatTimestamp } from './function.ts'
import { computed } from 'vue'
const { page } = useData()

const date = computed(
    () => formatTimestamp(page.value.lastUpdated!)
)

</script>

<template>
    <div v-if="date" class="LastUpdated">
        <p>Last Updated: {{ date }}</p>
    </div>
</template>

<style >
.LastUpdated {
    margin-top: 8px;
    margin-left: -10%;
    font-size: .9rem;
    float: right;
    color: rgba(60, 60, 67, 0.56);
}

/* 超过640px不显示 */
@media (max-width: 640px) {
    .LastUpdated {
        display: none;
    }
}
</style>