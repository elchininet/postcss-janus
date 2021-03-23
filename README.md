# PostCSS Janus

[PostCSS] plugin to create RTL rules using [CSSJanus].

[PostCSS]: https://github.com/postcss/postcss
[CSSJanus]: https://github.com/cssjanus/cssjanus

>This project is not longer maintained. If you want to create `ltr` and `rtl` rules at the same time, use [postcss-rtlcss](https://github.com/elchininet/postcss-rtlcss) instead.

Install
---

#### npm

```bash
nmp install postcss-janus --save-dev
```

#### yarn

```bash
yarn add postcss-janus -d
```

Examples
---

#### input

```css
.example {
  background-color: #FFF;
  background-image: url("/folder/subfolder/icons/ltr/chevron.png");
  border-radius: 0 2px 0 8px;
  color: #666;
  padding-right: 20px;
  text-align: left;
  transform: translate(-50%, 50%);
  width: 100%;
}
```

#### output

```css
.example {
  background-color: #FFF;
  background-image: url("/folder/subfolder/icons/ltr/chevron.png");
  border-radius: 0 2px 0 8px;
  color: #666;
  padding-right: 20px;
  text-align: left;
  transform: translate(-50%, 50%);
  width: 100%;
}
.rtl .example  {
    border-radius: 2px 0 8px 0;
    padding-right: unset;
    padding-left: 20px;
    text-align: right;
    transform: translate(50%, 50%);
}
```

Basic usage
---

#### Using postcss JavaScript API

```bash
const postcss = require('postcss');
const cssJanus = require('postcss-janus');

postcss( [ cssJanus(options) ] );
```

#### Using postcss-loader in Webpack

```bash
rules: [
    {
        test: /\.css$/,
        use: [
            { loader: 'style-loader' },
            { loader: 'css-loader' },
            {
                loader: 'postcss-loader',
                options: {
                    ident: 'postcss',
                    plugins: () => [ require('postcss-janus')(options) ]
                }
            }
        ]
    }
]
```

Options
---

| Option             | Default  | Type                | Description                                                  |
| ------------------ | -------- | ------------------- | ------------------------------------------------------------ |
| prefixes           | `.rtl`   | `string` or `array` | Indicates the prefixes that should be added to the RTL rules |
| swapLtrRtlInUrl    | `false`  | `boolean`           | Swap `ltr` and `rtl` strings in URLs                         |
| swapLeftRightInUrl | `false`  | `boolean`           | Swap `left` and `right` strings in URLs                      |

Directives
---

Directives should be added as comments before a CSS rule block or a property, e.g:

```css
/* @ruleDirective */
.example {
    /* @propertyDirective */
    color: white;
}
```

| Directive           | Description                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| @noflip             | Avoid flipping certain CSS property or an entire rule block                                              |
| @swapLtrRtlInUrl    | Swap `ltr` and `rtl` strings in a certain property (it will ignore the global `swapLtrRtlInUrl` option       |
| @swapLeftRightInUrl | Swap `left` and `right` strings in a certain property (it will ignore the global `swapLeftRightInUrl` option |


If you do not use PostCSS, add it according to [official docs]
and set this plugin in settings.

[official docs]: https://github.com/postcss/postcss#usage
