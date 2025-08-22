export const manifestForPlugIn = {
    registerType: 'prompt',
    includeAssests: ['favicon.ico', "apple-touc-icon.png", "masked-icon.svg"],
    manifest: {
        name: "ProcurePact",
        short_name: "ProcurePact",
        description: "Steamline cross-border procurement!",
        icons: [{
                src: '/android-chrome-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'favicon'
            },
            {
                src: '/android-chrome-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'favicon'
            },
            {
                src: '/apple-touch-icon.png',
                sizes: '180x180',
                type: 'image/png',
                purpose: 'apple touch icon',
            },
            {
                src: '/maskable_icon.png',
                sizes: '480x480',
                type: 'image/png',
                purpose: 'any maskable',
            }
        ],
        theme_color: '#171717',
        background_color: '#f0e7db',
        display: "standalone",
        scope: '/',
        start_url: "/",
        orientation: 'portrait'
    }
}