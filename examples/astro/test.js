import DynamicPublicDirectory from "vite-multiple-assets";

export default () => ({
    name: 'test1',
    hooks: {
        'astro:server:setup': (a) => {
            console.log('a',a)
            updateConfig({
                vite: {
                    plugins: [DynamicPublicDirectory([
                        "public2"
                    ])],
                }
            })
        }
    }
})
