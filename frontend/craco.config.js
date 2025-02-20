import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default {
  style: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
}
