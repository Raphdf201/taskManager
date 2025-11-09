# YO SAMY

## Setup
```shell
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
\. "$HOME/.nvm/nvm.sh"
nvm install 24
corepack enable pnpm
pnpm setup
pnpm install
```

## Run
### Pr tester (dev)
`pnpm run dev`

### Avant commit (build)
`pnpm run build`
