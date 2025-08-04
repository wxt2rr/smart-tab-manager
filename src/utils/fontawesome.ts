import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// 从 Font Awesome 免费版本导入所需图标
import {
  faPlus,
  faFolder,
  faFolderOpen,
  faPlay,
  faEdit,
  faCopy,
  faExclamationTriangle,
  faTimes,
  faSearch,
  faFilter,
  faSort,
  faSortAlphaDown,
  faSortAlphaUp,
  faGlobe,
  faCloudUploadAlt,
  faCamera,
  faSync,
  faTrash,
  faBolt,
  faExternalLinkAlt,
  faCog,
  faTerminal,
  faArchive,
  faInfoCircle,
  faDownload,
  faUpload
} from '@fortawesome/free-solid-svg-icons'

// 注册图标到库中
library.add(
  faPlus,
  faFolder,
  faFolderOpen,
  faPlay,
  faEdit,
  faCopy,
  faExclamationTriangle,
  faTimes,
  faSearch,
  faFilter,
  faSort,
  faSortAlphaDown,
  faSortAlphaUp,
  faGlobe,
  faCloudUploadAlt,
  faCamera,
  faSync,
  faTrash,
  faBolt,
  faExternalLinkAlt,
  faCog,
  faTerminal,
  faArchive,
  faInfoCircle,
  faDownload,
  faUpload
)

// 导出 FontAwesome 组件
export { FontAwesomeIcon }

// 图标名称映射（从 Heroicons 到 Font Awesome）
export const iconMap: Record<string, string> = {
  // 基础图标
  'PlusIcon': 'plus',
  'FolderIcon': 'folder',
  'FolderOpenIcon': 'folder-open',
  'PlayIcon': 'play', 
  'PencilIcon': 'edit',
  'DocumentDuplicateIcon': 'copy',
  'ExclamationTriangleIcon': 'exclamation-triangle',
  'XMarkIcon': 'times',
  'MagnifyingGlassIcon': 'search',
  'FunnelIcon': 'filter',
  'BarsArrowDownIcon': 'sort',
  'BarsArrowUpIcon': 'sort-alpha-down',
  'Bars3BottomLeftIcon': 'sort-alpha-up',
  'GlobeAltIcon': 'globe',
  'CloudArrowUpIcon': 'cloud-upload-alt',
  'CameraIcon': 'camera',
  'ArrowPathIcon': 'sync',
  'TrashIcon': 'trash',
  'BoltIcon': 'bolt',
  'ArrowTopRightOnSquareIcon': 'external-link-alt',
  'CogIcon': 'cog',
  'TerminalIcon': 'terminal',
  'ArchiveBoxIcon': 'archive',
  'InformationCircleIcon': 'info-circle',
  'ArrowDownTrayIcon': 'download',
  'ArrowUpTrayIcon': 'upload'
} 