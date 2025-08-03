import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// 从 Font Awesome 免费版本导入所需图标
import {
  // 搜索和导航
  faSearch,
  faChartBar,
  faCopy,
  faFolder,
  faBolt,
  faCog,
  faPlay,
  faEdit,
  faPlus,
  faGlobe,
  
  // 警告和状态
  faExclamationTriangle,
  faExclamationCircle,
  faCheckCircle,
  faInfoCircle,
  faTimes,
  
  // 操作
  faCloudUploadAlt,
  faCamera,
  faSync,
  faTrash,
  faDownload,
  faUpload,
  faTerminal,
  faArchive
} from '@fortawesome/free-solid-svg-icons'

// 注册图标到库中
library.add(
  // 搜索和导航
  faSearch,
  faChartBar,
  faCopy,
  faFolder,
  faBolt,
  faCog,
  faPlay,
  faEdit,
  faPlus,
  faGlobe,
  
  // 警告和状态
  faExclamationTriangle,
  faExclamationCircle,
  faCheckCircle,
  faInfoCircle,
  faTimes,
  
  // 操作
  faCloudUploadAlt,
  faCamera,
  faSync,
  faTrash,
  faDownload,
  faUpload,
  faTerminal,
  faArchive
)

// 导出 FontAwesome 组件
export { FontAwesomeIcon }

// 图标名称映射（从 Heroicons 到 Font Awesome）
export const iconMap = {
  // 基础图标
  'MagnifyingGlassIcon': 'search',
  'ChartBarIcon': 'chart-bar',
  'DocumentDuplicateIcon': 'copy',
  'FolderIcon': 'folder',
  'BoltIcon': 'bolt',
  'CogIcon': 'cog',
  'Cog6ToothIcon': 'cog',
  'PlayIcon': 'play',
  'PencilIcon': 'edit',
  'PlusIcon': 'plus',
  'GlobeAltIcon': 'globe',
  
  // 状态图标
  'ExclamationTriangleIcon': 'exclamation-triangle',
  'ExclamationCircleIcon': 'exclamation-circle',
  'CheckCircleIcon': 'check-circle',
  'InformationCircleIcon': 'info-circle',
  'XMarkIcon': 'times',
  
  // 操作图标
  'CloudArrowUpIcon': 'cloud-upload-alt',
  'CameraIcon': 'camera',
  'ArrowPathIcon': 'sync',
  'TrashIcon': 'trash',
  'ArrowDownTrayIcon': 'download',
  'ArrowUpTrayIcon': 'upload',
  'CommandLineIcon': 'terminal',
  'ArchiveBoxIcon': 'archive'
} 