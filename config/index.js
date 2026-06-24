import { defineConfig } from '@tarojs/cli'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'
import devConfig from './dev'
import prodConfig from './prod'

const loadLocalEnv = () => {
  const envFiles = ['.env.local', '.env']

  envFiles.forEach((fileName) => {
    const filePath = resolve(process.cwd(), fileName)
    if (!existsSync(filePath)) return

    readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .forEach((line) => {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) return

        const separatorIndex = trimmed.indexOf('=')
        if (separatorIndex === -1) return

        const key = trimmed.slice(0, separatorIndex).trim()
        const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '')

        if (key && process.env[key] === undefined) {
          process.env[key] = value
        }
      })
  })
}

loadLocalEnv()

const API_BASE_URL = process.env.TARO_APP_API_BASE_URL || ''

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig(async (merge, { command, mode }) => {
  const baseConfig = {
    projectName: 'jxust-yqlx-weapp',
    date: '2025-9-1',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: [],
    defineConstants: {
      API_BASE_URL: JSON.stringify(API_BASE_URL)
    },
    copy: {
      patterns: [
        {
          from: resolve(process.cwd(), 'src/theme.json'),
          to: resolve(process.cwd(), 'dist/theme.json')
        },
        {
          from: resolve(process.cwd(), 'src/assets/icons'),
          to: resolve(process.cwd(), 'dist/assets/icons')
        }
      ],
      options: {
      }
    },
    framework: 'vue3',
    compiler: {
      type: 'vite',
      vitePlugins: [
        WeappTailwindcss({
          // rem转rpx
          rem2rpx: true,
          // px转rpx，覆盖 Tailwind 任意值中的 px
          px2rpx: true,
          cssEntries: [
            resolve(process.cwd(), 'src/app.css')
          ]
        })
      ]
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {

          }
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      }
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',

      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: 'css/[name].[hash].css',
        chunkFilename: 'css/[name].[chunkhash].css'
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {}
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      }
    },
    rn: {
      appName: 'taroDemo',
      postcss: {
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        }
      }
    }
  }
  if (process.env.NODE_ENV === 'development') {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig)
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig)
})
