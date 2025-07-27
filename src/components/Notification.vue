<template>
  <Teleport to="body">
    <div class="notification-container">
      <Transition
        name="notification"
        appear
        @after-leave="$emit('close')"
      >
        <div
          v-show="visible"
          :class="[
            'notification',
            `notification--${notification.type}`
          ]"
        >
          <div class="notification-icon">
            <component :is="iconComponent" class="w-5 h-5" />
          </div>
          
          <div class="notification-content">
            <div class="notification-title">
              {{ notification.title }}
            </div>
            <div 
              v-if="notification.message" 
              class="notification-message"
            >
              {{ notification.message }}
            </div>
          </div>

          <div class="notification-actions">
            <button
              v-if="notification.action"
              class="notification-action-btn"
              @click="handleAction"
            >
              {{ notification.action.label }}
            </button>
            
            <button
              class="notification-close-btn"
              @click="close"
            >
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>

          <div 
            v-if="notification.duration && notification.duration > 0"
            class="notification-progress"
          >
            <div 
              class="notification-progress-bar"
              :style="{ animationDuration: `${notification.duration}ms` }"
            ></div>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

import type { Notification } from '@/types'

// Props & Emits
interface Props {
  notification: Notification
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

// 响应式数据
const visible = ref(false)
let autoCloseTimer: NodeJS.Timeout | null = null

// 计算图标组件
const iconComponent = computed(() => {
  switch (props.notification.type) {
    case 'success':
      return CheckCircleIcon
    case 'warning':
      return ExclamationTriangleIcon
    case 'error':
      return ExclamationCircleIcon
    case 'info':
    default:
      return InformationCircleIcon
  }
})

// 组件挂载
onMounted(() => {
  // 延迟显示以触发动画
  requestAnimationFrame(() => {
    visible.value = true
  })

  // 设置自动关闭
  if (props.notification.duration && props.notification.duration > 0) {
    autoCloseTimer = setTimeout(() => {
      close()
    }, props.notification.duration)
  }
})

// 组件卸载
onUnmounted(() => {
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer)
  }
})

// 方法
function close() {
  visible.value = false
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer)
    autoCloseTimer = null
  }
}

function handleAction() {
  if (props.notification.action) {
    props.notification.action.handler()
    close()
  }
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  pointer-events: none;
}

.notification {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 320px;
  max-width: 400px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  border-left: 4px solid;
  overflow: hidden;
  pointer-events: auto;
}

.dark .notification {
  background: #1C1C1E;
  color: white;
}

.notification--success {
  border-left-color: #34C759;
}

.notification--warning {
  border-left-color: #FF9500;
}

.notification--error {
  border-left-color: #FF3B30;
}

.notification--info {
  border-left-color: #007AFF;
}

.notification-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.notification--success .notification-icon {
  color: #34C759;
}

.notification--warning .notification-icon {
  color: #FF9500;
}

.notification--error .notification-icon {
  color: #FF3B30;
}

.notification--info .notification-icon {
  color: #007AFF;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.dark .notification-title {
  color: #F9FAFB;
}

.notification-message {
  font-size: 13px;
  color: #6B7280;
  line-height: 1.4;
}

.dark .notification-message {
  color: #9CA3AF;
}

.notification-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.notification-action-btn {
  padding: 6px 12px;
  background: rgba(0, 122, 255, 0.1);
  border: 1px solid rgba(0, 122, 255, 0.2);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #007AFF;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-action-btn:hover {
  background: rgba(0, 122, 255, 0.15);
  border-color: rgba(0, 122, 255, 0.3);
}

.notification-close-btn {
  padding: 4px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #9CA3AF;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #6B7280;
}

.dark .notification-close-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #D1D5DB;
}

.notification-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.dark .notification-progress {
  background: rgba(255, 255, 255, 0.1);
}

.notification-progress-bar {
  height: 100%;
  background: currentColor;
  animation: progressBar linear forwards;
  transform-origin: left;
}

.notification--success .notification-progress-bar {
  background: #34C759;
}

.notification--warning .notification-progress-bar {
  background: #FF9500;
}

.notification--error .notification-progress-bar {
  background: #FF3B30;
}

.notification--info .notification-progress-bar {
  background: #007AFF;
}

/* 动画 */
.notification-enter-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.notification-leave-active {
  transition: all 0.2s ease-in;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

@keyframes progressBar {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}
</style>