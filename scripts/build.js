import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { rollup } from 'rollup'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
const __dirname = dirname(fileURLToPath(import.meta.url))

const filePath = join(__dirname, '..', 'package.json')
const fileContent = readFileSync(filePath, 'utf8')
const pkg = JSON.parse(fileContent)

const isProduction = process.env.NODE_ENV === 'production'
const sourcemap = !isProduction

const inputOptions = {
    input: resolve(__dirname, '..', 'src', 'index.ts'),
    plugins: [
        typescript({
            tsconfig: resolve(__dirname, '..', 'tsconfig.json'),
        }),
        commonjs(),
        nodeResolve(),
    ],
    watch: {
        include: 'src/**',
    }
}

const outputOptions = [
    {
        file: resolve(__dirname, '..', 'dist', `${pkg.name.replace('/', '-')}.js`),
        format: 'cjs',
        exports: 'auto',
        sourcemap
    },
    {
        file: resolve(__dirname, '..', 'dist', `${pkg.name.replace('/', '-')}.mjs`),
        format: 'esm',
        sourcemap
    },
]

async function build() {
    const watchMode = process.argv.includes('-w')
    const bundle = await rollup({
        ...inputOptions,
        watch: watchMode ? inputOptions.watch : undefined,
    })
    for (const options of outputOptions) {
        await bundle.write(options)
    }
    if (watchMode) {
        bundle.watch({
            include: 'src/**',
            exclude: 'node_modules/**',
        })
    }
}

build()
