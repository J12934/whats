# What is? 🤔

Simple and fast identification of Web Services, build on top of Wappalyzer

![Cli Example](https://raw.githubusercontent.com/J12934/whats/master/cli/docs/demo.gif)

## Installation

```bash
 $ npm install -g @j12934/whatis
```

### Usage

```bash
 $ whats https://gitlab.com
```

To use the outputs in other commands use the `--json` flag which outputs the results as json into `stdout`. You can then extract the results with `jq`, `fx` or what ever tool you like.

### Usgae in Node.js

You can call whatis directly by using the `@j12934/whatis-core` package.
