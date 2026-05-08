import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/**
 * SimKos design tokens — derived from DESIGN.md
 * (Personal Computer for Mac vibe, dark, accessibility-first)
 *
 * Reference all values via Tailwind utilities, never raw hex in Blade.
 * @type {import('tailwindcss').Config}
 */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
    ],

    theme: {
        extend: {
            fontFamily: {
                // PPLX Sans is not free; use system stack matching its metrics + Figtree fallback.
                sans: [
                    'PPLX Sans',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    '"Helvetica Neue"',
                    'Figtree',
                    ...defaultTheme.fontFamily.sans,
                ],
            },
            fontSize: {
                // px scale from DESIGN.md
                'xs':   ['10px',   { lineHeight: '14px' }],
                'sm':   ['12px',   { lineHeight: '18px' }],
                'md':   ['14px',   { lineHeight: '20px' }],
                'lg':   ['15px',   { lineHeight: '22px' }],
                'xl':   ['16px',   { lineHeight: '24px' }],
                '2xl':  ['18px',   { lineHeight: '28.8px' }],
                '3xl':  ['20px',   { lineHeight: '30px' }],
                '4xl':  ['22px',   { lineHeight: '32px' }],
                '5xl':  ['28px',   { lineHeight: '36px', letterSpacing: '-0.01em' }],
                '6xl':  ['36px',   { lineHeight: '40px', letterSpacing: '-0.02em' }],
                '7xl':  ['48px',   { lineHeight: '52px', letterSpacing: '-0.02em' }],
            },
            spacing: {
                // px scale from DESIGN.md (overlays Tailwind defaults that aren't on the scale)
                '0.5': '2px',
                '1':   '4px',
                '2':   '7px',
                '3':   '10px',
                '4':   '12px',
                '5':   '16px',
                '6':   '20px',
                '7':   '22px',
                '8':   '24px',
                '9':   '32px',
                '10':  '40px',
                '11':  '48px',
                '12':  '56px',
                '14':  '72px',
                '16':  '88px',
            },
            colors: {
                // Tokens map to DESIGN.md
                fg: {
                    DEFAULT:   '#f5f3ed',
                    primary:   '#f5f3ed',
                    secondary: '#ffffff',
                    tertiary:  '#b5b3ab',
                    inverse:   '#27251e',
                },
                surface: {
                    base:   '#000000',
                    muted:  '#1a1918',
                    raised: '#20808d',
                },
                border: {
                    DEFAULT: '#60584d',
                    muted:   '#d6d5d4',
                },
                state: {
                    success: '#1f8f5b',
                    warning: '#c89e2a',
                    danger:  '#d24432',
                    info:    '#20808d',
                },
            },
            borderRadius: {
                'none': '0',
                'xs':   '12px',
                'sm':   '16px',  // primary card/input radius from DESIGN.md
                'md':   '16px',
                'lg':   '20px',
                'pill': '9999px',
                'full': '9999px',
            },
            boxShadow: {
                '1': '0px 2px 8px 0px rgba(0,0,0,0.08), 0px 8px 32px 0px rgba(0,0,0,0.08)',
                '2': '0px 4px 24px -2px rgba(32,128,141,0.4), 0px 0px 0px 1px rgba(32,128,141,0.2), inset 0px 1px 0px 0px rgba(255,255,255,0.15)',
                '3': '0px 2px 8px -2px rgba(0,0,0,0.08), inset 0px 1px 0px 0px rgba(255,255,255,0.5)',
                '4': '0px 40px 80px 0px rgba(0,0,0,0.4), 0px 8px 24px 0px rgba(0,0,0,0.25)',
                'focus': '0 0 0 2px #000000, 0 0 0 4px #20808d',
            },
            transitionDuration: {
                'instant': '120ms',
                'fast':    '180ms',
                'normal':  '240ms',
                'slow':    '250ms',
                'slower':  '300ms',
                'step6':   '600ms',
            },
            transitionTimingFunction: {
                'standard': 'cubic-bezier(.2,.8,.2,1)',
            },
        },
    },

    plugins: [forms],
};
