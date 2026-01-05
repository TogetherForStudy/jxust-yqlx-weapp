<template>
  <view class="h-screen bg-gray-50 flex flex-col">
    <!-- 头部 -->
    <view class="bg-white px-4 shadow-sm shrink-0">
      <view class="flex justify-between items-center">
        <text class="text-lg font-semibold text-gray-800">权限管理</text>
        <view class="flex items-center space-x-2">
          <view @tap="refreshData" class="p-2">
            <text class="i-lucide-refresh-cw w-5 h-5 text-gray-600"></text>
          </view>
        </view>
      </view>
    </view>

    <!-- 操作按钮区域 -->
    <view class="bg-white border-b border-gray-100 shrink-0">
      <view class="grid grid-cols-3 divide-x divide-gray-100">
        <view
          class="px-4 py-3 text-base flex flex-col items-center justify-center active:bg-gray-50"
          @tap="showUpdateUserRolesModal"
        >
          <text class="i-lucide-user-plus mb-1"></text>
          <text class="text-xs text-gray-800 text-center">更新用户角色</text>
        </view>
      </view>
    </view>

    <!-- Tab 切换 -->
    <view class="bg-white border-b border-gray-100 shrink-0">
      <view class="flex">
        <view
          v-for="tab in tabs"
          :key="tab.value"
          @tap="activeTab = tab.value"
          :class="[
            'flex-1 py-3 text-center border-b-2 transition-colors',
            activeTab === tab.value
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600',
          ]"
        >
          <text class="text-sm font-medium">{{ tab.label }}</text>
        </view>
      </view>
    </view>

    <view class="flex-1 h-[1px]">
      <scroll-view :scroll-y="true" class="h-full">
        <view class="p-4">
          <!-- 角色列表 -->
          <view v-if="activeTab === 'roles'" class="bg-white rounded-lg shadow-sm overflow-hidden">
            <view v-if="loading" class="px-4 py-8 text-center">
              <view class="inline-flex items-center space-x-2">
                <view class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></view>
                <text class="text-gray-500 text-sm">加载中...</text>
              </view>
            </view>
            <view v-else-if="roles.length === 0" class="px-4 py-8 text-center">
              <text class="text-gray-400 text-sm">暂无角色数据</text>
            </view>
            <view v-else class="divide-y divide-gray-100">
              <view
                v-for="role in roles"
                :key="role.id"
                class="px-4 py-3"
              >
                <view class="flex justify-between items-start">
                  <view class="flex-1">
                    <view class="flex items-center mb-1">
                      <text class="text-base font-medium text-gray-800 mr-2">{{ role.name }}</text>
                      <view class="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">
                        {{ role.role_tag }}
                      </view>
                    </view>
                    <text v-if="role.description" class="text-sm text-gray-600">
                      {{ role.description }}
                    </text>
                    <text v-else class="text-sm text-gray-400">暂无描述</text>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 权限列表 -->
          <view v-if="activeTab === 'permissions'" class="bg-white rounded-lg shadow-sm overflow-hidden">
            <view v-if="loading" class="px-4 py-8 text-center">
              <view class="inline-flex items-center space-x-2">
                <view class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></view>
                <text class="text-gray-500 text-sm">加载中...</text>
              </view>
            </view>
            <view v-else-if="permissions.length === 0" class="px-4 py-8 text-center">
              <text class="text-gray-400 text-sm">暂无权限数据</text>
            </view>
            <view v-else class="divide-y divide-gray-100">
              <view
                v-for="permission in permissions"
                :key="permission.id"
                class="px-4 py-3"
              >
                <view class="flex justify-between items-start">
                  <view class="flex-1">
                    <view class="flex items-center mb-1">
                      <text class="text-base font-medium text-gray-800 mr-2">{{ permission.name }}</text>
                      <view class="px-2 py-0.5 bg-green-100 text-green-600 rounded text-xs">
                        {{ permission.permission_tag }}
                      </view>
                    </view>
                    <text v-if="permission.description" class="text-sm text-gray-600">
                      {{ permission.description }}
                    </text>
                    <text v-else class="text-sm text-gray-400">暂无描述</text>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 角色与权限对应列表 -->
          <view v-if="activeTab === 'rolePermissions'" class="bg-white rounded-lg shadow-sm overflow-hidden">
            <view v-if="loading" class="px-4 py-8 text-center">
              <view class="inline-flex items-center space-x-2">
                <view class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></view>
                <text class="text-gray-500 text-sm">加载中...</text>
              </view>
            </view>
            <view v-else-if="rolePermissions.length === 0" class="px-4 py-8 text-center">
              <text class="text-gray-400 text-sm">暂无角色权限数据</text>
            </view>
            <view v-else class="divide-y divide-gray-100">
              <view
                v-for="item in rolePermissions"
                :key="item.role.id"
                class="px-4 py-4"
              >
                <!-- 角色信息 -->
                <view class="mb-3">
                  <view class="flex items-center mb-1">
                    <text class="text-base font-semibold text-gray-800 mr-2">{{ item.role.name }}</text>
                    <view class="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">
                      {{ item.role.role_tag }}
                    </view>
                  </view>
                  <text v-if="item.role.description" class="text-sm text-gray-600">
                    {{ item.role.description }}
                  </text>
                </view>

                <!-- 权限列表 -->
                <view v-if="item.permissions && item.permissions.length > 0" class="ml-2">
                  <text class="text-xs text-gray-500 mb-2 block">拥有权限 ({{ item.permissions.length }})：</text>
                  <view class="space-y-2">
                    <view
                      v-for="permission in item.permissions"
                      :key="permission.id"
                      class="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <view class="flex items-center justify-between">
                        <view class="flex-1">
                          <view class="flex items-center mb-1">
                            <text class="text-sm font-medium text-gray-800 mr-2">{{ permission.name }}</text>
                            <view class="px-2 py-0.5 bg-green-100 text-green-600 rounded text-xs">
                              {{ permission.permission_tag }}
                            </view>
                          </view>
                          <text v-if="permission.description" class="text-xs text-gray-500">
                            {{ permission.description }}
                          </text>
                        </view>
                      </view>
                    </view>
                  </view>
                </view>
                <view v-else class="ml-2">
                  <text class="text-xs text-gray-400">该角色暂无权限</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 更新用户角色弹窗 -->
    <view
      v-if="showUpdateUserRolesForm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @tap="hideUpdateUserRolesModal"
    >
      <view @tap.stop="" class="bg-white rounded-2xl mx-4 w-full max-w-md">
        <view class="p-6">
          <text class="text-lg font-semibold text-gray-800 block mb-4">
            更新用户角色
          </text>

          <view class="space-y-4">
            <!-- 用户ID输入 -->
            <view>
              <text class="block text-sm font-medium text-gray-700 mb-1">
                用户ID *
              </text>
              <input
                v-model="userRolesForm.userId"
                placeholder="请输入用户ID"
                type="number"
                class="border-solid border-[1px] border-gray-300 rounded-lg p-2"
              />
            </view>

            <!-- 角色选择 -->
            <view>
              <text class="block text-sm font-medium text-gray-700 mb-2">
                选择角色 *
              </text>
              <view class="space-y-2 max-h-48 overflow-y-auto">
                <view
                  v-for="role in roles"
                  :key="role.id"
                  @tap="toggleRole(role.id)"
                  :class="[
                    'px-3 py-2 rounded-lg border-solid border-[1px]',
                    selectedRoleIds.includes(role.id)
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-gray-50 border-gray-200',
                  ]"
                >
                  <view class="flex items-center justify-between">
                    <view>
                      <text
                        :class="[
                          'text-sm font-medium',
                          selectedRoleIds.includes(role.id)
                            ? 'text-blue-700'
                            : 'text-gray-700',
                        ]"
                      >
                        {{ role.name }}
                      </text>
                      <text
                        :class="[
                          'text-xs block mt-0.5',
                          selectedRoleIds.includes(role.id)
                            ? 'text-blue-600'
                            : 'text-gray-500',
                        ]"
                      >
                        {{ role.role_tag }}
                      </text>
                    </view>
                    <view
                      v-if="selectedRoleIds.includes(role.id)"
                      class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                    >
                      <text class="i-lucide-check text-white text-xs"></text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <view class="flex space-x-3 mt-6">
            <view
              @tap="hideUpdateUserRolesModal"
              class="flex-1 py-2 px-4 bg-gray-100 text-gray-600 rounded-lg text-center"
            >
              取消
            </view>
            <view
              @tap="confirmUpdateUserRoles"
              :class="[
                'flex-1 py-2 px-4 rounded-lg text-center text-white',
                canUpdateUserRoles ? 'bg-blue-500' : 'bg-gray-300',
              ]"
            >
              {{ updating ? "更新中..." : "更新" }}
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import Taro from "@tarojs/taro";
import { useAuthStore } from "../../../stores/auth";
import { rbacAPI } from "../../../api/index";

// Store
const authStore = useAuthStore();

// Tab 配置
const tabs = [
  { label: '角色列表', value: 'roles' },
  { label: '权限列表', value: 'permissions' },
  { label: '角色权限', value: 'rolePermissions' },
];

// 响应式数据
const activeTab = ref('roles');
const roles = ref([]);
const permissions = ref([]);
const rolePermissions = ref([]);
const loading = ref(false);
const updating = ref(false);

// 弹窗状态
const showUpdateUserRolesForm = ref(false);
const userRolesForm = ref({
  userId: "",
});
const selectedRoleIds = ref([]);

// 计算属性
const canUpdateUserRoles = computed(() => {
  return (
    userRolesForm.value.userId &&
    userRolesForm.value.userId.trim() !== "" &&
    selectedRoleIds.value.length > 0 &&
    !updating.value
  );
});

// API调用方法
const fetchRoles = async () => {
  try {
    const response = await rbacAPI.getRoles();
    roles.value = response || [];
  } catch (error) {
    console.error("获取角色列表失败:", error);
    Taro.showToast({
      title: error.message || "获取角色列表失败",
      icon: "error",
    });
  }
};

const fetchPermissions = async () => {
  try {
    const response = await rbacAPI.getPermissions();
    permissions.value = response || [];
  } catch (error) {
    console.error("获取权限列表失败:", error);
    Taro.showToast({
      title: error.message || "获取权限列表失败",
      icon: "error",
    });
  }
};

const fetchRolePermissions = async () => {
  try {
    const response = await rbacAPI.getRolesPermissions();
    // 处理不同的响应格式：可能是 response.roles 或 response.data?.roles
    rolePermissions.value = response?.roles || response?.data?.roles || [];
  } catch (error) {
    console.error("获取角色权限关联失败:", error);
    Taro.showToast({
      title: error.message || "获取角色权限关联失败",
      icon: "error",
    });
  }
};

const refreshData = async () => {
  loading.value = true;
  try {
    await Promise.all([fetchRoles(), fetchPermissions(), fetchRolePermissions()]);
    Taro.showToast({
      title: "刷新成功",
      icon: "success",
    });
  } finally {
    loading.value = false;
  }
};

// 更新用户角色相关方法
const showUpdateUserRolesModal = () => {
  if (roles.value.length === 0) {
    Taro.showToast({
      title: "请先加载角色列表",
      icon: "none",
    });
    return;
  }
  userRolesForm.value = {
    userId: "",
  };
  selectedRoleIds.value = [];
  showUpdateUserRolesForm.value = true;
};

const hideUpdateUserRolesModal = () => {
  showUpdateUserRolesForm.value = false;
  userRolesForm.value = {
    userId: "",
  };
  selectedRoleIds.value = [];
};

const toggleRole = (roleId) => {
  const index = selectedRoleIds.value.indexOf(roleId);
  if (index > -1) {
    selectedRoleIds.value.splice(index, 1);
  } else {
    selectedRoleIds.value.push(roleId);
  }
};

const confirmUpdateUserRoles = async () => {
  if (!canUpdateUserRoles.value) return;

  updating.value = true;
  try {
    const userId = parseInt(userRolesForm.value.userId.trim());
    if (isNaN(userId)) {
      Taro.showToast({
        title: "请输入有效的用户ID",
        icon: "none",
      });
      return;
    }

    await rbacAPI.updateUserRoles(userId, {
      role_ids: selectedRoleIds.value,
    });

    Taro.showToast({
      title: "更新成功",
      icon: "success",
    });

    hideUpdateUserRolesModal();
  } catch (error) {
    Taro.showToast({
      title: error.message || "更新失败",
      icon: "error",
    });
  } finally {
    updating.value = false;
  }
};

// 生命周期
onMounted(async () => {
  // 检查管理员权限
  if (!authStore.isAdmin) {
    Taro.showToast({
      title: "权限不足",
      icon: "error",
    });
    Taro.navigateBack();
    return;
  }

  loading.value = true;
  try {
    await Promise.all([fetchRoles(), fetchPermissions(), fetchRolePermissions()]);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
</style>

