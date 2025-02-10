import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rollupOptions: {
            external: [
                /^wix\/scripts\/custom-element-asset\//,  // ✅ Ignore Wix-generated script imports
                /^wix\/html\/custom-element-asset\//      // ✅ Ignore Wix-generated HTML imports
            ]
        }
    }
});
