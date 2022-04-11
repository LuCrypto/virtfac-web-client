# virtfac-web-server

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run client
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### ESLint auto fix on save
Go to File > Preferences > Settings
Searching for "Code Actions On Save"
Click on "Edit in settings.json" link
And copy past : 
```json
"editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
},
"eslint.validate": ["javascript"]
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
