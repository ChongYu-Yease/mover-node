import typescript from 'rollup-plugin-typescript2'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import nodeResolve from 'rollup-plugin-node-resolve'
import vue from 'rollup-plugin-vue'
import filesize from 'rollup-plugin-filesize'
import buble from 'rollup-plugin-buble'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import replace from 'rollup-plugin-replace'
import del from 'rollup-plugin-delete'
import path from 'path'
const getPath = (_path) => path.resolve(__dirname, _path)
const isProduction = process.env.NODE_ENV === 'production'

export default async () => ({
    onwarn: function(message) {
        if (
            /The 'this' keyword is equivalent to 'undefined' at the top level of an ES module, and has been rewritten./.test(
                message
            )
        ) {
            return
        }
        console.error(message)
    },
    input: 'src/main.ts',
    output: [
        {
            file: 'dist/index.umd.js',
            format: 'umd',
            name: 'moverNode',
            sourcemap: false,
            globals: { vue: 'Vue' },
        },
        {
            file: 'demo/index.umd.js',
            format: 'umd',
            name: 'moverNode',
            sourcemap: false,
            globals: { vue: 'Vue' },
        },
        {
            file: 'dist/index.esm.js',
            format: 'esm',
            name: 'moverNode',
            sourcemap: false,
            globals: { vue: 'Vue' },
        },
    ],
    plugins: [
        //源代码更改马上清空dist文件夹下面打包过的文件 防止代码冗余
        del({
            targets: [
                './dist/index.esm.js',
                './dist/index.umd.js',
                './demo/index.umd.js',
            ],
        }),
        json(),
        nodeResolve(),
        commonjs(),
        replace({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        vue({
            css: true,
            compileTemplate: true,
        }),
        typescript({
            useTsconfigDeclarationDir: true,
            extensions: ['.js', '.ts', '.tsx'],
        }),
        buble(),
        // 线上启用压缩模式
        isProduction && (await import('rollup-plugin-terser')).terser(),
        filesize(),
        // 开启服务
        !isProduction &&
            serve({
                open: false,
                host: 'h5.dev.weidian.com',
                port: 9999,
                historyApiFallback: true,
                contentBase: 'demo',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                },
            }),
        // 热更新
        !isProduction && livereload(),
    ],
    external: ['vue'],
})
