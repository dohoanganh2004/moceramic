const withImages = require('next-images')
const withNextCircularDeps = require('next-circular-dependency')

// Some admin/back-office pages render "/uploads/xxx.png" URLs straight from
// the API response (not through utils/resolveAssetUrl). From the Next.js
// origin (localhost:3000) those 404 since this server has no such route, so
// proxy them through to the backend that actually serves the files.
const backendOrigin = process.env.NODE_ENV === 'production'
    ? 'https://flatlogic-ecommerce-backend.herokuapp.com'
    : 'http://localhost:8080';

module.exports = withImages({
    async rewrites() {
        return [
            {
                source: '/uploads/:path*',
                destination: `${backendOrigin}/uploads/:path*`,
            },
        ];
    },
    // webpack: (config, { isServer }) => {
    //     config.externals = ["webpack", "readable-stream", "d3-interpolate", "next"]
    //     return config
    // }
})

